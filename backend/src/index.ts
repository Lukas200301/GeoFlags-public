// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Validate critical environment variables
const requiredEnvVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file in the backend directory');
  process.exit(1);
}

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import path from 'path';
import { setupSocketIO } from './socket';
import { errorHandler } from './middleware/security';
import prisma from './utils/prisma';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import gameRoutes from './routes/game.routes';
import flagRoutes from './routes/flag.routes';
import countryRoutes from './routes/country.routes';
import profileRoutes from './routes/profile.routes';
import userRoutes from './routes/user.routes';
import friendsRoutes from './routes/friends.routes';
import battleRoutes from './routes/battle.routes';

/**
 * Main Express Application
 *
 * SECURITY:
 * - Helmet for security headers
 * - CORS with credentials
 * - CSRF protection on mutating requests
 * - Cookie parser for HttpOnly cookies
 * - Rate limiting on routes
 * - Error handling middleware
 */

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Trust Proxy
 * Required when behind Cloudflare, nginx, or other reverse proxies
 * This allows Express to trust X-Forwarded-* headers
 */
app.set('trust proxy', 1);

/**
 * Security Middleware
 */

// Helmet for security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", FRONTEND_URL],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resource loading
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// CORS configuration
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-ReAuth-Token'],
  })
);

/**
 * Body Parser & Cookie Parser
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/**
 * Static Files
 */
app.use('/avatars', express.static(path.join(__dirname, '../cache/avatars')));

/**
 * CSRF Protection
 * Only applies to mutating requests (POST, PUT, DELETE)
 */
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// CSRF token endpoint (public)
app.get('/api/csrf-token', csrfProtection, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection to all mutating API requests
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests and specific endpoints
  if (req.method === 'GET' || req.originalUrl.includes('/csrf-token')) {
    return next();
  }
  return csrfProtection(req, res, next);
});
/**
 * Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/battles', battleRoutes);

/**
 * Public Stats Endpoint
 */
app.get('/api/stats', async (_req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalGames = await prisma.gameSession.count();
    const gameModes = await prisma.gameMode.count({
      where: { enabled: true }
    });
    
    res.json({
      totalUsers,
      totalGames,
      gameModes,
      totalCountries: 250,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

/**
 * Health Check
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * 404 Handler
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

/**
 * Error Handler
 */
app.use(errorHandler);

/**
 * Setup Socket.io
 */
const io = setupSocketIO(httpServer);

// Make io available to routes if needed
app.set('io', io);

/**
 * Start Server
 */
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║        GeoFlags Backend Server         ║
╚════════════════════════════════════════╝

Server running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Frontend URL: ${FRONTEND_URL}
console.log('Backend using FRONTEND_URL:', FRONTEND_URL);

API Endpoints:
  - POST   /api/auth/register
  - POST   /api/auth/login
  - POST   /api/auth/refresh
  - POST   /api/auth/logout
  - GET    /api/auth/me
  - POST   /api/auth/re-auth

  - GET    /api/game/modes
  - GET    /api/game/leaderboard
  - POST   /api/game/submit
  - GET    /api/game/history
  - GET    /api/game/stats

  - GET    /api/admin/users
  - GET    /api/admin/users/:id
  - PUT    /api/admin/users/:id/role
  - DELETE /api/admin/users/:id
  - GET    /api/admin/game-modes
  - PUT    /api/admin/game-modes/:id
  - GET    /api/admin/leaderboard
  - DELETE /api/admin/leaderboard/:id
  - GET    /api/admin/stats
  - GET    /api/admin/audit-logs

  - GET    /api/flags/:code
  - GET    /api/flags/cache/stats (admin)
  - DELETE /api/flags/cache (admin)

  - GET    /api/countries/:code
  - GET    /api/countries/cache/stats (admin)
  - DELETE /api/countries/cache (admin)

Socket.io: Connected
  - Path: /socket.io/
  - Auth: JWT required

Press Ctrl+C to stop
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Closing server gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, io };
