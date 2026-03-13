import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';
import { UserRole } from '@prisma/client';
import { clearSettingsCache } from '../utils/systemSettings';

/**
 * Admin Controller
 *
 * SECURITY:
 * - All endpoints require requireAuth + requireAdmin middleware
 * - Audit logging for all admin actions
 * - Cannot delete or demote yourself
 * - Input validation for all operations
 */

/**
 * Get all users with pagination
 * GET /api/admin/users
 */
export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get users with pagination
    const [rawUsers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
          status: true,
          bannedUntil: true,
          banReason: true,
          createdAt: true,
          lastActive: true,
          gameSessions: {
            select: { score: true },
          },
          _count: {
            select: {
              gameSessions: true,
              leaderboardEntries: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Transform users to include status and stats
    const users = rawUsers.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status.toLowerCase() as 'active' | 'banned' | 'suspended',
      gamesPlayed: user._count.gameSessions,
      totalScore: user.gameSessions.reduce((sum, game) => sum + game.score, 0),
      lastLogin: user.lastActive?.toISOString(),
      createdAt: user.createdAt.toISOString(),
    }));

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
}

/**
 * Get single user details
 * GET /api/admin/users/:id
 */
export async function getUserById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        tokenVersion: true,
        gameSessions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        leaderboardEntries: {
          orderBy: { score: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            gameSessions: true,
            leaderboardEntries: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
}

/**
 * Change user role
 * PUT /api/admin/users/:id/role
 */
export async function changeUserRole(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be USER or ADMIN.' });
    }

    // SECURITY: Cannot change your own role
    if (id === req.user?.id) {
      return res.status(403).json({ message: 'Cannot change your own role' });
    }

    // Update user role and increment token version to invalidate old tokens
    const user = await prisma.user.update({
      where: { id },
      data: {
        role: role as UserRole,
        tokenVersion: { increment: 1 },
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    // Create audit log
    await prisma.adminAudit.create({
      data: {
        adminId: req.user!.id,
        action: 'ROLE_CHANGE',
        targetId: id,
        details: { newRole: role },
        ip: (req as any).auditIp,
      },
    });

    return res.json({
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    console.error('Change role error:', error);
    return res.status(500).json({ message: 'Failed to change user role' });
  }
}

/**
 * Update user status (ban/suspend/active)
 * PATCH /api/admin/users/:userId/status
 */
export async function updateUserStatus(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const { status, bannedUntil, banReason } = req.body;

    // Validate status
    if (!status || !['active', 'banned', 'suspended'].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Invalid status. Must be active, banned, or suspended.' });
    }

    // Map frontend status to Prisma enum
    const statusMap: Record<string, any> = {
      active: 'ACTIVE',
      banned: 'BANNED',
      suspended: 'SUSPENDED',
    };

    // SECURITY: Cannot change your own status
    if (userId === req.user?.id) {
      return res.status(403).json({ message: 'Cannot change your own status' });
    }

    // Update user status
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: statusMap[status],
        bannedUntil: bannedUntil ? new Date(bannedUntil) : null,
        banReason: banReason || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        bannedUntil: true,
        banReason: true,
      },
    });

    // Create audit log
    await prisma.adminAudit.create({
      data: {
        adminId: req.user!.id,
        action: 'USER_STATUS_CHANGE',
        targetId: userId,
        details: { newStatus: status, bannedUntil, banReason },
        ip: (req as any).auditIp,
      },
    });

    return res.json({
      message: 'User status updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ message: 'Failed to update user status' });
  }
}

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // SECURITY: Cannot delete yourself
    if (id === req.user?.id) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    // Delete user (cascade deletes sessions, leaderboard entries)
    await prisma.user.delete({
      where: { id },
    });

    // Create audit log
    await prisma.adminAudit.create({
      data: {
        adminId: req.user!.id,
        action: 'USER_DELETE',
        targetId: id,
        details: {},
        ip: (req as any).auditIp,
      },
    });

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
}

/**
 * Delete user avatar
 * DELETE /api/admin/users/:id/avatar
 *
 * SECURITY:
 * - Deletes avatar file from filesystem
 * - Sets avatarUrl to null in database
 * - Creates audit log entry
 */
export async function deleteUserAvatar(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Get user to check for existing avatar
    const user = await prisma.user.findUnique({
      where: { id },
      select: { avatarUrl: true, username: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.avatarUrl) {
      return res.status(400).json({ message: 'User has no avatar to delete' });
    }

    // Delete avatar file from filesystem
    try {
      const filename = user.avatarUrl.split('/').pop();
      if (filename) {
        const filePath = path.join(__dirname, '../../cache/avatars', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (deleteError) {
      console.error('Failed to delete avatar file:', deleteError);
      // Continue anyway to update database
    }

    // Update user to remove avatar URL
    await prisma.user.update({
      where: { id },
      data: { avatarUrl: null },
    });

    // Create audit log
    await prisma.adminAudit.create({
      data: {
        adminId: req.user!.id,
        action: 'USER_AVATAR_DELETE',
        targetId: id,
        details: {
          username: user.username,
          deletedAvatarUrl: user.avatarUrl,
        },
        ip: (req as any).auditIp,
      },
    });

    return res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    console.error('Delete user avatar error:', error);
    return res.status(500).json({ message: 'Failed to delete avatar' });
  }
}

/**
 * Get all game modes
 * GET /api/admin/game-modes
 */
export async function getGameModes(_req: AuthRequest, res: Response) {
  try {
    const gameModes = await prisma.gameMode.findMany({
      orderBy: { name: 'asc' },
    });

    // Icon mapping for game modes
    const iconMap: Record<string, string> = {
      FLAGS: 'mdi:flag',
      CAPITALS: 'mdi:city',
      MAPS: 'mdi:map',
      MIXED: 'mdi:shuffle-variant',
      GUESS_FLAG: 'mdi:flag-triangle',
      TIME_TRIAL: 'mdi:timer-sand',
      FIND_CAPITAL: 'mdi:map-marker',
    };

    // Get play count for each game mode
    const gameModesWithStats = await Promise.all(
      gameModes.map(async (mode) => {
        const playCount = await prisma.leaderboardEntry.count({
          where: { mode: mode.id },
        });
        return {
          ...mode,
          icon: iconMap[mode.id] || 'mdi:gamepad-variant',
          playCount,
        };
      })
    );

    return res.json({ gameModes: gameModesWithStats });
  } catch (error) {
    console.error('Get game modes error:', error);
    return res.status(500).json({ message: 'Failed to fetch game modes' });
  }
}

/**
 * Update game mode
 * PUT /api/admin/game-modes/:id
 */
export async function updateGameMode(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, enabled } = req.body;

    const gameMode = await prisma.gameMode.update({
      where: { id: id as any },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    // Create audit log
    await prisma.adminAudit.create({
      data: {
        adminId: req.user!.id,
        action: 'GAME_MODE_UPDATE',
        targetId: id,
        details: { name, description, enabled },
        ip: (req as any).auditIp,
      },
    });

    return res.json({
      message: 'Game mode updated successfully',
      gameMode,
    });
  } catch (error) {
    console.error('Update game mode error:', error);
    return res.status(500).json({ message: 'Failed to update game mode' });
  }
}

/**
 * Get leaderboard entries with admin controls
 * GET /api/admin/leaderboard
 */
export async function getLeaderboardAdmin(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const mode = req.query.mode as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = mode ? { mode: mode as any } : {};

    const [entries, total] = await Promise.all([
      prisma.leaderboardEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { score: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.leaderboardEntry.count({ where }),
    ]);

    return res.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get leaderboard admin error:', error);
    return res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
}

/**
 * Delete leaderboard entry
 * DELETE /api/admin/leaderboard/:id
 */
export async function deleteLeaderboardEntry(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    await prisma.leaderboardEntry.delete({
      where: { id },
    });

    // Create audit log
    await prisma.adminAudit.create({
      data: {
        adminId: req.user!.id,
        action: 'LEADERBOARD_DELETE',
        targetId: id,
        details: {},
        ip: (req as any).auditIp,
      },
    });

    return res.json({ message: 'Leaderboard entry deleted successfully' });
  } catch (error) {
    console.error('Delete leaderboard entry error:', error);
    return res.status(500).json({ message: 'Failed to delete leaderboard entry' });
  }
}

/**
 * Bulk delete leaderboard entries
 * POST /api/admin/leaderboard/bulk-delete
 */
export async function bulkDeleteLeaderboardEntries(req: AuthRequest, res: Response) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty ids array' });
    }

    // Delete entries
    const result = await prisma.leaderboardEntry.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    // Create audit log
    await prisma.adminAudit.create({
      data: {
        adminId: req.user!.id,
        action: 'LEADERBOARD_BULK_DELETE',
        targetId: null,
        details: {
          deletedCount: result.count,
          ids,
        },
        ip: (req as any).auditIp,
      },
    });

    return res.json({
      message: `Successfully deleted ${result.count} leaderboard entries`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Bulk delete leaderboard entries error:', error);
    return res.status(500).json({ message: 'Failed to delete leaderboard entries' });
  }
}

/**
 * Get comprehensive statistics
 * GET /api/admin/stats
 */
export async function getStats(_req: AuthRequest, res: Response) {
  try {
    // Overview Stats
    const totalUsers = await prisma.user.count();
    const totalGames = await prisma.gameSession.count();

    // Active users today (users with activity today)
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const activeToday = await prisma.user.count({
      where: {
        lastActive: {
          gte: todayStart,
        },
      },
    });

    // Get yesterday's active users for trend
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const activeYesterday = await prisma.user.count({
      where: {
        lastActive: {
          gte: yesterdayStart,
          lt: todayStart,
        },
      },
    });
    const activeTodayTrend =
      activeYesterday > 0
        ? Math.round(((activeToday - activeYesterday) / activeYesterday) * 100)
        : 0;

    // User growth trend (last month vs previous month)
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const newUsersLastMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
        },
      },
    });
    const prevMonthStart = new Date(lastMonthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const newUsersPrevMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: prevMonthStart,
          lt: lastMonthStart,
        },
      },
    });
    const userGrowthTrend =
      newUsersPrevMonth > 0
        ? Math.round(((newUsersLastMonth - newUsersPrevMonth) / newUsersPrevMonth) * 100)
        : 0;

    // Games trend (this week vs last week)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const gamesThisWeek = await prisma.gameSession.count({
      where: {
        completedAt: {
          gte: weekStart,
        },
      },
    });
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const gamesLastWeek = await prisma.gameSession.count({
      where: {
        completedAt: {
          gte: lastWeekStart,
          lt: weekStart,
        },
      },
    });
    const gamesTrend =
      gamesLastWeek > 0 ? Math.round(((gamesThisWeek - gamesLastWeek) / gamesLastWeek) * 100) : 0;

    // Calculate average session length
    const allSessions = await prisma.gameSession.findMany({
      select: {
        data: true,
        createdAt: true,
        completedAt: true,
      },
    });

    let totalDuration = 0;
    let validSessions = 0;
    allSessions.forEach((session) => {
      const data = session.data as any;
      if (data && typeof data === 'object' && data.timeElapsed) {
        totalDuration += data.timeElapsed;
        validSessions++;
      } else {
        // Fallback: calculate from timestamps
        const duration =
          new Date(session.completedAt).getTime() - new Date(session.createdAt).getTime();
        if (duration > 0 && duration < 3600000) {
          // Less than 1 hour
          totalDuration += duration;
          validSessions++;
        }
      }
    });

    const avgSessionMs = validSessions > 0 ? totalDuration / validSessions : 0;
    const avgSessionMinutes = Math.floor(avgSessionMs / 60000);
    const avgSessionSeconds = Math.floor((avgSessionMs % 60000) / 1000);
    const avgSessionFormatted = `${avgSessionMinutes}m ${avgSessionSeconds}s`;

    // Get last week sessions for trend calculation
    const lastWeekSessions = await prisma.gameSession.findMany({
      where: {
        completedAt: {
          gte: lastWeekStart,
          lt: weekStart,
        },
      },
      select: {
        data: true,
        createdAt: true,
        completedAt: true,
      },
    });

    let lastWeekDuration = 0;
    let lastWeekValidSessions = 0;
    lastWeekSessions.forEach((session) => {
      const data = session.data as any;
      if (data && typeof data === 'object' && data.timeElapsed) {
        lastWeekDuration += data.timeElapsed;
        lastWeekValidSessions++;
      } else {
        const duration =
          new Date(session.completedAt).getTime() - new Date(session.createdAt).getTime();
        if (duration > 0 && duration < 3600000) {
          lastWeekDuration += duration;
          lastWeekValidSessions++;
        }
      }
    });

    const lastWeekAvgMs = lastWeekValidSessions > 0 ? lastWeekDuration / lastWeekValidSessions : 0;
    const sessionTrend =
      lastWeekAvgMs > 0 ? Math.round(((avgSessionMs - lastWeekAvgMs) / lastWeekAvgMs) * 100) : 0;

    // Game Modes Distribution
    const gameModeStats = await prisma.gameSession.groupBy({
      by: ['mode'],
      _count: {
        mode: true,
      },
    });

    // User Activity (Last 7 Days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [userCount, gameCount] = await Promise.all([
        prisma.user.count({
          where: {
            lastActive: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        prisma.gameSession.count({
          where: {
            completedAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
      ]);

      last7Days.push({
        date: date.toISOString().split('T')[0],
        users: userCount,
        games: gameCount,
      });
    }

    // Top Players by Score
    const topPlayersByScore = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        email: true,
        gameSessions: {
          select: {
            score: true,
          },
        },
      },
    });

    const topScorePlayers = topPlayersByScore
      .map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        totalScore: user.gameSessions.reduce((sum, session) => sum + session.score, 0),
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);

    // Most Active Players (by games played)
    const topPlayersByGames = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        email: true,
        _count: {
          select: {
            gameSessions: true,
          },
        },
      },
      orderBy: {
        gameSessions: {
          _count: 'desc',
        },
      },
    });

    const mostActivePlayers = topPlayersByGames.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      gamesPlayed: user._count.gameSessions,
    }));

    return res.json({
      overview: {
        totalUsers: {
          value: totalUsers,
          trend: {
            direction: userGrowthTrend >= 0 ? 'up' : 'down',
            value: Math.abs(userGrowthTrend),
            label: 'vs last month',
          },
        },
        activeToday: {
          value: activeToday,
          trend: {
            direction: activeTodayTrend >= 0 ? 'up' : 'down',
            value: Math.abs(activeTodayTrend),
            label: 'vs yesterday',
          },
        },
        gamesPlayed: {
          value: totalGames,
          trend: {
            direction: gamesTrend >= 0 ? 'up' : 'down',
            value: Math.abs(gamesTrend),
            label: 'vs last week',
          },
        },
        avgSession: {
          value: avgSessionFormatted,
          trend: {
            direction: sessionTrend >= 0 ? 'up' : 'down',
            value: Math.abs(sessionTrend),
            label: 'vs last week',
          },
        },
      },
      gameModes: gameModeStats.map((stat) => ({
        mode: stat.mode,
        count: stat._count.mode,
      })),
      userActivity: last7Days,
      topPlayers: {
        byScore: topScorePlayers,
        byGames: mostActivePlayers,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch statistics' });
  }
}

/**
 * Get dashboard overview
 * GET /api/admin/dashboard
 */
export async function getDashboard(_req: AuthRequest, res: Response) {
  try {
    // Get user stats
    const [totalUsers, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    // Get active users count (users with activity in last 30 days)
    const activeUsers = await prisma.user.count({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    // Get previous month stats for trend
    const prevMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });
    const userTrend = prevMonthUsers > 0 ? ((newUsers - prevMonthUsers) / prevMonthUsers) * 100 : 0;

    // Get game stats
    const [totalGames, todayGames] = await Promise.all([
      prisma.gameSession.count(),
      prisma.gameSession.count({
        where: {
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Get last week games for trend
    const lastWeekGames = await prisma.gameSession.count({
      where: {
        completedAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    const thisWeekGames = await prisma.gameSession.count({
      where: {
        completedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    const gamesTrend =
      lastWeekGames > 0 ? ((thisWeekGames - lastWeekGames) / lastWeekGames) * 100 : 0;

    // Get recent activity
    const recentGames = await prisma.gameSession.findMany({
      take: 10,
      orderBy: { completedAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, createdAt: true },
    });

    const recentActivity = [
      ...recentUsers.map((user) => ({
        id: `user-${user.id}`,
        type: 'user_registered' as const,
        message: `New user registered: ${user.username}`,
        timestamp: user.createdAt.toISOString(),
        user: { username: user.username, id: user.id },
      })),
      ...recentGames.map((game) => ({
        id: `game-${game.id}`,
        type: 'game_played' as const,
        message: `${game.user.username} completed a game with score ${game.score}`,
        timestamp: game.completedAt?.toISOString() || game.createdAt.toISOString(),
        user: { username: game.user.username, id: game.userId },
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Calculate uptime
    const uptimeSeconds = Math.floor(process.uptime());
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeFormatted = `${days}d ${hours}h ${minutes}m`;

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        trend: Math.round(userTrend),
      },
      games: {
        total: totalGames,
        today: todayGames,
        trend: Math.round(gamesTrend),
      },
      leaderboard: {
        totalEntries: await prisma.leaderboardEntry.count(),
        topScore:
          (
            await prisma.leaderboardEntry.findFirst({
              orderBy: { score: 'desc' },
            })
          )?.score || 0,
      },
      system: {
        uptime: uptimeFormatted,
        status: 'healthy' as const,
      },
    };

    return res.json({ stats, recentActivity });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
}

/**
 * Get system health metrics
 * GET /api/admin/system/health
 */
export async function getSystemHealth(_req: AuthRequest, res: Response) {
  try {
    const os = require('os');

    // System metrics
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    // CPU usage (simplified)
    const cpus = os.cpus();
    const cpuUsage =
      cpus.reduce((acc: number, cpu: any) => {
        const times = cpu.times as Record<string, number>;
        const total = Object.values(times).reduce((a, b) => a + b, 0);
        const idle = times.idle;
        return acc + ((total - idle) / total) * 100;
      }, 0) / cpus.length;

    // Database health
    let dbResponseTime = 0;
    let dbStatus: 'connected' | 'disconnected' = 'connected';
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - start;
    } catch (error) {
      dbStatus = 'disconnected';
    }

    // Calculate uptime
    const uptimeSeconds = Math.floor(process.uptime());
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeFormatted = `${days}d ${hours}h ${minutes}m`;

    // Active sessions (simplified - count recent users)
    const activeSessions = await prisma.user.count({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
      },
    });

    // Overall status
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (dbStatus === 'disconnected' || memoryPercentage > 90 || cpuUsage > 90) {
      status = 'error';
    } else if (memoryPercentage > 70 || cpuUsage > 70) {
      status = 'warning';
    }

    const metrics = {
      uptime: uptimeFormatted,
      uptimeSeconds,
      status,
      server: {
        memory: {
          used: usedMemory,
          total: totalMemory,
          percentage: Math.round(memoryPercentage * 10) / 10,
        },
        cpu: {
          usage: Math.round(cpuUsage * 10) / 10,
        },
        platform: os.platform(),
        nodeVersion: process.version,
      },
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
        connections: {
          active: 1,
          idle: 0,
          total: 1,
        },
      },
      api: {
        totalRequests: 0, // TODO: Implement metrics tracking
        averageResponseTime: 0,
        errorRate: 0,
      },
      sessions: {
        active: activeSessions,
        total: await prisma.user.count(),
      },
    };

    return res.json({ metrics });
  } catch (error) {
    console.error('Get system health error:', error);
    return res.status(500).json({ message: 'Failed to fetch system health' });
  }
}

/**
 * Get audit logs
 * GET /api/admin/audit-logs
 */
export async function getAuditLogs(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const action = req.query.action as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Add search filter (search in admin username)
    if (search) {
      where.admin = {
        username: { contains: search, mode: 'insensitive' },
      };
    }

    // Add action filter
    if (action && action !== 'all') {
      where.action = action;
    }

    const [logs, total] = await Promise.all([
      prisma.adminAudit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.adminAudit.count({ where }),
    ]);

    return res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
}

/**
 * Get all database tables
 * GET /api/admin/database/tables
 */
export async function getDatabaseTables(_req: AuthRequest, res: Response) {
  try {
    // Get all Prisma model names from the schema
    const tables = [
      { name: 'users', label: 'Users', icon: 'mdi:account-group' },
      { name: 'game_sessions', label: 'Game Sessions', icon: 'mdi:gamepad-variant' },
      { name: 'leaderboard_entries', label: 'Leaderboard Entries', icon: 'mdi:trophy' },
      { name: 'game_modes', label: 'Game Modes', icon: 'mdi:puzzle' },
      { name: 'admin_audits', label: 'Admin Audits', icon: 'mdi:file-document-outline' },
      { name: 'system_settings', label: 'System Settings', icon: 'mdi:cog' },
      { name: 'friendships', label: 'Friendships', icon: 'mdi:account-heart' },
      { name: 'battles', label: 'Battles', icon: 'mdi:sword-cross' },
      { name: 'battle_participants', label: 'Battle Participants', icon: 'mdi:account-multiple' },
    ];

    // Get row counts for each table
    const tableCounts = await Promise.all(
      tables.map(async (table) => {
        let count = 0;
        try {
          switch (table.name) {
            case 'users':
              count = await prisma.user.count();
              break;
            case 'game_sessions':
              count = await prisma.gameSession.count();
              break;
            case 'leaderboard_entries':
              count = await prisma.leaderboardEntry.count();
              break;
            case 'game_modes':
              count = await prisma.gameMode.count();
              break;
            case 'admin_audits':
              count = await prisma.adminAudit.count();
              break;
            case 'system_settings':
              count = await prisma.systemSettings.count();
              break;
            case 'friendships':
              count = await prisma.friendship.count();
              break;
            case 'battles':
              count = await prisma.battle.count();
              break;
            case 'battle_participants':
              count = await prisma.battleParticipant.count();
              break;
          }
        } catch (err) {
          console.error(`Error counting ${table.name}:`, err);
        }
        return { ...table, count };
      })
    );

    return res.json({ tables: tableCounts });
  } catch (error) {
    console.error('Get database tables error:', error);
    return res.status(500).json({ message: 'Failed to fetch database tables' });
  }
}

/**
 * Get database table data
 * GET /api/admin/database
 */
export async function getDatabaseTable(req: AuthRequest, res: Response) {
  try {
    const table = req.query.table as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Validate table name
    const allowedTables = [
      'users',
      'game_sessions',
      'leaderboard_entries',
      'game_modes',
      'admin_audits',
      'system_settings',
      'friendships',
      'battles',
      'battle_participants',
    ];
    if (!allowedTables.includes(table)) {
      return res.status(400).json({ message: 'Invalid table name' });
    }

    let data: any[] = [];
    let total: number = 0;

    switch (table) {
      case 'users':
        const userWhere: any = search
          ? {
              OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {};
        [data, total] = await Promise.all([
          prisma.user.findMany({
            where: userWhere,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              status: true,
              bannedUntil: true,
              lastActive: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          prisma.user.count({ where: userWhere }),
        ]);
        break;

      case 'game_sessions':
        const sessionWhere: any = search
          ? {
              user: {
                username: { contains: search, mode: 'insensitive' },
              },
            }
          : {};
        [data, total] = await Promise.all([
          prisma.gameSession.findMany({
            where: sessionWhere,
            skip,
            take: limit,
            orderBy: { completedAt: 'desc' },
            include: {
              user: {
                select: { username: true },
              },
            },
          }),
          prisma.gameSession.count({ where: sessionWhere }),
        ]);
        break;

      case 'leaderboard_entries':
        const leaderboardWhere: any = search
          ? {
              user: {
                username: { contains: search, mode: 'insensitive' },
              },
            }
          : {};
        [data, total] = await Promise.all([
          prisma.leaderboardEntry.findMany({
            where: leaderboardWhere,
            skip,
            take: limit,
            orderBy: { score: 'desc' },
            include: {
              user: {
                select: { username: true },
              },
            },
          }),
          prisma.leaderboardEntry.count({ where: leaderboardWhere }),
        ]);
        break;

      case 'game_modes':
        const modeWhere: any = search
          ? {
              name: { contains: search, mode: 'insensitive' },
            }
          : {};
        [data, total] = await Promise.all([
          prisma.gameMode.findMany({
            where: modeWhere,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.gameMode.count({ where: modeWhere }),
        ]);
        break;

      case 'admin_audits':
        const auditWhere: any = search
          ? {
              OR: [
                { action: { contains: search, mode: 'insensitive' } },
                { admin: { username: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {};
        [data, total] = await Promise.all([
          prisma.adminAudit.findMany({
            where: auditWhere,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              admin: {
                select: { username: true },
              },
            },
          }),
          prisma.adminAudit.count({ where: auditWhere }),
        ]);
        break;

      case 'system_settings':
        [data, total] = await Promise.all([
          prisma.systemSettings.findMany({
            skip,
            take: limit,
            orderBy: { updatedAt: 'desc' },
          }),
          prisma.systemSettings.count(),
        ]);
        break;

      case 'friendships':
        const friendshipWhere: any = search
          ? {
              OR: [
                { user: { username: { contains: search, mode: 'insensitive' } } },
                { friend: { username: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {};
        [data, total] = await Promise.all([
          prisma.friendship.findMany({
            where: friendshipWhere,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { username: true } },
              friend: { select: { username: true } },
            },
          }),
          prisma.friendship.count({ where: friendshipWhere }),
        ]);
        break;

      case 'battles':
        const battleWhere: any = search
          ? {
              OR: [
                { challenger: { username: { contains: search, mode: 'insensitive' } } },
                { opponent: { username: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {};
        [data, total] = await Promise.all([
          prisma.battle.findMany({
            where: battleWhere,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              challenger: { select: { username: true } },
              opponent: { select: { username: true } },
              winner: { select: { username: true } },
            },
          }),
          prisma.battle.count({ where: battleWhere }),
        ]);
        break;

      case 'battle_participants':
        const participantWhere: any = search
          ? {
              user: { username: { contains: search, mode: 'insensitive' } },
            }
          : {};
        [data, total] = await Promise.all([
          prisma.battleParticipant.findMany({
            where: participantWhere,
            skip,
            take: limit,
            orderBy: { joinedAt: 'desc' },
            include: {
              user: { select: { username: true } },
              battle: { select: { id: true, status: true } },
            },
          }),
          prisma.battleParticipant.count({ where: participantWhere }),
        ]);
        break;
    }

    return res.json({ data, total });
  } catch (error) {
    console.error('Get database table error:', error);
    return res.status(500).json({ message: 'Failed to fetch table data' });
  }
}

/**
 * Get system settings
 * GET /api/admin/system/settings
 */
export async function getSystemSettings(_req: AuthRequest, res: Response) {
  try {
    // Get or create system settings (single row)
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.systemSettings.create({
        data: {
          requireRegistration: false,
          maintenanceMode: false,
        },
      });
    }

    return res.json({
      requireRegistration: settings.requireRegistration,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    // Return default settings if table doesn't exist yet (before migration)
    return res.json({
      requireRegistration: false,
      maintenanceMode: false,
      maintenanceMessage: null,
    });
  }
}

/**
 * Update system settings
 * PUT /api/admin/system/settings
 */
export async function updateSystemSettings(req: AuthRequest, res: Response) {
  try {
    const { requireRegistration, maintenanceMode, maintenanceMessage } = req.body;

    // Build update data - only include fields that are provided
    const updateData: Record<string, any> = {};

    if (typeof requireRegistration === 'boolean') {
      updateData.requireRegistration = requireRegistration;
    }
    if (typeof maintenanceMode === 'boolean') {
      updateData.maintenanceMode = maintenanceMode;
    }
    if (maintenanceMessage !== undefined) {
      updateData.maintenanceMessage = maintenanceMessage || null;
    }

    // Require at least one valid field
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid settings fields provided' });
    }

    // Get or create settings
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.systemSettings.create({
        data: {
          requireRegistration: updateData.requireRegistration ?? false,
          maintenanceMode: updateData.maintenanceMode ?? false,
          maintenanceMessage: updateData.maintenanceMessage ?? null,
        },
      });
    } else {
      // Update existing
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    // Audit log
    await prisma.adminAudit.create({
      data: {
        adminId: req.user!.id,
        action: 'SYSTEM_SETTINGS_UPDATE',
        details: updateData,
        ip: req.ip,
      },
    });

    // Clear the settings cache
    clearSettingsCache();

    return res.json({
      message: 'System settings updated successfully',
      requireRegistration: settings.requireRegistration,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    // Check if it's a table doesn't exist error
    if (
      error instanceof Error &&
      error.message.includes('Table') &&
      error.message.includes('does not exist')
    ) {
      return res.status(503).json({
        message: 'Database migration required. Please run: npx prisma migrate deploy',
        error: 'MIGRATION_REQUIRED',
      });
    }
    return res.status(500).json({ message: 'Failed to update system settings' });
  }
}
