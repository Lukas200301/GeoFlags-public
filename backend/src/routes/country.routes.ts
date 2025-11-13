import { Router } from 'express';
import * as countryController from '../controllers/restCountries.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

/**
 * Country Data Routes
 *
 * FEATURES:
 * - Public access to country data from REST Countries API (cached)
 * - Admin-only cache management (DELETE, stats)
 * - No CSRF protection needed for GET requests
 */

const router = Router();

/**
 * Public routes
 */
// Get country data by country code (cached from REST Countries API)
router.get('/:code', countryController.getCountryData);

/**
 * Admin-only routes
 */
// Get cache statistics
router.get('/cache/stats', requireAuth, requireAdmin, countryController.getCacheStats);

// Clear country data cache
router.delete('/cache', requireAuth, requireAdmin, countryController.clearCache);

export default router;
