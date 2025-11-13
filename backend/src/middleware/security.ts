import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * Security middleware
 *
 * SECURITY:
 * - Rate limiting prevents brute force attacks
 * - Different limits for auth vs general endpoints
 * - IP-based tracking with trust proxy support
 */

/**
 * Rate limiter for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for admin endpoints
 * Moderate limits to prevent abuse
 */
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many admin requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * More permissive for normal usage
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: 'Too many requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Audit logger middleware
 * Logs admin actions for security auditing
 */
export function auditLogger(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store action info on request for use in controller
    (req as any).auditAction = action;
    (req as any).auditIp = req.ip || req.socket.remoteAddress;
    next();
  };
}

/**
 * Error handler middleware
 * Ensures errors don't leak sensitive information
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', err);

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }

  // In development, include error details
  return res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
}
