import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { adminRateLimiter, auditLogger } from '../middleware/security';

/**
 * Admin Routes
 *
 * SECURITY:
 * - All routes require authentication + admin role
 * - Rate limiting to prevent abuse
 * - Audit logging for sensitive actions
 */

const router = Router();

// Apply auth and admin middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);
router.use(adminRateLimiter);

/**
 * User Management
 */
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/role', auditLogger('ROLE_CHANGE'), adminController.changeUserRole);
router.delete('/users/:id', auditLogger('USER_DELETE'), adminController.deleteUser);
router.delete('/users/:id/avatar', auditLogger('USER_AVATAR_DELETE'), adminController.deleteUserAvatar);

/**
 * Game Mode Management
 */
router.get('/game-modes', adminController.getGameModes);
router.put('/game-modes/:id', auditLogger('GAME_MODE_UPDATE'), adminController.updateGameMode);

/**
 * Leaderboard Management
 */
router.get('/leaderboard', adminController.getLeaderboardAdmin);
router.post('/leaderboard/bulk-delete', auditLogger('LEADERBOARD_BULK_DELETE'), adminController.bulkDeleteLeaderboardEntries);
router.delete('/leaderboard/:id', auditLogger('LEADERBOARD_DELETE'), adminController.deleteLeaderboardEntry);

/**
 * Statistics & Audit
 */
router.get('/stats', adminController.getStats);
router.get('/dashboard', adminController.getDashboard);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/audit-log', adminController.getAuditLogs); // Alias for consistency with frontend
router.get('/audit-log/export', adminController.getAuditLogs); // Export endpoint (same as regular for now)

/**
 * System Health
 */
router.get('/system/health', adminController.getSystemHealth);

/**
 * User Status Management (Ban/Suspend)
 */
router.patch('/users/:userId/status', auditLogger('USER_STATUS_CHANGE'), adminController.updateUserStatus);

/**
 * User Role Management (separate endpoint for consistency with frontend)
 */
router.patch('/users/:userId/role', auditLogger('ROLE_CHANGE'), adminController.changeUserRole);

/**
 * Database Viewer
 */
router.get('/database', adminController.getDatabaseTable);

/**
 * System Settings
 */
router.get('/system/settings', adminController.getSystemSettings);
router.put('/system/settings', auditLogger('SYSTEM_SETTINGS_UPDATE'), adminController.updateSystemSettings);

export default router;
