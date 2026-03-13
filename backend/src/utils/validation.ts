import { z } from 'zod';

/**
 * Validation schemas using Zod
 *
 * SECURITY:
 * - Input validation prevents injection attacks
 * - Type-safe validation ensures data integrity
 * - Clear error messages don't leak sensitive info
 */

// Auth validation
export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  captchaToken: z.string().min(1, 'Captcha verification is required'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string(),
});

export const reAuthSchema = z.object({
  password: z.string(),
});

// Game validation
export const gameSubmissionSchema = z.object({
  mode: z.enum([
    'FLAGS',
    'CAPITALS',
    'MAPS',
    'MIXED',
    'GUESS_FLAG',
    'TIME_TRIAL',
    'FIND_CAPITAL',
    'HIGHER_LOWER',
    'SILHOUETTE',
  ]),
  score: z.number().int().min(0).max(100000),
  data: z.record(z.unknown()).optional(),
});

// Admin validation
export const roleUpdateSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export const gameModeCreateSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(500),
  active: z.boolean().optional().default(true),
});

export const gameModeUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(500).optional(),
  active: z.boolean().optional(),
});

export const leaderboardUpdateSchema = z.object({
  score: z.number().int().min(0).max(100000),
});
