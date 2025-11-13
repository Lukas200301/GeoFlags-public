import { Router } from 'express';
import * as battleController from '../controllers/battle.controller';
import { requireAuth } from '../middleware/auth';

/**
 * Battle Routes
 *
 * All routes require authentication
 * Handles 1v1 real-time battles and challenges
 */

const router = Router();

// All battle routes require authentication
router.use(requireAuth);

/**
 * Public room system (must come before /:battleId routes)
 */
router.post('/rooms/create', battleController.createPublicRoom); // Create a public battle room
router.get('/rooms', battleController.getPublicRooms); // Get all available public rooms
router.post('/rooms/:battleId/join', battleController.joinPublicRoom); // Join a public room

/**
 * Random matchmaking
 */
router.post('/matchmaking/join', battleController.joinMatchmaking); // Join matchmaking queue
router.post('/matchmaking/leave', battleController.leaveMatchmaking); // Leave matchmaking queue

/**
 * Battle management
 */
router.get('/active', battleController.getActiveBattles); // Get user's active battles
router.get('/history', battleController.getBattleHistory); // Get user's battle history
router.get('/:battleId', battleController.getBattleDetails); // Get battle details

/**
 * Challenge system
 */
router.post('/challenge/:friendId', battleController.challengeFriend); // Challenge a friend
router.post('/accept/:battleId', battleController.acceptChallenge); // Accept a battle challenge
router.post('/decline/:battleId', battleController.declineChallenge); // Decline a battle challenge

/**
 * Battle gameplay (real-time via Socket.io, these are fallback REST endpoints)
 */
router.post('/:battleId/ready', battleController.markReady); // Mark player as ready
router.post('/:battleId/answer', battleController.submitAnswer); // Submit an answer
router.post('/:battleId/forfeit', battleController.forfeitBattle); // Forfeit the battle

export default router;
