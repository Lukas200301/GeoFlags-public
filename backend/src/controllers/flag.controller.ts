import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import https from 'https';

/**
 * Flag Controller
 * Handles flag caching and serving with FlagCDN integration
 *
 * FEATURES:
 * - Fetches high-resolution flags from FlagCDN on first request
 * - Caches flags locally for faster subsequent access
 * - Automatic cache expiration (configurable)
 * - Serves cached flags without exposing CDN URL to frontend
 * - Offline-friendly after initial cache
 */

const CACHE_DIR = path.join(__dirname, '../../cache/flags');
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const FLAGCDN_BASE_URL = 'https://flagcdn.com/w320';

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

/**
 * Check if cached flag exists and is not expired
 */
async function isCacheValid(countryCode: string): Promise<boolean> {
  try {
    const flagPath = path.join(CACHE_DIR, `${countryCode.toLowerCase()}.png`);
    const stats = await fs.stat(flagPath);
    const age = Date.now() - stats.mtimeMs;
    return age < CACHE_DURATION;
  } catch {
    return false;
  }
}

/**
 * Download flag from FlagCDN
 */
async function downloadFlag(countryCode: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = `${FLAGCDN_BASE_URL}/${countryCode.toLowerCase()}.png`;
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download flag: ${response.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Cache flag locally
 */
async function cacheFlag(countryCode: string, data: Buffer): Promise<void> {
  await ensureCacheDir();
  const flagPath = path.join(CACHE_DIR, `${countryCode.toLowerCase()}.png`);
  await fs.writeFile(flagPath, data);
}

/**
 * Get flag (from cache or FlagCDN)
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

    const countryCode = code.toLowerCase();
    const flagPath = path.join(CACHE_DIR, `${countryCode}.png`);

    // Check if flag is cached and valid
    const cacheValid = await isCacheValid(countryCode);

    if (cacheValid) {
      // Serve from cache
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day browser cache
      res.setHeader('X-Cache-Status', 'HIT');
      res.sendFile(flagPath);
      return;
    }

    // Download from FlagCDN and cache
    try {
      const flagData = await downloadFlag(countryCode);
      await cacheFlag(countryCode, flagData);

      // Serve the newly cached flag
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Cache-Status', 'MISS');
      res.send(flagData);
    } catch (downloadError) {
      console.error(`Failed to download flag for ${countryCode}:`, downloadError);
      res.status(404).json({ message: 'Flag not found' });
    }
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
export async function clearCache(req: Request, res: Response): Promise<void> {
  try {
    await ensureCacheDir();
    const files = await fs.readdir(CACHE_DIR);

    let deletedCount = 0;
    for (const file of files) {
      if (file.endsWith('.png')) {
        await fs.unlink(path.join(CACHE_DIR, file));
        deletedCount++;
      }
    }

    res.json({
      message: 'Cache cleared successfully',
      deletedFlags: deletedCount,
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ message: 'Failed to clear cache' });
  }
}

/**
 * Get cache statistics
 * @route GET /api/flags/cache/stats
 * @access Admin only
 */
export async function getCacheStats(req: Request, res: Response): Promise<void> {
  try {
    await ensureCacheDir();
    const files = await fs.readdir(CACHE_DIR);
    const flagFiles = files.filter(f => f.endsWith('.png'));

    let totalSize = 0;
    const flagStats = [];

    for (const file of flagFiles) {
      const filePath = path.join(CACHE_DIR, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
      const age = Date.now() - stats.mtimeMs;
      const isExpired = age > CACHE_DURATION;

      flagStats.push({
        code: file.replace('.png', '').toUpperCase(),
        size: stats.size,
        cachedAt: new Date(stats.mtimeMs).toISOString(),
        ageInDays: Math.floor(age / (24 * 60 * 60 * 1000)),
        expired: isExpired,
      });
    }

    res.json({
      totalFlags: flagFiles.length,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      cacheDurationDays: CACHE_DURATION / (24 * 60 * 60 * 1000),
      flags: flagStats.sort((a, b) => a.code.localeCompare(b.code)),
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ message: 'Failed to get cache stats' });
  }
}
