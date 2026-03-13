import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { registerSchema, loginSchema, verifyEmailSchema } from '../utils/validation';
import { sendVerificationEmail } from '../utils/mail';
import crypto from 'crypto';

/**
 * Authentication Controller
 *
 * SECURITY:
 * - Passwords hashed with bcrypt (10 rounds)
 * - JWT tokens stored in HttpOnly, Secure cookies
 * - Token version tracking for global invalidation
 * - Input validation with Zod schemas
 * - Re-auth tokens for sensitive operations (5min TTL)
 */

const SALT_ROUNDS = 10;

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req: AuthRequest, res: Response) {
  try {
    // Validate input
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: validation.error.errors,
      });
    }

    const { username, email, password, captchaToken } = validation.data;

    // Verify Captcha
    if (process.env.NODE_ENV === 'production' || !!process.env.CAPTCHA_SECRET) {
      const secret = process.env.CAPTCHA_SECRET || '1x0000000000000000000000000000000AA'; // Standard Cloudflare test secret
      const resCaptcha = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, response: captchaToken }),
      });
      const captchaData: any = await resCaptcha.json();

      if (!captchaData.success) {
        return res.status(400).json({ message: 'Invalid captcha verification' });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          existingUser.email === email ? 'Email already registered' : 'Username already taken',
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate verification tokens
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    // Valid for 24h
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        role: 'USER', // Default role
        tokenVersion: 0,
        emailVerified: false,
        verificationToken,
        verificationExpires,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      tokenVersion: 0,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      tokenVersion: 0,
    });

    // Set HttpOnly, Secure cookies with extended expiration
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    // Send verification email
    await sendVerificationEmail(email, username, verificationToken);

    return res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed' });
  }
}

/**
 * Verify Email Address
 * POST /api/auth/verify-email
 */
export async function verifyEmail(req: Request, res: Response) {
  try {
    const validation = verifyEmailSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: validation.error.errors,
      });
    }

    const { token } = validation.data;

    const user: any = await prisma.user.findUnique({
      where: { verificationToken: token } as any,
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email address is already verified' });
    }

    if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
      return res
        .status(400)
        .json({ message: 'Verification token has expired. Please request a new one.' });
    }

    // Update user to be verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      } as any,
    });

    return res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ message: 'Verification failed' });
  }
}

/**
 * Resend Verification Email
 * POST /api/auth/resend-verification
 */
export async function resendVerification(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user: any = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Rate limiting: Check if an email was sent in the last 24 hours
    if (user.lastVerificationSentAt) {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      if (new Date(user.lastVerificationSentAt) > twentyFourHoursAgo) {
        return res.status(429).json({
          message: 'A verification email was already sent recently. Please try again tomorrow.',
        });
      }
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Update DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
        lastVerificationSentAt: new Date(),
      } as any,
    });

    // Send the email
    await sendVerificationEmail(user.email, user.username, verificationToken);

    return res.json({ message: 'Verification email resent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ message: 'Failed to resend verification email' });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: AuthRequest, res: Response) {
  try {
    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: validation.error.errors,
      });
    }

    const { emailOrUsername, password } = validation.data;

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // Set HttpOnly, Secure cookies with extended expiration
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        emailVerified: (user as any).emailVerified,
        role: user.role,
        status: user.status,
        bannedUntil: user.bannedUntil?.toISOString(),
        banReason: user.banReason,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export async function refresh(req: AuthRequest, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Verify user exists and token version matches
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        role: true,
        tokenVersion: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // SECURITY: Token version check prevents use of old tokens after role change
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: 'Token revoked. Please log in again.' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.json({
      message: 'Token refreshed',
      user,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(_req: AuthRequest, res: Response) {
  try {
    // Clear authentication cookies with the same options used when setting them
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Logout failed' });
  }
}

/**
 * Get current user info
 * GET /api/auth/me
 */
export async function me(req: AuthRequest, res: Response) {
  try {
    // User is already attached by requireAuth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Fetch full user data including status
    const fullUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        avatarUrl: true,
        role: true,
        status: true,
        bannedUntil: true,
        banReason: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!fullUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: fullUser.id,
        username: fullUser.username,
        email: fullUser.email,
        emailVerified: (fullUser as any).emailVerified,
        avatarUrl: fullUser.avatarUrl,
        role: fullUser.role,
        status: fullUser.status,
        bannedUntil: fullUser.bannedUntil?.toISOString(),
        banReason: fullUser.banReason,
        lastActive: fullUser.lastActive?.toISOString(),
        createdAt: fullUser.createdAt.toISOString(),
        updatedAt: fullUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Failed to get user info' });
  }
}

/**
 * Generate re-authentication token for sensitive operations
 * POST /api/auth/re-auth
 */
export async function reAuth(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password required for re-authentication' });
    }

    // Fetch user with password hash
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate short-lived re-auth token (5 minutes)
    const reAuthToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return res.json({
      message: 'Re-authentication successful',
      reAuthToken,
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error('Re-auth error:', error);
    return res.status(500).json({ message: 'Re-authentication failed' });
  }
}
