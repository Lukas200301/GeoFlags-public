import { Response } from 'express';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';
import { z } from 'zod';

/**
 * Profile Controller
 *
 * Handles user profile management, settings, and statistics
 */

const SALT_ROUNDS = 10;

// Validation schemas
const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().email().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});


/**
 * Get current user's profile
 * GET /api/profile
 */
export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        role: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update last active timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() },
    });

    return res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Update user profile
 * PATCH /api/profile
 */
export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Validate input
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: validation.error.errors,
      });
    }

    const { username, email } = validation.data;

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      const existing = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                username ? { username } : {},
                email ? { email } : {},
              ],
            },
          ],
        },
      });

      if (existing) {
        return res.status(409).json({
          message: existing.username === username ? 'Username already taken' : 'Email already registered',
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(email && { email }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        role: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Update avatar URL
 * POST /api/profile/avatar
 *
 * SECURITY:
 * - File validated by multer and validateAvatarUpload middleware
 * - Old avatar files are deleted to prevent storage bloat
 * - Avatar URLs use backend API endpoint for proper access control
 */
export async function updateAvatar(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get current user to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    // The path to the uploaded file (relative to avatars directory)
    const avatarPath = `/avatars/${req.file.filename}`;

    // Update the user's avatarUrl in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: avatarPath },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
    });

    // SECURITY: Delete old avatar file if it exists
    if (currentUser?.avatarUrl) {
      try {
        const oldFilename = currentUser.avatarUrl.split('/').pop();
        if (oldFilename) {
          const oldFilePath = path.join(__dirname, '../../cache/avatars', oldFilename);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      } catch (deleteError) {
        // Non-critical error, just log it
        console.error('Failed to delete old avatar:', deleteError);
      }
    }

    return res.json({
      message: 'Avatar updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Change password
 * PATCH /api/profile/password
 */
export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Validate input
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: validation.error.errors,
      });
    }

    const { currentPassword, newPassword } = validation.data;

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true, tokenVersion: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and increment token version (invalidate all sessions)
    await prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
        tokenVersion: user.tokenVersion + 1,
      },
    });

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({
      message: 'Password changed successfully. Please log in again.',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Get game history
 * GET /api/profile/game-history
 */
export async function getGameHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Get all game sessions with details
    const gameSessions = await prisma.gameSession.findMany({
      where: { userId },
      select: {
        id: true,
        mode: true,
        score: true,
        data: true,
        completedAt: true,
        createdAt: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 50, // Limit to last 50 games
    });

    // Transform data for frontend
    const gameHistory = gameSessions.map(session => {
      const data = session.data as any || {};
      
      return {
        id: session.id,
        mode: session.mode,
        score: session.score,
        timeSpent: data.timeSpent || data.timeTaken || 0,
        accuracy: data.accuracy || 0,
        createdAt: session.completedAt || session.createdAt,
      };
    });

    return res.json(gameHistory);
  } catch (error) {
    console.error('Error fetching game history:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Get user statistics
 * GET /api/profile/stats
 */
export async function getStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Get game sessions count and scores with data field
    const gameSessions = await prisma.gameSession.findMany({
      where: { userId },
      select: {
        mode: true,
        score: true,
        data: true,
        createdAt: true,
        completedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
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

    // Games per mode and average scores per mode
    const gamesPerMode: Record<string, number> = {};
    const scoresByMode: Record<string, number[]> = {};
    gameSessions.forEach(session => {
      const mode = session.mode;
      gamesPerMode[mode] = (gamesPerMode[mode] || 0) + 1;
      if (!scoresByMode[mode]) {
        scoresByMode[mode] = [];
      }
      scoresByMode[mode].push(session.score);
    });

    // Calculate average scores per mode
    const averageScoresByMode: Record<string, number> = {};
    Object.keys(scoresByMode).forEach(mode => {
      const scores = scoresByMode[mode];
      averageScoresByMode[mode] = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );
    });

    // Performance over time (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = gameSessions.filter(
      session => new Date(session.createdAt) >= thirtyDaysAgo
    );

    const dailyStats: Record<string, { totalScore: number; count: number; date: string }> = {};
    recentSessions.forEach(session => {
      const dateKey = new Date(session.createdAt).toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { totalScore: 0, count: 0, date: dateKey };
      }
      dailyStats[dateKey].totalScore += session.score;
      dailyStats[dateKey].count += 1;
    });

    const performanceOverTime = Object.values(dailyStats)
      .map(day => ({
        date: day.date,
        averageScore: Math.round(day.totalScore / day.count),
        gamesPlayed: day.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Recent games trend (last 20 games)
    const recentGames = gameSessions.slice(-20).map((session, index) => ({
      gameNumber: index + 1,
      score: session.score,
      mode: session.mode,
      date: session.createdAt,
    }));

    // Activity by day of week
    const dayOfWeekStats: Record<number, { count: number; totalScore: number }> = {};
    gameSessions.forEach(session => {
      const dayOfWeek = new Date(session.createdAt).getDay(); // 0 = Sunday, 6 = Saturday
      if (!dayOfWeekStats[dayOfWeek]) {
        dayOfWeekStats[dayOfWeek] = { count: 0, totalScore: 0 };
      }
      dayOfWeekStats[dayOfWeek].count += 1;
      dayOfWeekStats[dayOfWeek].totalScore += session.score;
    });

    const activityByDayOfWeek = [0, 1, 2, 3, 4, 5, 6].map(day => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
      gamesPlayed: dayOfWeekStats[day]?.count || 0,
      averageScore: dayOfWeekStats[day]
        ? Math.round(dayOfWeekStats[day].totalScore / dayOfWeekStats[day].count)
        : 0,
    }));

    // Calculate accuracy stats if available in data field
    const accuracyData: number[] = [];
    gameSessions.forEach(session => {
      const data = session.data as any;
      if (data && typeof data.accuracy === 'number') {
        accuracyData.push(data.accuracy);
      }
    });

    const averageAccuracy = accuracyData.length > 0
      ? Math.round(accuracyData.reduce((a, b) => a + b, 0) / accuracyData.length)
      : null;

    // Streak calculation (consecutive days played)
    const uniqueDates = [...new Set(gameSessions.map(s =>
      new Date(s.createdAt).toISOString().split('T')[0]
    ))].sort().reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
        // Check if today or yesterday
        const daysDiff = Math.floor((new Date(today).getTime() - new Date(uniqueDates[0]).getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) {
          currentStreak = 1;
        }
      } else {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (i === 0 || currentStreak > 0) {
            currentStreak++;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Favorites count (placeholder - can be implemented later with favorite countries feature)
    const favorites = {
      count: 0,
    };

    // Learn mode stats (placeholder - can be implemented when learn mode tracking is added)
    const learnMode = {
      countriesViewed: 0,
      totalViews: 0,
      masterred: 0,
    };

    return res.json({
      totalGames,
      totalScore,
      averageScore,
      highScores,
      gamesPerMode,
      averageScoresByMode,
      performanceOverTime,
      recentGames,
      activityByDayOfWeek,
      averageAccuracy,
      currentStreak,
      longestStreak,
      favorites,
      learnMode,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Delete user account
 * DELETE /api/profile
 *
 * Deletes the user account and all associated data:
 * - Game sessions
 * - Leaderboard entries
 * - Admin audit logs
 * All deletions cascade automatically due to schema relationships
 */
export async function deleteAccount(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Verify current password for security
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true, username: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Delete user account
    // All related data (game sessions, leaderboard entries, admin audits)
    // will be deleted automatically due to onDelete: Cascade in schema
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}