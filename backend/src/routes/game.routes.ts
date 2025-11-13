import { Router } from 'express';
import * as gameController from '../controllers/game.controller';
import * as guessTheFlagController from '../controllers/guessTheFlag.controller';
import * as higherLowerController from '../controllers/higherLower.controller';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/security';

/**
 * Game Routes
 *
 * SECURITY:
 * - Game play uses optional auth (guests can play)
 * - Score submission saves only for authenticated users
 * - Rate limiting on all endpoints
 * - Leaderboard is public but user rank requires auth
 */

const router = Router();

// Apply rate limiting to all game routes
router.use(apiRateLimiter);

/**
 * Public routes
 */
router.get('/modes', gameController.getGameModes);
router.get('/leaderboard', gameController.getLeaderboard);
router.get('/settings', gameController.getPublicSettings);

/**
 * Protected routes (require authentication)
 */
router.post('/submit', requireAuth, gameController.submitScore);
router.get('/history', requireAuth, gameController.getGameHistory);
router.get('/stats', requireAuth, gameController.getUserStats);

/**
 * Guess the Flag game routes (optional authentication - guests can play)
 */
router.post('/guess-the-flag/start', optionalAuth, guessTheFlagController.startGame);
router.post('/guess-the-flag/answer', optionalAuth, guessTheFlagController.submitAnswer);

/**
 * Higher/Lower game routes (optional authentication - guests can play)
 */
router.post('/higher-lower/start', optionalAuth, higherLowerController.startGame);
router.post('/higher-lower/answer', optionalAuth, higherLowerController.submitAnswer);

export default router;
