import type { User, LoginCredentials, RegisterData, AuthResponse } from '~/types'

/**
 * Authentication composable
 *
 * SECURITY NOTES:
 * - Uses HttpOnly, Secure cookies for session management (handled by backend)
 * - No JWT tokens stored in localStorage
 * - CSRF protection included for all mutating requests
 * - User role verified server-side on every request
 */
export const useAuth = () => {
  const user = useState<User | null>('auth:user', () => null)
  const loading = useState<boolean>('auth:loading', () => false)
  const error = useState<string | null>('auth:error', () => null)

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  /**
   * Fetch current authenticated user from backend
   * SECURITY: Always fetches from /api/auth/me to verify session server-side
   */
  const fetchUser = async (): Promise<User | null> => {
    try {
      loading.value = true
      error.value = null

      // Use different approach for SSR vs client-side
      // During SSR, we need to forward cookies from the request
      // On client side, $fetch automatically includes cookies
      if (process.server) {
        // SSR: Use useFetch with cookie forwarding
        const { data, error: fetchError } = await useFetch<AuthResponse>(`${apiBase}/api/auth/me`, {
          credentials: 'include',
          headers: useRequestHeaders(['cookie']) as HeadersInit,
        })

        if (fetchError.value) {
          throw fetchError.value
        }

        if (!data.value) {
          throw new Error('No data returned')
        }

        user.value = data.value.user
        return data.value.user
      } else {
        // Client-side: Use $fetch which automatically includes cookies
        const response = await $fetch<AuthResponse>(`${apiBase}/api/auth/me`, {
          credentials: 'include',
        })

        user.value = response.user
        return response.user
      }
    } catch (err: any) {
      // If unauthorized, clear user state
      if (err.statusCode === 401) {
        user.value = null
      } else {
        error.value = err.data?.message || 'Failed to fetch user'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Login user with credentials
   * SECURITY: Backend sets HttpOnly, Secure cookie on success
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      // Get CSRF token first
      const csrfToken = await useApi().getCsrfToken()

      const response = await $fetch<AuthResponse>(`${apiBase}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: credentials,
        mode: 'cors',
      })

      user.value = response.user
      return true
    } catch (err: any) {
      error.value = err.data?.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Register new user
   * SECURITY: Backend sets HttpOnly, Secure cookie on success
   */
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      // Get CSRF token first
      const csrfToken = await useApi().getCsrfToken()

      const response = await $fetch<AuthResponse>(`${apiBase}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: data,
        mode: 'cors',
      })

      user.value = response.user
      return true
    } catch (err: any) {
      error.value = err.data?.message || 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout current user
   * SECURITY: Backend clears HttpOnly cookie
   */
  const logout = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      // Get CSRF token first
      const csrfToken = await useApi().getCsrfToken()

      await $fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      })

      user.value = null

      // Redirect to home
      await navigateTo('/')
    } catch (err: any) {
      error.value = err.data?.message || 'Logout failed'
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if current user is admin
   * SECURITY: Role is verified server-side, this is for UI rendering only
   */
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => !!user.value)

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    isAdmin,
    fetchUser,
    login,
    register,
    logout,
  }
}
