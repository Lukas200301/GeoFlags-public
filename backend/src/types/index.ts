import { Request } from 'express';
import { UserRole, UserStatus } from '@prisma/client';

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    status: UserStatus;
    banReason?: string | null;
    bannedUntil?: Date | null;
    tokenVersion: number;
  };
}

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  tokenVersion: number;
}

/**
 * Token pair returned after authentication
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Game submission data
 */
export interface GameSubmission {
  mode: string;
  score: number;
  data?: Record<string, unknown>;
}

/**
 * Admin audit log entry
 */
export interface AuditLogEntry {
  adminId: string;
  action: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}
