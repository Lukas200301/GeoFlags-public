import type {
  ScoreSubmission,
  LeaderboardEntry,
  LeaderboardFilters,
  CsrfTokenResponse,
  GameModeConfig,
  AdminStats,
  AdminUser,
} from '~/types'

/**
 * API integration composable
 *
 * SECURITY NOTES:
 * - All mutating requests include CSRF token
 * - Credentials included for session cookie authentication
 * - Error handling with proper status codes
 */

/**
 * Helper function to convert frontend game mode to backend format
 * Frontend: 'guess-the-flag' -> Backend: 'GUESS_FLAG'
 */
const convertModeToBackend = (mode: string): string => {
  const modeMap: Record<string, string> = {
    flags: 'FLAGS',
    capitals: 'CAPITALS',
    maps: 'MAPS',
    mixed: 'MIXED',
    'guess-the-flag': 'GUESS_FLAG',
  }
  return modeMap[mode] || mode.toUpperCase().replace(/-/g, '_')
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  // CSRF token cache
  const csrfToken = useState<string | null>('api:csrf-token', () => null)

  /**
   * Get CSRF token from backend
   * SECURITY: Required for all POST/PUT/DELETE/PATCH requests
   */
  const getCsrfToken = async (): Promise<string> => {
    if (csrfToken.value) {
      return csrfToken.value
    }

    try {
      const response = await $fetch<CsrfTokenResponse>(`${apiBase}/api/csrf-token`, {
        credentials: 'include',
      })

      csrfToken.value = response.csrfToken
      return response.csrfToken
    } catch (err) {
      console.error('Failed to get CSRF token:', err)
      throw new Error('Failed to get CSRF token')
    }
  }

  /**
   * Generic API request wrapper
   * SECURITY: Automatically includes CSRF token for mutating requests
   */
  const apiRequest = async <T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      body?: any
      requiresAuth?: boolean
    } = {}
  ): Promise<T> => {
    const { method = 'GET', body, requiresAuth = true } = options

    const headers: Record<string, string> = {}

    // Add CSRF token for mutating requests
    if (method !== 'GET') {
      const token = await getCsrfToken()
      headers['X-CSRF-Token'] = token
    }

    try {
      return await $fetch<T>(`${apiBase}${endpoint}`, {
        method,
        body,
        headers,
        credentials: requiresAuth ? 'include' : 'omit',
      })
    } catch (err: any) {
      throw err
    }
  }

  // === Game Modes ===

  /**
   * Get all available game modes
   */
  const getGameModes = async (): Promise<GameModeConfig[]> => {
    const response = await apiRequest<{ modes: GameModeConfig[] }>('/api/game/modes', {
      requiresAuth: false,
    })
    return response.modes
  }

  // === Scores ===

  /**
   * Submit game score
   * SECURITY: Requires authentication, CSRF protected
   */
  const submitScore = async (score: ScoreSubmission): Promise<{ success: boolean }> => {
    return apiRequest('/api/game/submit', {
      method: 'POST',
      body: score,
    })
  }

  // === Leaderboard ===

  /**
   * Get leaderboard entries
   */
  const getLeaderboard = async (filters?: LeaderboardFilters): Promise<LeaderboardEntry[]> => {
    const query = new URLSearchParams()
    if (filters?.mode) query.append('mode', convertModeToBackend(filters.mode))
    if (filters?.difficulty) query.append('difficulty', filters.difficulty)
    if (filters?.period) query.append('period', filters.period)
    if (filters?.limit) query.append('limit', filters.limit.toString())

    const queryString = query.toString()
    const endpoint = `/api/game/leaderboard${queryString ? `?${queryString}` : ''}`

    const response = await apiRequest<{
      leaderboard: LeaderboardEntry[]
      userRank: any
      mode: string
      total: number
    }>(endpoint, { requiresAuth: false })
    return response.leaderboard
  }

  // === Admin APIs ===

  /**
   * Get admin statistics
   * SECURITY: Requires admin role verification on backend
   */
  const getAdminStats = async (): Promise<AdminStats> => {
    return apiRequest<AdminStats>('/api/admin/stats')
  }

  /**
   * Get all users (admin only)
   * SECURITY: Requires admin role verification on backend
   */
  const getAdminUsers = async (): Promise<AdminUser[]> => {
    const response = await apiRequest<{ users: AdminUser[]; pagination: any }>(
      '/api/admin/users?limit=10000',
      {
        requiresAuth: true,
      }
    )
    return response.users
  }

  /**
   * Update user status (admin only)
   * SECURITY: Requires admin role verification on backend, CSRF protected
   */
  const updateUserStatus = async (
    userId: string,
    status: 'ACTIVE' | 'BANNED' | 'SUSPENDED',
    banReason?: string,
    expiresAt?: string
  ): Promise<{ success: boolean }> => {
    // Convert to lowercase for backend
    const backendStatus = status.toLowerCase() as 'active' | 'banned' | 'suspended'

    return apiRequest(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: {
        status: backendStatus,
        banReason,
        bannedUntil: expiresAt,
      },
    })
  }

  /**
   * Delete user (admin only)
   * SECURITY: Requires admin role verification on backend, CSRF protected
   */
  const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    return apiRequest(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Update game mode configuration (admin only)
   * SECURITY: Requires admin role verification on backend, CSRF protected
   */
  const updateGameMode = async (
    modeId: string,
    data: Partial<GameModeConfig>
  ): Promise<GameModeConfig> => {
    return apiRequest(`/api/admin/game-modes/${modeId}`, {
      method: 'PATCH',
      body: data,
    })
  }

  /**
   * Clear leaderboard (admin only)
   * SECURITY: Requires admin role verification on backend, CSRF protected
   * SECURITY: Should prompt for re-authentication before calling
   */
  const clearLeaderboard = async (): Promise<{ success: boolean }> => {
    return apiRequest('/api/admin/leaderboard/clear', {
      method: 'DELETE',
    })
  }

  return {
    getCsrfToken,
    apiRequest,
    // Game modes
    getGameModes,
    // Scores
    submitScore,
    // Leaderboard
    getLeaderboard,
    // Admin
    getAdminStats,
    getAdminUsers,
    updateUserStatus,
    deleteUser,
    updateGameMode,
    clearLeaderboard,
  }
}
