import { Router } from 'express';
import * as friendsController from '../controllers/friends.controller';
import { requireAuth } from '../middleware/auth';

/**
 * Friends Routes
 *
 * All routes require authentication
 * Handles friend requests, friendships, and friend challenges
 */

const router = Router();

// All friends routes require authentication
router.use(requireAuth);

/**
 * Friend management
 */
router.get('/', friendsController.getFriends); // Get user's friends list
router.get('/requests', friendsController.getFriendRequests); // Get pending friend requests
router.post('/request/:userId', friendsController.sendFriendRequest); // Send friend request
router.post('/accept/:friendshipId', friendsController.acceptFriendRequest); // Accept friend request
router.post('/reject/:friendshipId', friendsController.rejectFriendRequest); // Reject friend request
router.delete('/:friendshipId', friendsController.removeFriend); // Remove friend/cancel request
router.post('/block/:userId', friendsController.blockUser); // Block a user

/**
 * Friend search
 */
router.get('/suggestions', friendsController.getFriendSuggestions); // Get friend suggestions
router.get('/search', friendsController.searchFriends); // Search for friends

export default router;
