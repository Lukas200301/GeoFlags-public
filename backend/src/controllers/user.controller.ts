import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * User Controller
 *
 * Handles public user profile viewing
 */

/**
 * Get public user profile
 * GET /api/users/:userId
 * 
 * Returns only public information:
 * - Username
 * - Avatar
 * - Join date
 * - Game statistics
 * - Recent game history
 * 
 * Does NOT expose:
 * - Email
 * - Password hash
 * - Role
 * - Status
 * - IP addresses
 */
export async function getPublicUserProfile(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    // Get user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get game sessions for stats
    const gameSessions = await prisma.gameSession.findMany({
      where: { userId },
      select: {
        mode: true,
        score: true,
        data: true,
        completedAt: true,
        createdAt: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Calculate stats
    const totalGames = gameSessions.length;
    const totalScore = gameSessions.reduce((sum, session) => sum + session.score, 0);
    const averageScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;

    // High scores per mode
    const highScores: Record<string, number> = {};
    gameSessions.forEach(session => {
      const mode = session.mode;
      if (!highScores[mode] || session.score > highScores[mode]) {
        highScores[mode] = session.score;
      }
    });

    // Games per mode
    const gamesPerMode: Record<string, number> = {};
    gameSessions.forEach(session => {
      const mode = session.mode;
      gamesPerMode[mode] = (gamesPerMode[mode] || 0) + 1;
    });

    // Average scores per mode
    const averageScoresByMode: Record<string, number> = {};
    const scoresByMode: Record<string, number[]> = {};
    gameSessions.forEach(session => {
      const mode = session.mode;
      if (!scoresByMode[mode]) {
        scoresByMode[mode] = [];
      }
      scoresByMode[mode].push(session.score);
    });
    Object.keys(scoresByMode).forEach(mode => {
      const scores = scoresByMode[mode];
      const sum = scores.reduce((a, b) => a + b, 0);
      averageScoresByMode[mode] = Math.round(sum / scores.length);
    });

    // Get recent game history (last 20 games)
    const gameHistory = gameSessions.slice(0, 20).map(session => {
      const data = session.data as any || {};
      
      return {
        id: `${session.createdAt.getTime()}`, // Use timestamp as ID for privacy
        mode: session.mode,
        score: session.score,
        timeSpent: data.timeSpent || data.timeTaken || 0,
        accuracy: data.accuracy || 0,
        createdAt: session.completedAt || session.createdAt,
      };
    });

    // Return public profile
    return res.json({
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      stats: {
        totalGames,
        totalScore,
        averageScore,
        highScores,
        gamesPerMode,
        averageScoresByMode,
      },
      gameHistory,
    });
  } catch (error) {
    console.error('Error fetching public user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Search users by username
 * GET /api/users/search?q=username
 * 
 * Returns only public information for search results
 */
export async function searchUsers(req: Request, res: Response) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    if (q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    // Search users by username (case-insensitive)
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
      },
      take: 10, // Limit to 10 results
    });

    return res.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Get public platform statistics
 * GET /api/users/stats/public
 *
 * Returns basic platform stats for the homepage:
 * - Total registered users
 * - Total games completed
 * - Total game modes available
 *
 * Cached for 10 minutes to reduce database load
 */

// Cache for public stats
let publicStatsCache: {
  data: {
    totalUsers: number;
    totalGames: number;
    gameModes: number;
    totalCountries: number;
  } | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export async function getPublicStats(_req: Request, res: Response) {
  try {
    const now = Date.now();

    // Check if cache is still valid
    if (publicStatsCache.data && (now - publicStatsCache.timestamp) < CACHE_DURATION) {
      // Return cached data with cache headers
      return res
        .set('X-Cache', 'HIT')
        .set('Cache-Control', `public, max-age=${Math.floor((CACHE_DURATION - (now - publicStatsCache.timestamp)) / 1000)}`)
        .json(publicStatsCache.data);
    }

    // Cache miss or expired - fetch fresh data
    const totalUsers = await prisma.user.count();
    const totalGames = await prisma.gameSession.count();
    const gameModes = await prisma.gameMode.count({
      where: {
        enabled: true,
      },
    });

    const stats = {
      totalUsers,
      totalGames,
      gameModes,
      totalCountries: 250, // Static value for countries
    };

    // Update cache
    publicStatsCache = {
      data: stats,
      timestamp: now,
    };

    return res
      .set('X-Cache', 'MISS')
      .set('Cache-Control', `public, max-age=${CACHE_DURATION / 1000}`)
      .json(stats);
  } catch (error) {
    console.error('Error fetching public stats:', error);

    // If we have cached data, return it even if expired during an error
    if (publicStatsCache.data) {
      return res
        .set('X-Cache', 'STALE')
        .json(publicStatsCache.data);
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
}
