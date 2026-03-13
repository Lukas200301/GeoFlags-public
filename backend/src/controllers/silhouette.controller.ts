import { Response } from 'express';
import { AuthRequest } from '../types';
import countriesData from 'world-countries';
import type { Country as WorldCountry } from 'world-countries';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * Country Silhouette Game Controller
 *
 * Players guess countries from their GeoJSON outline shape.
 * Same infinite mode pattern as Guess the Flag.
 */

// In-memory session storage
interface SilhouetteSession {
  userId: string;
  shuffledCountries: string[]; // Array of cca2 codes
  currentIndex: number;
  score: number;
  startedAt: number;
}

const gameSessions = new Map<string, SilhouetteSession>();

function generateSessionId(): string {
  return `sil-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

function getRandomCountries(excludeCode: string, count: number): WorldCountry[] {
  const available = countriesData.filter((c) => c.cca2.toLowerCase() !== excludeCode.toLowerCase());
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Load the high-resolution combined GeoJSON once at startup
 */
let combinedGeoJSON: any = null;

function loadCombinedGeoJSON(): void {
  try {
    const geoPath = path.join(__dirname, '../ne_countries.geo.json');
    const raw = readFileSync(geoPath, 'utf8');
    combinedGeoJSON = JSON.parse(raw);
    console.log(`Loaded combined GeoJSON with ${combinedGeoJSON.features?.length || 0} features`);
  } catch (err) {
    console.error('Failed to load combined GeoJSON:', err);
  }
}

// Load on module init
loadCombinedGeoJSON();

/**
 * Get country outline from the high-res combined GeoJSON, stripped of identifying properties
 */
function getCountryOutline(cca2: string): object | null {
  if (!combinedGeoJSON?.features) return null;

  const feature = combinedGeoJSON.features.find(
    (f: any) => f.properties?.ISO_A2?.toLowerCase() === cca2.toLowerCase()
  );

  if (!feature) return null;

  // Return stripped feature (no properties to prevent cheating)
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: feature.geometry,
        properties: {},
      },
    ],
  };
}

/**
 * Start a new silhouette game
 * POST /api/game/silhouette/start
 */
export async function startGame(req: AuthRequest, res: Response) {
  try {
    if (req.user) {
      if (req.user.status === 'BANNED') {
        return res.status(403).json({
          message: req.user.banReason || 'Your account has been banned',
          banned: true,
          bannedUntil: req.user.bannedUntil,
        });
      }
      if (req.user.status === 'SUSPENDED') {
        return res.status(403).json({
          message: req.user.banReason || 'Your account has been suspended',
          suspended: true,
          bannedUntil: req.user.bannedUntil,
        });
      }
    }

    // Only use countries that exist in the high-res GeoJSON
    const availableCodes = new Set<string>();
    if (combinedGeoJSON?.features) {
      for (const f of combinedGeoJSON.features) {
        if (f.properties?.ISO_A2 && f.properties.ISO_A2 !== '-99') {
          availableCodes.add(f.properties.ISO_A2);
        }
      }
    }

    const allCodes = countriesData.map((c) => c.cca2).filter((code) => availableCodes.has(code));
    const shuffled = shuffleArray(allCodes);

    const sessionId = generateSessionId();
    const session: SilhouetteSession = {
      userId: req.user?.id || 'guest',
      shuffledCountries: shuffled,
      currentIndex: 0,
      score: 0,
      startedAt: Date.now(),
    };

    gameSessions.set(sessionId, session);

    const firstCode = shuffled[0];
    const firstCountry = countriesData.find((c) => c.cca2 === firstCode);
    if (!firstCountry) {
      return res.status(500).json({ message: 'Failed to initialize game' });
    }

    const outline = getCountryOutline(firstCode);
    if (!outline) {
      return res.status(500).json({ message: 'Failed to load country outline' });
    }

    const wrongCountries = getRandomCountries(firstCode, 3);
    const allOptions = [firstCountry, ...wrongCountries];
    const shuffledOptions = shuffleArray(allOptions);

    return res.json({
      sessionId,
      outline,
      options: shuffledOptions.map((c) => ({
        id: c.cca2,
        name: c.name.common,
      })),
      score: 0,
      totalCountries: shuffled.length,
    });
  } catch (error) {
    console.error('Silhouette start error:', error);
    return res.status(500).json({ message: 'Failed to start game' });
  }
}

/**
 * Submit an answer
 * POST /api/game/silhouette/answer
 */
export async function submitAnswer(req: AuthRequest, res: Response) {
  try {
    if (req.user) {
      if (req.user.status === 'BANNED') {
        return res.status(403).json({
          message: req.user.banReason || 'Your account has been banned',
          banned: true,
        });
      }
      if (req.user.status === 'SUSPENDED') {
        return res.status(403).json({
          message: req.user.banReason || 'Your account has been suspended',
          suspended: true,
        });
      }
    }

    const { sessionId, answer } = req.body;
    if (!sessionId || !answer) {
      return res.status(400).json({ message: 'Session ID and answer are required' });
    }

    const session = gameSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found or expired' });
    }

    const currentUserId = req.user?.id || 'guest';
    if (session.userId !== currentUserId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const currentCode = session.shuffledCountries[session.currentIndex];
    const isCorrect = answer === currentCode;

    if (!isCorrect) {
      const finalScore = session.score;
      gameSessions.delete(sessionId);

      return res.json({
        correct: false,
        gameOver: true,
        finalScore,
        correctAnswer: currentCode,
        correctAnswerName: countriesData.find((c) => c.cca2 === currentCode)?.name.common,
      });
    }

    session.score += 1;
    session.currentIndex += 1;

    if (session.currentIndex >= session.shuffledCountries.length) {
      const finalScore = session.score;
      gameSessions.delete(sessionId);

      return res.json({
        correct: true,
        gameOver: true,
        perfectGame: true,
        finalScore,
        message: 'Perfect! You identified every country outline!',
      });
    }

    const nextCode = session.shuffledCountries[session.currentIndex];
    const nextCountry = countriesData.find((c) => c.cca2 === nextCode);
    if (!nextCountry) {
      return res.status(500).json({ message: 'Failed to load next outline' });
    }

    const outline = getCountryOutline(nextCode);
    if (!outline) {
      return res.status(500).json({ message: 'Failed to load country outline' });
    }

    const wrongCountries = getRandomCountries(nextCode, 3);
    const allOptions = [nextCountry, ...wrongCountries];
    const shuffledOptions = shuffleArray(allOptions);

    return res.json({
      correct: true,
      gameOver: false,
      score: session.score,
      nextOutline: {
        outline,
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
    console.error('Silhouette answer error:', error);
    return res.status(500).json({ message: 'Failed to process answer' });
  }
}

// Clean up expired sessions
export function cleanupSessions() {
  const now = Date.now();
  const maxAge = 1000 * 60 * 30;
  for (const [sessionId, session] of gameSessions.entries()) {
    if (now - session.startedAt > maxAge) {
      gameSessions.delete(sessionId);
    }
  }
}

setInterval(cleanupSessions, 1000 * 60 * 10);
