/**
 * Authentication middleware
 *
 * SECURITY:
 * - Protects routes requiring authentication
 * - Verifies user session with backend via /api/auth/me
 * - Redirects to login if not authenticated
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { fetchUser, isAuthenticated, user } = useAuth()

  // If no user data is present, try to fetch it
  // This is important for SSR/page refresh scenarios
  if (!user.value) {
    await fetchUser()
  }

  // After fetching, check if authenticated
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

})
