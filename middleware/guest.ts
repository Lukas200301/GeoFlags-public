/**
 * Guest middleware
 *
 * Redirects authenticated users away from auth pages (login/register)
 */
export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated } = useAuth()

  // Redirect to home if already authenticated
  // Don't fetch user here - let app.vue handle it
  if (isAuthenticated.value) {
    return navigateTo('/')
  }
})
