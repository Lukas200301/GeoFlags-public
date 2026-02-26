/**
 * System Settings Composable
 *
 * Provides access to public system settings like registration requirements
 * and maintenance mode status
 */

export function useSystemSettings() {
  const { apiRequest } = useApi()

  const requireRegistration = useState<boolean>('require-registration', () => false)
  const maintenanceMode = useState<boolean>('maintenance-mode', () => false)
  const maintenanceMessage = useState<string | null>('maintenance-message', () => null)
  const settingsLoaded = useState<boolean>('settings-loaded', () => false)
  const isLoading = useState<boolean>('settings-loading', () => false)

  const fetchSystemSettings = async (force = false) => {
    // Prevent multiple simultaneous fetches
    if (isLoading.value) {
      return
    }

    // Don't fetch if already loaded (unless forced)
    if (settingsLoaded.value && !force) {
      return
    }

    try {
      isLoading.value = true
      const response = await apiRequest<{
        requireRegistration: boolean
        maintenanceMode: boolean
        maintenanceMessage: string | null
      }>(
        '/api/game/settings',
        { requiresAuth: false }
      )
      requireRegistration.value = response.requireRegistration
      maintenanceMode.value = response.maintenanceMode
      maintenanceMessage.value = response.maintenanceMessage
      settingsLoaded.value = true
    } catch (error) {
      console.error('[useSystemSettings] Failed to fetch system settings:', error)
      // Default to safe values if fetch fails
      requireRegistration.value = false
      maintenanceMode.value = false
      maintenanceMessage.value = null
      settingsLoaded.value = true
    } finally {
      isLoading.value = false
    }
  }

  return {
    requireRegistration,
    maintenanceMode,
    maintenanceMessage,
    settingsLoaded,
    fetchSystemSettings,
  }
}
