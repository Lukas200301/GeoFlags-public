import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../utils/prisma';
import { isRegistrationRequired } from '../utils/systemSettings';

/**
 * Authentication middleware
 *
 * SECURITY:
 * - Validates JWT from Authorization header or cookies
 * - Checks token version to allow global invalidation
 * - Attaches user data to request for downstream use
 * - Returns 401 for invalid/expired tokens
 */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header or cookies
    let token: string | undefined;

    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback to cookie
    if (!token && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Verify user exists and token version matches
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        tokenVersion: true,
        status: true,
        bannedUntil: true,
        banReason: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // SECURITY: Check if ban/suspension has expired and auto-reactivate
    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      if (user.bannedUntil && new Date(user.bannedUntil) < new Date()) {
        // Ban/suspension expired, reactivate user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: 'ACTIVE',
            bannedUntil: null,
            banReason: null,
          },
        });
        // Update user object for this request
        user.status = 'ACTIVE';
        user.bannedUntil = null;
        user.banReason = null;
      }
      // Note: Banned users can still login and view their profile
      // But they cannot play games (checked in game controllers)
    }

    // SECURITY: Token version check prevents use of old tokens after role change
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: 'Token revoked. Please log in again.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Admin authorization middleware
 *
 * SECURITY:
 * - Must be used AFTER requireAuth
 * - Verifies user role is ADMIN
 * - Role is verified from database, not just token
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}

/**
 * Re-authentication middleware for sensitive actions
 *
 * SECURITY:
 * - Requires password confirmation for critical admin actions
 * - Prevents session hijacking from compromising sensitive operations
 */
export function requireReAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const reAuthToken = req.headers['x-reauth-token'] as string;

  if (!reAuthToken) {
    return res.status(403).json({
      message: 'Re-authentication required for this action',
      requiresReAuth: true,
    });
  }

  try {
    // Verify re-auth token (short-lived, 5 minutes)
    const payload = verifyAccessToken(reAuthToken);

    // Ensure it's the same user
    if (payload.userId !== req.user?.id) {
      return res.status(403).json({ message: 'Re-authentication failed' });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Re-authentication token expired or invalid',
      requiresReAuth: true,
    });
  }
}

/**
 * Optional authentication middleware
 *
 * Attempts to authenticate the user but doesn't fail if no token is provided.
 * This allows guest play while still tracking authenticated users.
 *
 * IMPORTANT: If registration is required (system setting), this will reject guests.
 */
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header or cookies
    let token: string | undefined;

    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback to cookie
    if (!token && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // Check if registration is required
    const registrationRequired = await isRegistrationRequired();

    // If no token and registration is required, reject
    if (!token) {
      if (registrationRequired) {
        return res.status(401).json({
          message: 'Registration required to play games',
          requiresAuth: true,
        });
      }
      req.user = undefined;
      return next();
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Verify user exists and token version matches
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        tokenVersion: true,
        status: true,
        bannedUntil: true,
        banReason: true,
      },
    });

    if (!user) {
      req.user = undefined;
      return next();
    }

    // Check if user is banned or suspended
    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      if (user.bannedUntil && new Date(user.bannedUntil) < new Date()) {
        // Ban/suspension expired, reactivate user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: 'ACTIVE',
            bannedUntil: null,
            banReason: null,
          },
        });
        // Update user object for this request
        user.status = 'ACTIVE';
        user.bannedUntil = null;
        user.banReason = null;
      }
      // Note: Still attach user with ban status - game controllers will check and reject
      // This allows the controllers to return proper ban messages instead of treating as guest
    }

    // Token version check
    if (user.tokenVersion !== payload.tokenVersion) {
      req.user = undefined;
      return next();
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // If any error occurs, just continue as guest
    req.user = undefined;
    next();
  }
}
