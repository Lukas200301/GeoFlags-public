/**
 * Maintenance Mode Middleware (Global)
 *
 * Checks if the site is in maintenance mode:
 * - Allows access to /auth/login, /auth/register, /maintenance, and /admin/* for admins
 * - Redirects all other users to /maintenance page
 * - When maintenance is OFF, redirects away from /maintenance page
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client side
  if (import.meta.server) return

  const { maintenanceMode, settingsLoaded, fetchSystemSettings } = useSystemSettings()
  const { user, isAdmin, fetchUser } = useAuth()

  // Ensure settings are loaded
  if (!settingsLoaded.value) {
    await fetchSystemSettings()
  }

  // Always allow access to these routes regardless of maintenance mode
  const allowedPaths = ['/auth/login', '/auth/register', '/maintenance']
  const isAllowedPath = allowedPaths.some(
    (path) => to.path === path || to.path.startsWith(path + '/')
  )

  if (maintenanceMode.value) {
    // If already going to an allowed path, let them through
    if (isAllowedPath) {
      return
    }

    // Fetch user if not loaded yet (they might be logged in)
    if (!user.value) {
      await fetchUser()
    }

    // Allow admins to bypass maintenance mode
    if (isAdmin.value) {
      return
    }

    // Redirect everyone else to maintenance page
    return navigateTo('/maintenance')
  } else {
    // Maintenance mode is OFF - redirect away from maintenance page
    if (to.path === '/maintenance') {
      return navigateTo('/')
    }
  }
})
