import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';
import { gameSubmissionSchema } from '../utils/validation';
import { GameModeType } from '@prisma/client';
import { getSystemSettings } from '../utils/systemSettings';

/**
 * Game Controller
 *
 * SECURITY:
 * - Score validation with max limits
 * - User must be authenticated
 * - Rate limiting applied at route level
 * - Input validation with Zod
 */

/**
 * Submit game score
 * POST /api/game/submit
 */
export async function submitScore(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is banned or suspended
    if (req.user.status === 'BANNED') {
      return res.status(403).json({
        message: req.user.banReason || 'Your account has been banned and cannot play games',
        banned: true,
        bannedUntil: req.user.bannedUntil,
      });
    }

    if (req.user.status === 'SUSPENDED') {
      return res.status(403).json({
        message: req.user.banReason || 'Your account has been suspended and cannot play games',
        suspended: true,
        bannedUntil: req.user.bannedUntil,
      });
    }

    // Validate input
    const validation = gameSubmissionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: validation.error.errors,
      });
    }

    const { mode, score, data } = validation.data;

    // Verify game mode exists and is enabled
    const gameMode = await prisma.gameMode.findUnique({
      where: { id: mode as GameModeType },
    });

    if (!gameMode) {
      return res.status(404).json({ message: 'Game mode not found' });
    }

    if (!gameMode.enabled) {
      return res.status(403).json({ message: 'Game mode is currently disabled' });
    }

    // Create game session
    const session = await prisma.gameSession.create({
      data: {
        userId: req.user.id,
        mode: mode as GameModeType,
        score,
        data: (data || {}) as any,
      },
    });

    // Check if this is a high score for this user in this mode
    const existingEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        userId: req.user.id,
        mode: mode as GameModeType,
      },
    });

    let leaderboardEntry;
    let isNewHighScore = false;

    if (!existingEntry || score > existingEntry.score) {
      isNewHighScore = true;

      if (existingEntry) {
        // Update existing entry
        leaderboardEntry = await prisma.leaderboardEntry.update({
          where: { id: existingEntry.id },
          data: { score },
        });
      } else {
        // Create new entry
        leaderboardEntry = await prisma.leaderboardEntry.create({
          data: {
            userId: req.user.id,
            mode: mode as GameModeType,
            score,
          },
        });
      }
    }

    // Get user's rank based on their BEST score (leaderboard entry), not current game score
    const userBestScore = leaderboardEntry?.score || existingEntry?.score || score;
    const rank = await prisma.leaderboardEntry.count({
      where: {
        mode: mode as GameModeType,
        score: { gt: userBestScore },
      },
    });

    return res.json({
      message: 'Score submitted successfully',
      session: {
        id: session.id,
        score: session.score,
        mode: session.mode,
        createdAt: session.createdAt,
      },
      isNewHighScore,
      rank: rank + 1, // User's overall rank in this mode based on their best score
      leaderboardEntry: leaderboardEntry || existingEntry,
    });
  } catch (error) {
    console.error('Submit score error:', error);
    return res.status(500).json({ message: 'Failed to submit score' });
  }
}

/**
 * Get leaderboard
 * GET /api/game/leaderboard
 */
export async function getLeaderboard(req: AuthRequest, res: Response) {
  try {
    const mode = req.query.mode as string;
    const limit = parseInt(req.query.limit as string) || 100;

    // Validate mode if provided
    if (
      mode &&
      ![
        'FLAGS',
        'CAPITALS',
        'MAPS',
        'MIXED',
        'GUESS_FLAG',
        'TIME_TRIAL',
        'FIND_CAPITAL',
        'HIGHER_LOWER',
        'SILHOUETTE',
      ].includes(mode)
    ) {
      return res.status(400).json({ message: 'Invalid game mode' });
    }

    let entries: any[];

    if (!mode) {
      // When no mode is specified, get all entries sorted by score
      // Exclude banned users from leaderboard
      entries = await prisma.leaderboardEntry.findMany({
        take: limit,
        orderBy: { score: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              status: true,
            },
          },
        },
        where: {
          user: {
            status: {
              not: 'BANNED',
            },
          },
        },
      });
    } else {
      // Get top entries for specific mode
      // Exclude banned users from leaderboard
      entries = await prisma.leaderboardEntry.findMany({
        where: {
          mode: mode as GameModeType,
          user: {
            status: {
              not: 'BANNED',
            },
          },
        },
        take: limit,
        orderBy: { score: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              status: true,
            },
          },
        },
      });
    }

    // Add rank to each entry
    const rankedEntries = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // If user is authenticated, get their rank
    let userRank = null;
    if (req.user && mode) {
      const userEntry = await prisma.leaderboardEntry.findFirst({
        where: {
          userId: req.user.id,
          mode: mode as GameModeType,
        },
      });

      if (userEntry) {
        const rank = await prisma.leaderboardEntry.count({
          where: {
            mode: mode as GameModeType,
            score: { gt: userEntry.score },
          },
        });

        userRank = {
          ...userEntry,
          rank: rank + 1,
          user: {
            id: req.user.id,
            username: req.user.username,
          },
        };
      }
    }

    return res.json({
      leaderboard: rankedEntries,
      userRank,
      mode,
      total: entries.length,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
}

/**
 * Get user's game history
 * GET /api/game/history
 */
export async function getGameHistory(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const mode = req.query.mode as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId: req.user.id };
    if (mode) {
      where.mode = mode as GameModeType;
    }

    const [sessions, total] = await Promise.all([
      prisma.gameSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.gameSession.count({ where }),
    ]);

    return res.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get game history error:', error);
    return res.status(500).json({ message: 'Failed to fetch game history' });
  }
}

/**
 * Get user's statistics
 * GET /api/game/stats
 */
export async function getUserStats(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const [totalGames, highScores, modeStats] = await Promise.all([
      prisma.gameSession.count({
        where: { userId: req.user.id },
      }),
      prisma.leaderboardEntry.findMany({
        where: { userId: req.user.id },
      }),
      prisma.gameSession.groupBy({
        by: ['mode'],
        where: { userId: req.user.id },
        _count: true,
        _avg: { score: true },
        _max: { score: true },
      }),
    ]);

    return res.json({
      totalGames,
      highScores: highScores.map((entry) => ({
        mode: entry.mode,
        score: entry.score,
        achievedAt: entry.createdAt,
      })),
      modeStats: modeStats.map((stat) => ({
        mode: stat.mode,
        gamesPlayed: stat._count,
        averageScore: Math.round(stat._avg.score || 0),
        highScore: stat._max.score || 0,
      })),
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch user statistics' });
  }
}

/**
 * Get available game modes
 * GET /api/game/modes
 */
export async function getGameModes(_req: AuthRequest, res: Response) {
  try {
    const gameModes = await prisma.gameMode.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        enabled: true,
      },
    });

    return res.json({ modes: gameModes });
  } catch (error) {
    console.error('Get game modes error:', error);
    return res.status(500).json({ message: 'Failed to fetch game modes' });
  }
}

/**
 * Get public system settings
 * GET /api/game/settings
 */
export async function getPublicSettings(_req: AuthRequest, res: Response) {
  try {
    const settings = await getSystemSettings();

    return res.json({
      requireRegistration: settings.requireRegistration,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    // Return default settings if table doesn't exist yet (before migration)
    return res.json({
      requireRegistration: false,
      maintenanceMode: false,
      maintenanceMessage: null,
    });
  }
}
