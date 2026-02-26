import prisma from './prisma';

/**
 * System Settings Utility
 *
 * Provides cached access to system settings to avoid database queries on every request
 */

let settingsCache: {
  requireRegistration: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  lastFetch: number;
} | null = null;

const CACHE_TTL = 60000; // 1 minute cache

/**
 * Get system settings with caching
 */
export async function getSystemSettings() {
  const now = Date.now();

  // Return cached value if still valid
  if (settingsCache && now - settingsCache.lastFetch < CACHE_TTL) {
    return settingsCache;
  }

  // Fetch from database
  let settings = await prisma.systemSettings.findFirst();

  // Create default settings if none exist
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {
        requireRegistration: false,
        maintenanceMode: false,
      },
    });
  }

  // Update cache
  settingsCache = {
    requireRegistration: settings.requireRegistration,
    maintenanceMode: settings.maintenanceMode,
    maintenanceMessage: settings.maintenanceMessage,
    lastFetch: now,
  };

  return settingsCache;
}

/**
 * Check if registration is required
 */
export async function isRegistrationRequired(): Promise<boolean> {
  const settings = await getSystemSettings();
  return settings.requireRegistration;
}

/**
 * Check if maintenance mode is active
 */
export async function isMaintenanceMode(): Promise<boolean> {
  const settings = await getSystemSettings();
  return settings.maintenanceMode;
}

/**
 * Clear the settings cache (call this after updating settings)
 */
export function clearSettingsCache() {
  settingsCache = null;
}

