/**
 * Require Authentication Middleware (Client-side)
 *
 * Redirects to play page if:
 * - User is not authenticated AND
 * - Registration is required
 */

export default defineNuxtRouteMiddleware(async () => {
  const { user } = useAuth()
  const { requireRegistration, settingsLoaded, fetchSystemSettings } = useSystemSettings()

  // Fetch settings if not loaded yet
  if (!settingsLoaded.value) {
    await fetchSystemSettings()
  }

  // If registration is required and user is not logged in
  if (requireRegistration.value && !user.value) {
    return navigateTo('/play')
  }
})
