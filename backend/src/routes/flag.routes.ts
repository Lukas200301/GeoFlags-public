import { Router } from 'express';
import * as flagController from '../controllers/flag.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

/**
 * Flag Routes
 *
 * FEATURES:
 * - Public access to flag images (GET)
 * - Admin-only cache management (DELETE, stats)
 * - No CSRF protection needed for GET requests
 */

const router = Router();

/**
 * Public routes
 */
// Get flag by country code (cached from FlagCDN)
router.get('/:code', flagController.getFlag);

/**
 * Admin-only routes
 */
// Get cache statistics
router.get('/cache/stats', requireAuth, requireAdmin, flagController.getCacheStats);

// Clear flag cache
router.delete('/cache', requireAuth, requireAdmin, flagController.clearCache);

export default router;
