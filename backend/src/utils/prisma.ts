import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client instance
 *
 * SECURITY:
 * - Single instance pattern prevents connection pool exhaustion
 * - All queries use parameterized statements (Prisma default)
 * - No raw SQL queries used in codebase
 */
const prisma = new PrismaClient({
  log: ['error'],
});

export default prisma;
