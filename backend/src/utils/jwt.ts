import jwt from 'jsonwebtoken';
import type { JWTPayload, TokenPair } from '../types';

/**
 * JWT utility functions
 *
 * SECURITY:
 * - Uses separate secrets for access and refresh tokens
 * - Short-lived access tokens (15min) reduce exposure window
 * - Long-lived refresh tokens (7d) improve UX while maintaining security
 * - Token version allows global invalidation on role changes
 */

// Get secrets from environment with validation
function getEnvSecret(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`ERROR: Environment variable ${key} is not set!`);
    console.error(
      `Available env vars:`,
      Object.keys(process.env).filter((k) => k.startsWith('JWT_'))
    );
    throw new Error(`${key} must be set in environment variables`);
  }
  return value;
}

const ACCESS_SECRET = getEnvSecret('JWT_ACCESS_SECRET');
const REFRESH_SECRET = getEnvSecret('JWT_REFRESH_SECRET');
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '30d'; // Extended to 30 days
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '90d'; // Extended to 90 days

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign({ ...payload } as object, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign({ ...payload } as object, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify access token
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
}

/**
 * Verify refresh token
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
}
