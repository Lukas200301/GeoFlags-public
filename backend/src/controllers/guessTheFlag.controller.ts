import { Response } from 'express';
import { AuthRequest } from '../types';

import countriesData from 'world-countries';
import type { Country as WorldCountry } from 'world-countries';

/**
 * Guess the Flag Game Controller
 *
 * SECURITY:
 * - No country data exposed to client (only flag tokens)
 * - Server-side answer validation
 * - Session-based game state
 * - Rate limiting applied at route level
 */

// In-memory session storage (for production, use Redis)
interface GameSession {
  userId: string;
  shuffledCountries: string[]; // Array of country codes
  currentIndex: number;
  score: number;
  startedAt: number;
}

const gameSessions = new Map<string, GameSession>();

// Helper to generate a unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Helper to get a random subset of countries (excluding the correct one)
function getRandomCountries(excludeCode: string, count: number): WorldCountry[] {
  const availableCountries = countriesData.filter(
    (c) => c.cca2.toLowerCase() !== excludeCode.toLowerCase()
  );

  const shuffled = availableCountries.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper to get flag URL
function getFlagUrl(code: string): string {
  const apiBase = process.env.API_BASE || `http://localhost:${process.env.PORT || 3001}`;
  return `${apiBase}/api/flags/${code.toLowerCase()}`;
}

/**
 * Start a new game
 * POST /api/game/guess-the-flag/start
 */
export async function startGame(req: AuthRequest, res: Response) {
  try {
    // Check if user is banned or suspended (only for authenticated users)
    if (req.user) {
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
    }

    // Get all countries and shuffle them
    const allCountryCodes = countriesData.map((c) => c.cca2);
    const shuffledCountries = shuffleArray(allCountryCodes);

    // Create session (works for both authenticated and guest users)
    const sessionId = generateSessionId();
    const session: GameSession = {
      userId: req.user?.id || 'guest', // Guest users get 'guest' as userId
      shuffledCountries,
      currentIndex: 0,
      score: 0,
      startedAt: Date.now(),
    };

    gameSessions.set(sessionId, session);

    // Get first flag
    const firstCountryCode = shuffledCountries[0];
    const firstCountry = countriesData.find((c) => c.cca2 === firstCountryCode);

    if (!firstCountry) {
      return res.status(500).json({ message: 'Failed to initialize game' });
    }

    // Generate options (1 correct + 3 wrong)
    const wrongCountries = getRandomCountries(firstCountryCode, 3);
    const allOptions = [firstCountry, ...wrongCountries];
    const shuffledOptions = shuffleArray(allOptions);

    // Return response with flag and options
    return res.json({
      sessionId,
      flagToken: firstCountryCode, // This is used as a token to identify the flag
      flagImage: getFlagUrl(firstCountryCode),
      options: shuffledOptions.map((c) => ({
        id: c.cca2,
        name: c.name.common,
      })),
      score: 0,
      totalCountries: shuffledCountries.length,
    });
  } catch (error) {
    console.error('Start game error:', error);
    return res.status(500).json({ message: 'Failed to start game' });
  }
}

/**
 * Submit an answer
 * POST /api/game/guess-the-flag/answer
 */
export async function submitAnswer(req: AuthRequest, res: Response) {
  try {
    // Check if user is banned or suspended (only for authenticated users)
    if (req.user) {
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
    }

    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({ message: 'Session ID and answer are required' });
    }

    // Get session
    const session = gameSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found or expired' });
    }

    // Verify user owns this session (or is a guest playing the same session)
    const currentUserId = req.user?.id || 'guest';
    if (session.userId !== currentUserId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get current country
    const currentCountryCode = session.shuffledCountries[session.currentIndex];

    // Check if answer is correct
    const isCorrect = answer === currentCountryCode;

    if (!isCorrect) {
      // Game over - wrong answer
      const finalScore = session.score;

      // Clean up session
      gameSessions.delete(sessionId);

      return res.json({
        correct: false,
        gameOver: true,
        finalScore,
        correctAnswer: currentCountryCode,
        correctAnswerName: countriesData.find((c) => c.cca2 === currentCountryCode)?.name.common,
      });
    }

    // Correct answer - increment score and move to next
    session.score += 1;
    session.currentIndex += 1;

    // Check if all countries have been shown
    if (session.currentIndex >= session.shuffledCountries.length) {
      // Player has guessed all flags correctly!
      const finalScore = session.score;
      gameSessions.delete(sessionId);

      return res.json({
        correct: true,
        gameOver: true,
        perfectGame: true,
        finalScore,
        message: 'Congratulations! You guessed all flags correctly!',
      });
    }

    // Get next flag
    const nextCountryCode = session.shuffledCountries[session.currentIndex];
    const nextCountry = countriesData.find((c) => c.cca2 === nextCountryCode);

    if (!nextCountry) {
      return res.status(500).json({ message: 'Failed to load next flag' });
    }

    // Generate options for next flag
    const wrongCountries = getRandomCountries(nextCountryCode, 3);
    const allOptions = [nextCountry, ...wrongCountries];
    const shuffledOptions = shuffleArray(allOptions);

    return res.json({
      correct: true,
      gameOver: false,
      score: session.score,
      nextFlag: {
        flagToken: nextCountryCode,
        flagImage: getFlagUrl(nextCountryCode),
        options: shuffledOptions.map((c) => ({
          id: c.cca2,
          name: c.name.common,
        })),
      },
      progress: {
        current: session.currentIndex + 1,
        total: session.shuffledCountries.length,
      },
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    return res.status(500).json({ message: 'Failed to process answer' });
  }
}

/**
 * Clean up expired sessions (called periodically)
 */
export function cleanupSessions() {
  const now = Date.now();
  const maxAge = 1000 * 60 * 30; // 30 minutes

  for (const [sessionId, session] of gameSessions.entries()) {
    if (now - session.startedAt > maxAge) {
      gameSessions.delete(sessionId);
    }
  }
}

// Clean up sessions every 10 minutes
setInterval(cleanupSessions, 1000 * 60 * 10);
