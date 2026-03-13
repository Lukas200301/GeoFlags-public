/**
 * Admin Utilities Composable
 *
 * Provides utilities for admin operations including re-authentication,
 * audit logging, and common admin API calls.
 *
 * SECURITY:
 * - All critical operations require re-authentication
 * - All actions are audit-logged
 * - Uses server-side validation
 */

export interface ReAuthResponse {
  success: boolean
  reauthToken: string
  expiresAt: string
}

export interface AuditLogEntry {
  id: string
  adminId: string
  action: string
  targetType: string
  targetId?: string
  before?: any
  after?: any
  ip?: string
  userAgent?: string
  createdAt: string
}

export const useAdmin = () => {
  const { apiRequest } = useApi()
  const toast = useToast()

  // Re-authentication state
  const reauthToken = useState<string | null>('admin:reauthToken', () => null)
  const reauthExpiry = useState<Date | null>('admin:reauthExpiry', () => null)

  /**
   * Check if user has a valid re-auth token
   */
  const isReauthValid = computed(() => {
    if (!reauthToken.value || !reauthExpiry.value) return false
    return new Date() < reauthExpiry.value
  })

  /**
   * Re-authenticate admin user
   * Required before critical operations
   */
  const reauth = async (password: string): Promise<boolean> => {
    try {
      const response = await apiRequest<ReAuthResponse>('/api/auth/re-auth', {
        method: 'POST',
        body: { password },
      })

      if (response.success) {
        reauthToken.value = response.reauthToken
        reauthExpiry.value = new Date(response.expiresAt)
        return true
      }

      return false
    } catch (error: any) {
      console.error('Re-authentication failed:', error)
      toast.error(error.data?.message || 'Re-authentication failed')
      return false
    }
  }

  /**
   * Clear re-auth token
   */
  const clearReauth = () => {
    reauthToken.value = null
    reauthExpiry.value = null
  }

  /**
   * Execute a critical admin action that requires re-auth
   */
  const executeWithReauth = async <T>(
    action: () => Promise<T>,
    options: {
      requireReauth?: boolean
      successMessage?: string
      errorMessage?: string
    } = {}
  ): Promise<T | null> => {
    const { requireReauth = true, successMessage, errorMessage } = options

    try {
      // Check if re-auth is required and valid
      if (requireReauth && !isReauthValid.value) {
        throw new Error('Re-authentication required')
      }

      const result = await action()

      if (successMessage) {
        toast.success(successMessage)
      }

      return result
    } catch (error: any) {
      console.error('Admin action failed:', error)
      const message = errorMessage || error.data?.message || 'Operation failed'
      toast.error(message)
      return null
    }
  }

  /**
   * Log an audit entry
   * Called automatically by critical operations
   */
  const logAudit = async (entry: Omit<AuditLogEntry, 'id' | 'createdAt' | 'ip' | 'userAgent'>) => {
    try {
      await apiRequest('/api/admin/audit', {
        method: 'POST',
        body: entry,
      })
    } catch (error) {
      console.error('Failed to log audit entry:', error)
      // Don't throw - audit logging shouldn't block operations
    }
  }

  /**
   * Fetch audit log entries
   */
  const getAuditLog = async (filters?: {
    adminId?: string
    action?: string
    targetType?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{ entries: AuditLogEntry[]; total: number }> => {
    const query = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, String(value))
        }
      })
    }

    const endpoint = `/api/admin/audit${query.toString() ? `?${query}` : ''}`
    return apiRequest(endpoint, { method: 'GET' })
  }

  /**
   * Request re-authentication (shows re-auth modal)
   * Returns true if user successfully re-authenticated
   */
  const requireReauth = async (): Promise<boolean> => {
    // If already have valid reauth token, don't ask again
    if (isReauthValid.value) {
      return true
    }

    // Create a promise that will be resolved by the ConfirmReauth component
    return new Promise((resolve) => {
      // Trigger a global event that ConfirmReauth component will listen to
      const event = new CustomEvent('admin:reauth-required', {
        detail: { resolve },
      })
      window.dispatchEvent(event)
    })
  }

  return {
    // Re-auth
    isReauthValid,
    reauth,
    clearReauth,
    executeWithReauth,
    requireReauth,

    // Audit
    logAudit,
    getAuditLog,
  }
}
