import { Router } from 'express';
import * as userController from '../controllers/user.controller';

/**
 * User Routes
 *
 * Public routes for viewing user profiles and searching users
 * No authentication required
 */

const router = Router();

/**
 * User search and profiles
 */
router.get('/search', userController.searchUsers);
router.get('/stats/public', userController.getPublicStats);
router.get('/:userId', userController.getPublicUserProfile);

export default router;
