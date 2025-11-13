/**
 * Can Play Middleware (Client-side)
 *
 * Checks if user can access game pages:
 * - If registration is required and user is not logged in, redirect to /play
 * - If user is banned or suspended, redirect to /play (with warning banner)
 */

export default defineNuxtRouteMiddleware(async () => {
  const { user } = useAuth()
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  // Fetch settings directly - don't rely on plugins
  let requireRegistration = false

  try {
    const response = await fetch(`${apiBase}/api/game/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      requireRegistration = data.requireRegistration
    }
  } catch (error) {
    // Default to allowing guest play on error
  }

  // Check if registration is required and user is not logged in
  if (requireRegistration && !user.value) {
    return navigateTo('/play')
  }

  // Check if user is banned or suspended
  if (user.value && (user.value.status === 'BANNED' || user.value.status === 'SUSPENDED')) {
    return navigateTo('/play')
  }
})
