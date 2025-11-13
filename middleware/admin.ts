/**
 * Admin middleware
 *
 * SECURITY:
 * - Protects admin routes (e.g., /admin/*)
 * - Verifies user is authenticated AND has admin role
 * - Role is verified server-side via /api/auth/me
 * - Client-side check is for UX only; backend enforces all permissions
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { fetchUser, isAuthenticated, isAdmin } = useAuth()

  // Fetch user if not already loaded
  if (!isAuthenticated.value) {
    await fetchUser()
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

  // SECURITY: Check if user has admin role
  // Note: This is verified server-side; this check is for UX only
  if (!isAdmin.value) {
    // Redirect to access denied page (unless already there to prevent loop)
    if (to.path !== '/admin/access-denied') {
      return navigateTo('/admin/access-denied')
    }
  }
})
