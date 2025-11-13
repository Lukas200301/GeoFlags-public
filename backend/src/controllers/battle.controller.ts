import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';
import { generateBattleQuestions } from '../utils/battle-questions';

/**
 * Battle Controller
 *
 * Handles 1v1 battles, challenges, and matchmaking
 */

/**
 * Get total rounds for a battle mode
 */
function getTotalRounds(mode: string): number {
  switch (mode) {
    case 'BATTLE_FLAG_SPEED':
      return 10;
    case 'BATTLE_CAPITAL_RUSH':
      return 10;
    case 'BATTLE_GEOGRAPHY_DUEL':
      return 15;
    case 'BATTLE_EXPERT_SHOWDOWN':
      return 20;
    default:
      return 10;
  }
}

/**
 * Get user's active battles
 * GET /api/battles/active
 */
export async function getActiveBattles(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const battles = await prisma.battle.findMany({
      where: {
        OR: [
          { challengerId: userId },
          { opponentId: userId },
        ],
        status: {
          in: ['WAITING', 'IN_PROGRESS'],
        },
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ battles });
  } catch (error) {
    console.error('Error fetching active battles:', error);
    res.status(500).json({ error: 'Failed to fetch active battles' });
  }
}

/**
 * Get user's battle history
 * GET /api/battles/history
 */
export async function getBattleHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const battles = await prisma.battle.findMany({
      where: {
        OR: [
          { challengerId: userId },
          { opponentId: userId },
        ],
        status: 'COMPLETED',
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        winner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
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
      orderBy: {
        completedAt: 'desc',
      },
    });

    res.json({ battles });
  } catch (error) {
    console.error('Error fetching battle history:', error);
    res.status(500).json({ error: 'Failed to fetch battle history' });
  }
}

/**
 * Get battle details
 * GET /api/battles/:battleId
 */
export async function getBattleDetails(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const battleId = req.params.battleId;

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        winner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
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

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Verify user is a participant
    if (battle.challengerId !== userId && battle.opponentId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this battle' });
    }

    res.json({ battle });
  } catch (error) {
    console.error('Error fetching battle details:', error);
    res.status(500).json({ error: 'Failed to fetch battle details' });
  }
}

/**
 * Challenge a friend to a battle
 * POST /api/battles/challenge/:friendId
 */
export async function challengeFriend(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const friendId = req.params.friendId;
    const { mode } = req.body;

    if (!mode) {
      return res.status(400).json({ error: 'Game mode is required' });
    }

    // Verify game mode is valid
    const gameMode = await prisma.gameMode.findUnique({
      where: { id: mode },
    });

    if (!gameMode || !gameMode.enabled) {
      return res.status(400).json({ error: 'Invalid or disabled game mode' });
    }

    // Verify friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId, status: 'ACCEPTED' },
          { userId: friendId, friendId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    if (!friendship) {
      return res.status(400).json({ error: 'Can only challenge friends' });
    }

    // Check if friend is online/active (you can add more sophisticated online tracking)
    const friend = await prisma.user.findUnique({
      where: { id: friendId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        status: true,
      },
    });

    if (!friend || friend.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'User is not available for challenges' });
    }

    // Generate questions for the battle
    const totalRounds = getTotalRounds(mode);
    const questions = generateBattleQuestions(mode, totalRounds);

    // Create battle
    const battle = await prisma.battle.create({
      data: {
        mode,
        challengerId: userId,
        status: 'WAITING',
        totalRounds,
        questions: questions as any,
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create participant entry for challenger
    await prisma.battleParticipant.create({
      data: {
        battleId: battle.id,
        userId: userId,
        answers: [] as any,
      },
    });

    // TODO: Emit socket event to notify the friend
    // req.app.get('io')?.to(friendId).emit('battle:challenge', {
    //   battleId: battle.id,
    //   challenger: req.user,
    //   mode: mode,
    // });

    res.status(201).json({
      message: 'Challenge sent',
      battle: {
        id: battle.id,
        mode: battle.mode,
        challenger: battle.challenger,
        createdAt: battle.createdAt,
      },
    });
  } catch (error) {
    console.error('Error challenging friend:', error);
    res.status(500).json({ error: 'Failed to send challenge' });
  }
}

/**
 * Accept a battle challenge
 * POST /api/battles/accept/:battleId
 */
export async function acceptChallenge(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const battleId = req.params.battleId;

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    if (battle.status !== 'WAITING') {
      return res.status(400).json({ error: 'Battle is no longer waiting for players' });
    }

    if (battle.challengerId === userId) {
      return res.status(400).json({ error: 'Cannot accept your own challenge' });
    }

    // Update battle with opponent
    const updatedBattle = await prisma.battle.update({
      where: { id: battleId },
      data: {
        opponentId: userId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create participant entry for opponent
    await prisma.battleParticipant.create({
      data: {
        battleId: battle.id,
        userId: userId,
        answers: [] as any,
      },
    });

    // TODO: Emit socket event to notify the challenger
    // req.app.get('io')?.to(battle.challengerId).emit('battle:accepted', {
    //   battleId: battle.id,
    //   opponent: req.user,
    // });

    res.json({
      message: 'Challenge accepted',
      battle: updatedBattle,
    });
  } catch (error) {
    console.error('Error accepting challenge:', error);
    res.status(500).json({ error: 'Failed to accept challenge' });
  }
}

/**
 * Decline a battle challenge
 * POST /api/battles/decline/:battleId
 */
export async function declineChallenge(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const battleId = req.params.battleId;

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    if (battle.status !== 'WAITING') {
      return res.status(400).json({ error: 'Battle is no longer waiting for players' });
    }

    if (battle.challengerId === userId) {
      return res.status(400).json({ error: 'Cannot decline your own challenge' });
    }

    // Update battle to cancelled
    await prisma.battle.update({
      where: { id: battleId },
      data: {
        status: 'CANCELLED',
      },
    });

    // TODO: Emit socket event to notify the challenger
    // req.app.get('io')?.to(battle.challengerId).emit('battle:declined', {
    //   battleId: battle.id,
    //   declinedBy: req.user,
    // });

    res.json({ message: 'Challenge declined' });
  } catch (error) {
    console.error('Error declining challenge:', error);
    res.status(500).json({ error: 'Failed to decline challenge' });
  }
}

/**
 * Mark player as ready
 * POST /api/battles/:battleId/ready
 */
export async function markReady(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const battleId = req.params.battleId;

    const participant = await prisma.battleParticipant.findFirst({
      where: {
        battleId: battleId,
        userId: userId,
      },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Not a participant in this battle' });
    }

    await prisma.battleParticipant.update({
      where: { id: participant.id },
      data: { isReady: true },
    });

    res.json({ message: 'Marked as ready' });
  } catch (error) {
    console.error('Error marking ready:', error);
    res.status(500).json({ error: 'Failed to mark as ready' });
  }
}

/**
 * Submit an answer
 * POST /api/battles/:battleId/answer
 */
export async function submitAnswer(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const battleId = req.params.battleId;
    const { questionIndex, answer, timeSpent } = req.body;

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    if (battle.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Battle is not in progress' });
    }

    const participant = await prisma.battleParticipant.findFirst({
      where: {
        battleId: battleId,
        userId: userId,
      },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Not a participant in this battle' });
    }

    // Get current answers
    const answers = (participant.answers as any[]) || [];

    // Check if question is correct
    const questions = battle.questions as any[];
    const question = questions[questionIndex];
    const isCorrect = question.correctAnswer === answer;

    // Calculate points (base points + time bonus)
    const basePoints = isCorrect ? 100 : 0;
    const timeBonus = isCorrect ? Math.max(0, 50 - Math.floor(timeSpent / 1000)) : 0;
    const points = basePoints + timeBonus;

    // Add answer
    answers.push({
      questionIndex,
      answer,
      isCorrect,
      timeSpent,
      points,
      timestamp: new Date(),
    });

    // Update participant
    const updatedParticipant = await prisma.battleParticipant.update({
      where: { id: participant.id },
      data: {
        answers: answers as any,
        score: participant.score + points,
      },
    });

    res.json({
      isCorrect,
      points,
      totalScore: updatedParticipant.score,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
}

/**
 * Forfeit a battle
 * POST /api/battles/:battleId/forfeit
 */
export async function forfeitBattle(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const battleId = req.params.battleId;

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    if (battle.challengerId !== userId && battle.opponentId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Handle WAITING status (cancel room)
    if (battle.status === 'WAITING') {
      // Only the host can cancel a waiting room
      if (battle.challengerId !== userId) {
        return res.status(403).json({ error: 'Only the host can cancel the room' });
      }

      // Delete the battle and participants
      await prisma.battleParticipant.deleteMany({
        where: { battleId: battleId },
      });

      await prisma.battle.delete({
        where: { id: battleId },
      });

      return res.json({ message: 'Room cancelled' });
    }

    // Handle IN_PROGRESS status (forfeit)
    if (battle.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Battle cannot be forfeited' });
    }

    // Determine winner (the other player)
    const winnerId = battle.challengerId === userId ? battle.opponentId : battle.challengerId;

    // Get participants to preserve their scores
    const participants = await prisma.battleParticipant.findMany({
      where: { battleId: battleId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Mark participants as completed
    await Promise.all(
      participants.map((p) =>
        prisma.battleParticipant.update({
          where: { id: p.id },
          data: { completedAt: new Date() },
        })
      )
    );

    await prisma.battle.update({
      where: { id: battleId },
      data: {
        status: 'COMPLETED',
        winnerId: winnerId,
        completedAt: new Date(),
      },
    });

    res.json({ message: 'Battle forfeited', winnerId, participants });
  } catch (error) {
    console.error('Error forfeiting battle:', error);
    res.status(500).json({ error: 'Failed to forfeit battle' });
  }
}

/**
 * Join matchmaking queue
 * POST /api/battles/matchmaking/join
 */
export async function joinMatchmaking(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { mode } = req.body;

    if (!mode) {
      return res.status(400).json({ error: 'Game mode is required' });
    }

    // Verify game mode is valid
    const gameMode = await prisma.gameMode.findUnique({
      where: { id: mode },
    });

    if (!gameMode || !gameMode.enabled) {
      return res.status(400).json({ error: 'Invalid or disabled game mode' });
    }

    // TODO: Implement matchmaking queue logic with Socket.io
    // For now, return a message that matchmaking is not yet implemented
    res.status(501).json({ message: 'Matchmaking coming soon! Challenge your friends for now.' });
  } catch (error) {
    console.error('Error joining matchmaking:', error);
    res.status(500).json({ error: 'Failed to join matchmaking' });
  }
}

/**
 * Leave matchmaking queue
 * POST /api/battles/matchmaking/leave
 */
export async function leaveMatchmaking(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // TODO: Implement matchmaking queue logic with Socket.io
    res.json({ message: 'Left matchmaking queue' });
  } catch (error) {
    console.error('Error leaving matchmaking:', error);
    res.status(500).json({ error: 'Failed to leave matchmaking' });
  }
}

/**
 * Create a public battle room
 * POST /api/battles/rooms/create
 */
export async function createPublicRoom(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { mode } = req.body;

    if (!mode) {
      return res.status(400).json({ error: 'Game mode is required' });
    }

    // Validate battle-specific mode
    const validModes = ['BATTLE_FLAG_SPEED', 'BATTLE_CAPITAL_RUSH', 'BATTLE_GEOGRAPHY_DUEL', 'BATTLE_EXPERT_SHOWDOWN'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({ error: 'Invalid battle mode' });
    }

    // Check if user is banned or suspended
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.status === 'BANNED' || user?.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'You are not allowed to create battle rooms' });
    }

    // Generate questions for the battle
    const totalRounds = getTotalRounds(mode);
    const questions = generateBattleQuestions(mode, totalRounds);

    // Create battle room
    const battle = await prisma.battle.create({
      data: {
        mode,
        challengerId: userId,
        status: 'WAITING',
        totalRounds,
        questions: questions as any,
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create participant entry for host
    await prisma.battleParticipant.create({
      data: {
        battleId: battle.id,
        userId: userId,
        answers: [] as any,
      },
    });

    res.json({ battle });
  } catch (error) {
    console.error('Error creating public room:', error);
    res.status(500).json({ error: 'Failed to create battle room' });
  }
}

/**
 * Get all available public rooms
 * GET /api/battles/rooms
 */
export async function getPublicRooms(req: AuthRequest, res: Response) {
  try {
    const battles = await prisma.battle.findMany({
      where: {
        status: 'WAITING',
        opponentId: null,
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    res.json({ battles });
  } catch (error) {
    console.error('Error fetching public rooms:', error);
    res.status(500).json({ error: 'Failed to fetch public rooms' });
  }
}

/**
 * Join a public battle room
 * POST /api/battles/rooms/:battleId/join
 */
export async function joinPublicRoom(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const battleId = req.params.battleId;

    // Find the battle
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        participants: true,
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!battle) {
      return res.status(404).json({ error: 'Battle room not found' });
    }

    if (battle.status !== 'WAITING') {
      return res.status(400).json({ error: 'Battle room is not available' });
    }

    if (battle.opponentId) {
      return res.status(400).json({ error: 'Battle room is already full' });
    }

    if (battle.challengerId === userId) {
      return res.status(400).json({ error: 'Cannot join your own battle room' });
    }

    // Update battle with opponent
    const updatedBattle = await prisma.battle.update({
      where: { id: battleId },
      data: {
        opponentId: userId,
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        participants: true,
      },
    });

    // Create participant entry for joiner
    await prisma.battleParticipant.create({
      data: {
        battleId: battle.id,
        userId: userId,
        answers: [] as any,
      },
    });

    // TODO: Emit socket event to notify host that someone joined
    // socket.to(battleId).emit('battle:opponent:joined', { opponent: updatedBattle.opponent });

    res.json({ battle: updatedBattle });
  } catch (error) {
    console.error('Error joining public room:', error);
    res.status(500).json({ error: 'Failed to join battle room' });
  }
}
