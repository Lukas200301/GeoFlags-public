import prisma from '../utils/prisma';

/**
 * Uptime Tracking Service
 *
 * Runs a continuous background interval that pings the database every hour.
 * It measures the accurate response time in milliseconds for precise metrics.
 */
export function startUptimeTracker() {
  const ONE_HOUR_MS = 60 * 60 * 1000;

  const performPing = async () => {
    const start = performance.now();
    let isUp = true;
    let errorMsg = null;

    try {
      // 1. Probe database
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      isUp = false;
      errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Uptime Service] Failed to record heartbeat ping:', error);
    }

    const end = performance.now();
    const responseTimeMs = Math.round(end - start);

    try {
      // 2. Insert absolute hourly ping record
      await prisma.uptimePing.create({
        data: {
          responseTime: responseTimeMs,
          isUp,
          error: errorMsg,
        },
      });
    } catch (insertError) {
      console.error('[Uptime Service] Failed to save ping record to database:', insertError);
    }
  };

  // Run the very first ping immediately 5 seconds after boot to give Prisma connection time
  setTimeout(() => {
    performPing();
  }, 5000);

  // Calculate milliseconds until the very next top of the hour
  const now = new Date();
  const msUntilNextHour =
    ONE_HOUR_MS - (now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds());

  // Wait until the top of the hour, then start the true hourly interval
  setTimeout(() => {
    performPing();
    setInterval(() => {
      performPing();
    }, ONE_HOUR_MS);
  }, msUntilNextHour);

  // Log successful startup
  console.log('[Uptime Service] Background tracker started. Next ping aligned to top of the hour.');
}
