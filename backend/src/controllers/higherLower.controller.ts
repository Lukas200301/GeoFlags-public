import { Response } from 'express';
import { AuthRequest } from '../types';
import countriesData from 'world-countries';
import type { Country as WorldCountry } from 'world-countries';

/**
 * Higher/Lower Game Controller
 * 
 * Game Logic: Players compare two countries and guess if the second country
 * is larger or smaller in area than the first. Streak continues until wrong answer.
 *
 * SECURITY:
 * - No country area exposed to client until answer submission
 * - Server-side answer validation
 * - Session-based game state
 * - Rate limiting applied at route level
 */

// In-memory session storage (for production, use Redis)
interface HigherLowerSession {
  userId: string;
  currentCountry: string; // Country code of the current country
  score: number;
  startedAt: number;
  usedCountries: Set<string>; // Track which countries have been shown
}

const sessions = new Map<string, HigherLowerSession>();

// Helper to generate a unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Helper to get country by code
function getCountryByCode(code: string): WorldCountry | undefined {
  return countriesData.find((c) => c.cca2.toLowerCase() === code.toLowerCase());
}

// Helper to get a random country (excluding used ones)
function getRandomCountry(exclude: Set<string>): WorldCountry | null {
  const availableCountries = countriesData.filter(
    (c) => !exclude.has(c.cca2)
  );

  if (availableCountries.length === 0) {
    return null; // All countries used
  }

  const randomIndex = Math.floor(Math.random() * availableCountries.length);
  return availableCountries[randomIndex];
}

// Helper to get flag URL
function getFlagUrl(code: string): string {
  const apiBase = process.env.API_BASE || `http://localhost:${process.env.PORT || 3001}`;
  return `${apiBase}/api/flags/${code.toLowerCase()}`;
}

// Helper to format area for display
function formatArea(area: number): string {
  return area.toLocaleString('en-US') + ' km²';
}

/**
 * Start a new game
 * POST /api/game/higher-lower/start
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

    // Get two random countries to start
    const firstCountry = getRandomCountry(new Set());
    if (!firstCountry) {
      return res.status(500).json({ message: 'Failed to initialize game' });
    }

    const usedCountries = new Set([firstCountry.cca2]);
    const secondCountry = getRandomCountry(usedCountries);
    if (!secondCountry) {
      return res.status(500).json({ message: 'Failed to initialize game' });
    }

    // Create session
    const sessionId = generateSessionId();
    const session: HigherLowerSession = {
      userId: req.user?.id || 'guest',
      currentCountry: secondCountry.cca2,
      score: 0,
      startedAt: Date.now(),
      usedCountries: new Set([firstCountry.cca2, secondCountry.cca2]),
    };

    sessions.set(sessionId, session);

    return res.json({
      sessionId,
      score: 0,
      firstCountry: {
        code: firstCountry.cca2,
        name: firstCountry.name.common,
        flagImage: getFlagUrl(firstCountry.cca2),
        area: firstCountry.area,
        areaFormatted: formatArea(firstCountry.area),
      },
      secondCountry: {
        code: secondCountry.cca2,
        name: secondCountry.name.common,
        flagImage: getFlagUrl(secondCountry.cca2),
        // Don't send area - player must guess
      },
    });
  } catch (error) {
    console.error('Start Higher/Lower game error:', error);
    return res.status(500).json({ message: 'Failed to start game' });
  }
}

/**
 * Submit an answer
 * POST /api/game/higher-lower/answer
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

    const { sessionId, guess, previousCountryCode } = req.body;

    if (!sessionId || !guess || !previousCountryCode) {
      return res.status(400).json({ message: 'Session ID, guess, and previous country code are required' });
    }

    if (!['higher', 'lower'].includes(guess)) {
      return res.status(400).json({ message: 'Guess must be "higher" or "lower"' });
    }

    // Get session
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found or expired' });
    }

    // Verify user owns this session
    const currentUserId = req.user?.id || 'guest';
    if (session.userId !== currentUserId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get both countries
    const previousCountry = getCountryByCode(previousCountryCode);
    const currentCountry = getCountryByCode(session.currentCountry);

    if (!previousCountry || !currentCountry) {
      return res.status(500).json({ message: 'Invalid country data' });
    }

    // Determine if guess is correct
    const isHigher = currentCountry.area > previousCountry.area;
    const isLower = currentCountry.area < previousCountry.area;
    const isEqual = currentCountry.area === previousCountry.area;

    let isCorrect = false;
    if (guess === 'higher' && (isHigher || isEqual)) {
      isCorrect = true;
    } else if (guess === 'lower' && (isLower || isEqual)) {
      isCorrect = true;
    }

    if (!isCorrect) {
      // Game over - wrong answer
      const finalScore = session.score;
      sessions.delete(sessionId);

      return res.json({
        correct: false,
        gameOver: true,
        finalScore,
        currentCountry: {
          code: currentCountry.cca2,
          name: currentCountry.name.common,
          area: currentCountry.area,
          areaFormatted: formatArea(currentCountry.area),
        },
        previousCountry: {
          code: previousCountry.cca2,
          name: previousCountry.name.common,
          area: previousCountry.area,
          areaFormatted: formatArea(previousCountry.area),
        },
      });
    }

    // Correct answer - increment score and get next country
    session.score += 1;

    // Get next country
    const nextCountry = getRandomCountry(session.usedCountries);

    if (!nextCountry) {
      // Player has used all countries!
      const finalScore = session.score;
      sessions.delete(sessionId);

      return res.json({
        correct: true,
        gameOver: true,
        perfectGame: true,
        finalScore,
        currentCountry: {
          code: currentCountry.cca2,
          name: currentCountry.name.common,
          area: currentCountry.area,
          areaFormatted: formatArea(currentCountry.area),
        },
        message: 'Congratulations! You compared all countries!',
      });
    }

    // Update session with next country
    session.currentCountry = nextCountry.cca2;
    session.usedCountries.add(nextCountry.cca2);

    return res.json({
      correct: true,
      gameOver: false,
      score: session.score,
      currentCountry: {
        code: currentCountry.cca2,
        name: currentCountry.name.common,
        area: currentCountry.area,
        areaFormatted: formatArea(currentCountry.area),
        flagImage: getFlagUrl(currentCountry.cca2),
      },
      nextCountry: {
        code: nextCountry.cca2,
        name: nextCountry.name.common,
        flagImage: getFlagUrl(nextCountry.cca2),
        // Don't send area - player must guess
      },
    });
  } catch (error) {
    console.error('Submit Higher/Lower answer error:', error);
    return res.status(500).json({ message: 'Failed to process answer' });
  }
}

/**
 * Clean up expired sessions (called periodically)
 */
export function cleanupSessions() {
  const now = Date.now();
  const maxAge = 1000 * 60 * 30; // 30 minutes

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.startedAt > maxAge) {
      sessions.delete(sessionId);
    }
  }
}

// Clean up sessions every 10 minutes
setInterval(cleanupSessions, 1000 * 60 * 10);
