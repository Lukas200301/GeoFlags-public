import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/security';

/**
 * Authentication Routes
 *
 * SECURITY:
 * - Rate limiting on login/register to prevent brute force
 * - Protected routes use requireAuth middleware
 * - All mutating operations require CSRF token (added by main app)
 */

const router = Router();

/**
 * Public routes (with rate limiting)
 */
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/verify-email', authController.verifyEmail);

/**
 * Protected routes (require authentication)
 */
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);
router.post('/re-auth', requireAuth, authController.reAuth);
router.post('/resend-verification', requireAuth, authController.resendVerification);

export default router;
