import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const router = Router();
const GEOJSON_PATH = path.join(__dirname, '../ne_countries.geo.json');

/**
 * @route GET /api/map
 * @desc Serve the combined world-countries GeoJSON FeatureCollection
 * @access Public
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await fs.readFile(GEOJSON_PATH, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(data);
  } catch (error) {
    console.error('Error serving GeoJSON map:', error);
    res.status(500).json({ message: 'Internal server error while loading map data.' });
  }
});

export default router;
