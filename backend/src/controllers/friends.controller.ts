import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';


/**
 * Friends Controller
 *
 * Handles friend requests, friendships, and friend management
 */

/**
 * Get user's friends list
 * GET /api/friends
 */
export async function getFriends(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Get accepted friendships where user is either the requester or recipient
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            lastActive: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            lastActive: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Map to return the friend (not the current user)
    const friends = friendships.map((friendship) => {
      const isFriend = friendship.userId === userId;
      const friendData = isFriend ? friendship.friend : friendship.user;

      return {
        friendshipId: friendship.id,
        friend: friendData,
        since: friendship.createdAt,
      };
    });

    res.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
}

/**
 * Get pending friend requests (both sent and received)
 * GET /api/friends/requests
 */
export async function getFriendRequests(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Get pending requests sent to the user
    const receivedRequests = await prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            lastActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get pending requests sent by the user
    const sentRequests = await prisma.friendship.findMany({
      where: {
        userId: userId,
        status: 'PENDING',
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            lastActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      received: receivedRequests.map((req) => ({
        friendshipId: req.id,
        from: req.user,
        createdAt: req.createdAt,
      })),
      sent: sentRequests.map((req) => ({
        friendshipId: req.id,
        to: req.friend,
        createdAt: req.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
}

/**
 * Send a friend request
 * POST /api/friends/request/:userId
 */
export async function sendFriendRequest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const targetUserId = req.params.userId;

    // Cannot send friend request to self
    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if target user is banned
    if (targetUser.status === 'BANNED' || targetUser.status === 'SUSPENDED') {
      return res.status(400).json({ error: 'Cannot send friend request to this user' });
    }

    // Check if friendship already exists (in either direction)
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: targetUserId },
          { userId: targetUserId, friendId: userId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'BLOCKED') {
        return res.status(400).json({ error: 'Cannot send friend request' });
      }
      if (existingFriendship.status === 'PENDING') {
        return res.status(400).json({ error: 'Friend request already sent' });
      }
      if (existingFriendship.status === 'ACCEPTED') {
        return res.status(400).json({ error: 'Already friends with this user' });
      }
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        userId: userId,
        friendId: targetUserId,
        status: 'PENDING',
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // TODO: Emit socket event to notify the target user
    // req.app.get('io')?.to(targetUserId).emit('friend:request', { from: req.user });

    return res.status(201).json({
      message: 'Friend request sent',
      friendship: {
        id: friendship.id,
        to: friendship.friend,
        createdAt: friendship.createdAt,
      },
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return res.status(500).json({ error: 'Failed to send friend request' });
  }
}

/**
 * Accept a friend request
 * POST /api/friends/accept/:friendshipId
 */
export async function acceptFriendRequest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const friendshipId = req.params.friendshipId;

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
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

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Verify the current user is the recipient
    if (friendship.friendId !== userId) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }

    // Verify status is pending
    if (friendship.status !== 'PENDING') {
      return res.status(400).json({ error: 'Friend request is no longer pending' });
    }

    // Update status to accepted
    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });

    // TODO: Emit socket event to notify the requester
    // req.app.get('io')?.to(friendship.userId).emit('friend:accepted', { by: req.user });

    return res.json({
      message: 'Friend request accepted',
      friend: friendship.user,
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return res.status(500).json({ error: 'Failed to accept friend request' });
  }
}

/**
 * Reject a friend request
 * POST /api/friends/reject/:friendshipId
 */
export async function rejectFriendRequest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const friendshipId = req.params.friendshipId;

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Verify the current user is the recipient
    if (friendship.friendId !== userId) {
      return res.status(403).json({ error: 'Not authorized to reject this request' });
    }

    // Verify status is pending
    if (friendship.status !== 'PENDING') {
      return res.status(400).json({ error: 'Friend request is no longer pending' });
    }

    // Delete the friendship request
    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return res.status(500).json({ error: 'Failed to reject friend request' });
  }
}

/**
 * Remove a friend or cancel a friend request
 * DELETE /api/friends/:friendshipId
 */
export async function removeFriend(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const friendshipId = req.params.friendshipId;

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    // Verify the current user is part of this friendship
    if (friendship.userId !== userId && friendship.friendId !== userId) {
      return res.status(403).json({ error: 'Not authorized to remove this friendship' });
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return res.json({ message: 'Friendship removed' });
  } catch (error) {
    console.error('Error removing friend:', error);
    return res.status(500).json({ error: 'Failed to remove friend' });
  }
}

/**
 * Block a user
 * POST /api/friends/block/:userId
 */
export async function blockUser(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const targetUserId = req.params.userId;

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if friendship exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: targetUserId },
          { userId: targetUserId, friendId: userId },
        ],
      },
    });

    if (existingFriendship) {
      // Update existing friendship to blocked
      await prisma.friendship.update({
        where: { id: existingFriendship.id },
        data: {
          status: 'BLOCKED',
          userId: userId,
          friendId: targetUserId,
        },
      });
    } else {
      // Create new blocked friendship
      await prisma.friendship.create({
        data: {
          userId: userId,
          friendId: targetUserId,
          status: 'BLOCKED',
        },
      });
    }

    return res.json({ message: 'User blocked' });
  } catch (error) {
    console.error('Error blocking user:', error);
    return res.status(500).json({ error: 'Failed to block user' });
  }
}

/**
 * Get friend suggestions based on mutual friends or recent players
 * GET /api/friends/suggestions
 */
export async function getFriendSuggestions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Get user's existing friend IDs and pending/blocked users
    const existingRelations = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: userId },
          { friendId: userId },
        ],
      },
      select: {
        userId: true,
        friendId: true,
      },
    });

    const excludedUserIds = new Set([userId]);
    existingRelations.forEach((rel) => {
      excludedUserIds.add(rel.userId);
      excludedUserIds.add(rel.friendId);
    });

    // Get suggestions: active users not already connected
    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: Array.from(excludedUserIds),
        },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        lastActive: true,
      },
      orderBy: {
        lastActive: 'desc',
      },
      take: 10,
    });

    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch friend suggestions' });
  }
}

/**
 * Search for users to add as friends
 * GET /api/friends/search?q=username
 */
export async function searchFriends(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Get user's existing friend IDs
    const existingRelations = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: userId },
          { friendId: userId },
        ],
      },
      select: {
        userId: true,
        friendId: true,
        status: true,
      },
    });

    // Create a map of user relationships
    const relationshipMap = new Map();
    existingRelations.forEach((rel) => {
      const otherId = rel.userId === userId ? rel.friendId : rel.userId;
      relationshipMap.set(otherId, rel.status);
    });

    // Search for users
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          { id: { not: userId } },
          { status: 'ACTIVE' },
        ],
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        lastActive: true,
      },
      take: 20,
    });

    // Add relationship status to each user
    const usersWithStatus = users.map((user) => ({
      ...user,
      relationshipStatus: relationshipMap.get(user.id) || 'NONE',
    }));

    return res.json({ users: usersWithStatus });
  } catch (error) {
    console.error('Error searching friends:', error);
    return res.status(500).json({ error: 'Failed to search friends' });
  }
}
