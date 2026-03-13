import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import https from 'https';

/**
 * REST Countries Controller
 * Handles REST Countries API data caching and serving
 *
 * FEATURES:
 * - Fetches country data from REST Countries API on first request
 * - Caches data locally for faster subsequent access
 * - Automatic cache expiration (configurable)
 * - Reduces load on REST Countries API
 * - Offline-friendly after initial cache
 *
 * DATA FIELDS CACHED:
 * - Population
 * - Timezones
 * - Car driving side
 * - Coat of arms image URL
 */

const CACHE_DIR = path.join(__dirname, '../../cache/countries');
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const REST_COUNTRIES_BASE_URL = 'https://restcountries.com/v3.1/alpha';

/**
 * Interface for REST Countries API response
 */
interface RestCountryData {
  population?: number;
  timezones?: string[];
  car?: {
    side?: string;
  };
  coatOfArms?: {
    png?: string;
    svg?: string;
  };
}

/**
 * Interface for cached country data
 */
export interface CachedCountryData {
  population: number | null;
  timezones: string[];
  carSide: string | null;
  coatOfArms: string | null;
  cachedAt: string;
}

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
 * Check if cached country data exists and is not expired
 */
async function isCacheValid(countryCode: string): Promise<boolean> {
  try {
    const cachePath = path.join(CACHE_DIR, `${countryCode.toLowerCase()}.json`);
    const stats = await fs.stat(cachePath);
    const age = Date.now() - stats.mtimeMs;
    return age < CACHE_DURATION;
  } catch {
    return false;
  }
}

/**
 * Fetch country data from REST Countries API
 */
async function fetchCountryData(countryCode: string): Promise<RestCountryData> {
  return new Promise((resolve, reject) => {
    const url = `${REST_COUNTRIES_BASE_URL}/${countryCode.toLowerCase()}`;

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch country data: ${response.statusCode}`));
          return;
        }

        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            // REST Countries API returns an array with one country
            resolve(Array.isArray(jsonData) ? jsonData[0] : jsonData);
          } catch (parseError) {
            reject(new Error('Failed to parse REST Countries API response'));
          }
        });
        response.on('error', reject);
      })
      .on('error', reject);
  });
}

/**
 * Transform REST Countries API data to our cached format
 */
function transformCountryData(data: RestCountryData): CachedCountryData {
  return {
    population: data.population || null,
    timezones: data.timezones || [],
    carSide: data.car?.side || null,
    coatOfArms: data.coatOfArms?.png || data.coatOfArms?.svg || null,
    cachedAt: new Date().toISOString(),
  };
}

/**
 * Cache country data locally
 */
async function cacheCountryData(countryCode: string, data: CachedCountryData): Promise<void> {
  await ensureCacheDir();
  const cachePath = path.join(CACHE_DIR, `${countryCode.toLowerCase()}.json`);
  await fs.writeFile(cachePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Get country data (from cache or REST Countries API)
 * @route GET /api/countries/:code
 */
export async function getCountryData(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;

    // Validate country code (2-letter code)
    if (!code || code.length !== 2 || !/^[a-zA-Z]{2}$/.test(code)) {
      res.status(400).json({ message: 'Invalid country code' });
      return;
    }

    const countryCode = code.toLowerCase();
    const cachePath = path.join(CACHE_DIR, `${countryCode}.json`);

    // Check if data is cached and valid
    const cacheValid = await isCacheValid(countryCode);

    if (cacheValid) {
      // Serve from cache
      const cachedData = await fs.readFile(cachePath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day browser cache
      res.setHeader('X-Cache-Status', 'HIT');
      res.send(cachedData);
      return;
    }

    // Fetch from REST Countries API and cache
    try {
      const apiData = await fetchCountryData(countryCode);
      const transformedData = transformCountryData(apiData);
      await cacheCountryData(countryCode, transformedData);

      // Serve the newly cached data
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Cache-Status', 'MISS');
      res.json(transformedData);
    } catch (fetchError) {
      console.error(`Failed to fetch country data for ${countryCode}:`, fetchError);
      res.status(404).json({ message: 'Country data not found' });
    }
  } catch (error) {
    console.error('Error in getCountryData:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Clear country data cache
 * @route DELETE /api/countries/cache
 * @access Admin only
 */
export async function clearCache(_req: Request, res: Response): Promise<void> {
  try {
    await ensureCacheDir();
    const files = await fs.readdir(CACHE_DIR);

    let deletedCount = 0;
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.unlink(path.join(CACHE_DIR, file));
        deletedCount++;
      }
    }

    res.json({
      message: 'Cache cleared successfully',
      deletedCountries: deletedCount,
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ message: 'Failed to clear cache' });
  }
}

/**
 * Get cache statistics
 * @route GET /api/countries/cache/stats
 * @access Admin only
 */
export async function getCacheStats(_req: Request, res: Response): Promise<void> {
  try {
    await ensureCacheDir();
    const files = await fs.readdir(CACHE_DIR);
    const countryFiles = files.filter((f) => f.endsWith('.json'));

    let totalSize = 0;
    const countryStats = [];

    for (const file of countryFiles) {
      const filePath = path.join(CACHE_DIR, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
      const age = Date.now() - stats.mtimeMs;
      const isExpired = age > CACHE_DURATION;

      countryStats.push({
        code: file.replace('.json', '').toUpperCase(),
        size: stats.size,
        cachedAt: new Date(stats.mtimeMs).toISOString(),
        ageInDays: Math.floor(age / (24 * 60 * 60 * 1000)),
        expired: isExpired,
      });
    }

    res.json({
      totalCountries: countryFiles.length,
      totalSizeBytes: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      cacheDurationDays: CACHE_DURATION / (24 * 60 * 60 * 1000),
      countries: countryStats.sort((a, b) => a.code.localeCompare(b.code)),
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ message: 'Failed to get cache stats' });
  }
}
