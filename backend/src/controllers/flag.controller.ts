import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import countriesData from 'world-countries';

/**
 * Flag Controller
 * Handles serving high-quality SVG flags from world-countries
 */

const FLAGS_DIR = path.join(__dirname, '../../node_modules/world-countries/data');

/**
 * Get flag (served from world-countries SVGs)
 * @route GET /api/flags/:code
 */
export async function getFlag(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;

    // Validate country code (2-letter code)
    if (!code || code.length !== 2 || !/^[a-zA-Z]{2}$/.test(code)) {
      res.status(400).json({ message: 'Invalid country code' });
      return;
    }

    const cca2 = code.toUpperCase();
    
    // Find the country to get its cca3 code
    const country = countriesData.find((c: any) => c.cca2 === cca2);
    
    if (!country) {
      res.status(404).json({ message: 'Country not found' });
      return;
    }

    const cca3 = country.cca3.toLowerCase();
    const flagPath = path.join(FLAGS_DIR, `${cca3}.svg`);

    // Ensure the file exists before sending
    try {
      await fs.access(flagPath);
    } catch {
      res.status(404).json({ message: 'Flag SVG not found' });
      return;
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day browser cache
    res.sendFile(flagPath);
  } catch (error) {
    console.error('Error in getFlag:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Clear flag cache
 * @route DELETE /api/flags/cache
 * @access Admin only
 */
export async function clearCache(_req: Request, res: Response): Promise<void> {
  res.json({
    message: 'Cache cleared successfully',
    deletedFlags: 0,
  });
}

/**
 * Get cache statistics
 * @route GET /api/flags/cache/stats
 * @access Admin only
 */
export async function getCacheStats(_req: Request, res: Response): Promise<void> {
  res.json({
    totalFlags: 0,
    totalSizeBytes: 0,
    totalSizeMB: "0.00",
    cacheDurationDays: 0,
    flags: [],
  });
}
