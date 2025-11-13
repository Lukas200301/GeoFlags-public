/**
 * System Settings Composable
 *
 * Provides access to public system settings like registration requirements
 */

export function useSystemSettings() {
  const { apiRequest } = useApi()

  const requireRegistration = useState<boolean>('require-registration', () => false)
  const settingsLoaded = useState<boolean>('settings-loaded', () => false)
  const isLoading = useState<boolean>('settings-loading', () => false)

  const fetchSystemSettings = async () => {
    // Prevent multiple simultaneous fetches
    if (isLoading.value) {
      return
    }

    // Don't fetch if already loaded
    if (settingsLoaded.value) {
      return
    }

    try {
      isLoading.value = true
      console.log('[useSystemSettings] Fetching from /api/game/settings...')
      const response = await apiRequest<{ requireRegistration: boolean }>(
        '/api/game/settings',
        { requiresAuth: false }
      )
      console.log('[useSystemSettings] Response:', response)
      requireRegistration.value = response.requireRegistration
      settingsLoaded.value = true
      console.log('[useSystemSettings] Settings loaded:', { requireRegistration: requireRegistration.value })
    } catch (error) {
      console.error('[useSystemSettings] Failed to fetch system settings:', error)
      // Default to false if fetch fails (allow guest play on error)
      requireRegistration.value = false
      settingsLoaded.value = true
      console.warn('[useSystemSettings] Defaulting to allow guest play due to error')
    } finally {
      isLoading.value = false
    }
  }

  return {
    requireRegistration,
    settingsLoaded,
    fetchSystemSettings,
  }
}
