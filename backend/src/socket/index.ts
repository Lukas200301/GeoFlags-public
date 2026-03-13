import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../utils/prisma';

/**
 * Socket.io Server Setup
 *
 * SECURITY:
 * - Authentication required via JWT token
 * - User data attached to socket
 * - Room-based broadcasting for game modes
 * - Error handling for failed authentication
 */

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  role?: string;
}

export function setupSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/socket.io/',
  });

  /**
   * Authentication middleware
   * Verifies JWT token before allowing connection
   */
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Extract token from cookies, handshake auth, or authorization header
      const cookies = socket.handshake.headers.cookie;
      let token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      // Parse accessToken from cookies if not provided in auth
      if (!token && cookies) {
        const cookieMatch = cookies.match(/accessToken=([^;]+)/);
        if (cookieMatch) {
          token = cookieMatch[1];
        }
      }

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify token
      const payload = verifyAccessToken(token);

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          username: true,
          role: true,
          tokenVersion: true,
        },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      // Verify token version
      if (user.tokenVersion !== payload.tokenVersion) {
        return next(new Error('Token revoked'));
      }

      // Attach user data to socket
      socket.userId = user.id;
      socket.username = user.username;
      socket.role = user.role;

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  /**
   * Connection handler
   */
  io.on('connection', (socket: AuthenticatedSocket) => {
    /**
     * Join game mode room
     */
    socket.on('game:join', (mode: string) => {
      socket.join(`game:${mode}`);

      // Send current leaderboard for this mode
      getLeaderboardForMode(mode).then((leaderboard) => {
        socket.emit('leaderboard:update', leaderboard);
      });
    });

    /**
     * Leave game mode room
     */
    socket.on('game:leave', (mode: string) => {
      socket.leave(`game:${mode}`);
    });

    /**
     * Broadcast score update
     * When a user submits a score, broadcast to all in that game mode
     */
    socket.on('score:submit', async (data: { mode: string; score: number }) => {
      try {
        // Get updated leaderboard
        const leaderboard = await getLeaderboardForMode(data.mode);

        // Broadcast to all users in this game mode room
        io.to(`game:${data.mode}`).emit('leaderboard:update', leaderboard);
      } catch (error) {
        // Silent error handling
      }
    });

    /**
     * Admin events (only for admin users)
     */
    socket.on('admin:action', async (data: { action: string; details: any }) => {
      if (socket.role !== 'ADMIN') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Broadcast admin action to all admin clients
      io.to('admin-room').emit('admin:update', {
        action: data.action,
        details: data.details,
        timestamp: new Date(),
      });
    });

    // Admin users join admin room
    if (socket.role === 'ADMIN') {
      socket.join('admin-room');
    }

    /**
     * Friends events
     */
    // Join user's personal room for receiving friend notifications
    socket.join(`user:${socket.userId}`);

    socket.on('friend:request:send', (data: { targetUserId: string; friendshipId: string }) => {
      // Notify the target user about the friend request
      io.to(`user:${data.targetUserId}`).emit('friend:request:received', {
        friendshipId: data.friendshipId,
        from: {
          id: socket.userId,
          username: socket.username,
        },
        timestamp: new Date(),
      });
    });

    socket.on('friend:request:accepted', (data: { targetUserId: string; friendshipId: string }) => {
      // Notify the requester that their friend request was accepted
      io.to(`user:${data.targetUserId}`).emit('friend:request:accepted', {
        friendshipId: data.friendshipId,
        by: {
          id: socket.userId,
          username: socket.username,
        },
        timestamp: new Date(),
      });
    });

    /**
     * Battle events
     */
    socket.on(
      'battle:challenge:send',
      (data: { opponentId: string; battleId: string; mode: string }) => {
        // Notify opponent about the challenge
        io.to(`user:${data.opponentId}`).emit('battle:challenge:received', {
          battleId: data.battleId,
          challenger: {
            id: socket.userId,
            username: socket.username,
          },
          mode: data.mode,
          timestamp: new Date(),
        });
      }
    );

    socket.on('battle:challenge:accepted', (data: { challengerId: string; battleId: string }) => {
      // Notify challenger that their challenge was accepted
      io.to(`user:${data.challengerId}`).emit('battle:challenge:accepted', {
        battleId: data.battleId,
        opponent: {
          id: socket.userId,
          username: socket.username,
        },
        timestamp: new Date(),
      });
    });

    socket.on('battle:challenge:declined', (data: { challengerId: string; battleId: string }) => {
      // Notify challenger that their challenge was declined
      io.to(`user:${data.challengerId}`).emit('battle:challenge:declined', {
        battleId: data.battleId,
        declinedBy: {
          id: socket.userId,
          username: socket.username,
        },
        timestamp: new Date(),
      });
    });

    socket.on('battle:join', (battleId: string) => {
      // Join battle room
      socket.join(`battle:${battleId}`);

      // Notify other participant
      socket.to(`battle:${battleId}`).emit('battle:opponent:joined', {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on('battle:leave', (battleId: string) => {
      socket.leave(`battle:${battleId}`);
    });

    socket.on('battle:ready', async (data: { battleId: string }) => {
      // Notify other participant that this player is ready
      socket.to(`battle:${data.battleId}`).emit('battle:opponent:ready', {
        userId: socket.userId,
        username: socket.username,
      });

      // Check if both participants are ready
      const battle = await prisma.battle.findUnique({
        where: { id: data.battleId },
        include: {
          participants: true,
        },
      });

      if (battle && battle.participants.length === 2) {
        const allReady = battle.participants.every((p) => p.isReady);
        if (allReady) {
          // Update battle status to IN_PROGRESS
          await prisma.battle.update({
            where: { id: data.battleId },
            data: {
              status: 'IN_PROGRESS',
              startedAt: new Date(),
            },
          });

          // Start the battle
          io.to(`battle:${data.battleId}`).emit('battle:start', {
            battleId: data.battleId,
            questions: battle.questions,
            totalRounds: battle.totalRounds,
          });
        }
      }
    });

    socket.on(
      'battle:answer:submit',
      async (data: {
        battleId: string;
        questionIndex: number;
        answer: string;
        isCorrect: boolean;
        points: number;
        totalScore?: number;
      }) => {
        // Broadcast answer to other participant (without revealing the answer itself)
        socket.to(`battle:${data.battleId}`).emit('battle:opponent:answered', {
          userId: socket.userId,
          username: socket.username,
          questionIndex: data.questionIndex,
          totalScore: data.totalScore,
        });

        // Check if battle is complete
        const battle = await prisma.battle.findUnique({
          where: { id: data.battleId },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        });

        if (battle) {
          const allParticipantsFinished = battle.participants.every((p) => {
            const answers = (p.answers as any[]) || [];
            return answers.length >= battle.totalRounds;
          });

          if (allParticipantsFinished) {
            // Determine winner
            const [participant1, participant2] = battle.participants;
            let winnerId = null;
            if (participant1.score > participant2.score) {
              winnerId = participant1.userId;
            } else if (participant2.score > participant1.score) {
              winnerId = participant2.userId;
            }
            // If scores are equal, winnerId stays null (tie)

            // Update battle
            await prisma.battle.update({
              where: { id: data.battleId },
              data: {
                status: 'COMPLETED',
                winnerId: winnerId,
                completedAt: new Date(),
              },
            });

            // Mark participants as completed
            await Promise.all(
              battle.participants.map((p) =>
                prisma.battleParticipant.update({
                  where: { id: p.id },
                  data: { completedAt: new Date() },
                })
              )
            );

            // Broadcast battle complete
            io.to(`battle:${data.battleId}`).emit('battle:complete', {
              battleId: data.battleId,
              winnerId: winnerId,
              participants: battle.participants,
            });
          }
        }
      }
    );

    socket.on(
      'battle:forfeit',
      (data: { battleId: string; winnerId: string; participants?: any[] }) => {
        // Notify other participant
        socket.to(`battle:${data.battleId}`).emit('battle:opponent:forfeited', {
          userId: socket.userId,
          username: socket.username,
          winnerId: data.winnerId,
          participants: data.participants,
        });
      }
    );

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      // Handle disconnect
    });

    /**
     * Error handler
     */
    socket.on('error', (_error) => {
      // Handle error
    });
  });

  return io;
}

/**
 * Helper function to get leaderboard for a specific mode
 */
async function getLeaderboardForMode(mode: string) {
  try {
    const entries = await prisma.leaderboardEntry.findMany({
      where: { mode: mode as any },
      take: 100,
      orderBy: { score: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Broadcast leaderboard update to all clients in a game mode
 * Can be called from controllers after score submission
 */
export async function broadcastLeaderboardUpdate(io: SocketIOServer, mode: string) {
  try {
    const leaderboard = await getLeaderboardForMode(mode);
    io.to(`game:${mode}`).emit('leaderboard:update', leaderboard);
  } catch (error) {
    // Silent error handling
  }
}
