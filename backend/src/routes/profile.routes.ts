import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { requireAuth } from '../middleware/auth';

import upload, { validateAvatarUpload } from '../middleware/upload';

/**
 * Profile Routes
 *
 * All routes require authentication
 * SECURITY: Avatar upload includes multiple validation layers
 */

const router = Router();

// All profile routes require authentication
router.use(requireAuth);

/**
 * Profile management
 */
router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.delete('/', profileController.deleteAccount);
router.post('/avatar', upload.single('avatar'), validateAvatarUpload, profileController.updateAvatar);
router.patch('/password', profileController.changePassword);

/**
 * Statistics
 */
router.get('/stats', profileController.getStats);
router.get('/game-history', profileController.getGameHistory);

export default router;
