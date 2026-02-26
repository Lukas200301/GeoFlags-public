/**
 * Game Modes Composable
 * Handles game mode fetching with caching
 */
import type { GameModeConfig } from '~/types'

// Icon mapping for game modes
const iconMap: Record<string, string> = {
  FLAGS: 'mdi:flag',
  CAPITALS: 'mdi:city',
  MAPS: 'mdi:map',
  MIXED: 'mdi:shuffle-variant',
  GUESS_FLAG: 'mdi:flag-checkered',
  TIME_TRIAL: 'mdi:timer-sand',
  FIND_CAPITAL: 'mdi:map-marker',
  HIGHER_LOWER: 'mdi:chevron-triple-up',
  SILHOUETTE: 'mdi:shape-outline',
}

export const useGameModes = () => {
  const { getGameModes: fetchGameModes } = useApi()

  // Use useState for cross-component caching
  const gameModes = useState<GameModeConfig[]>('game-modes', () => [])
  const loading = useState<boolean>('game-modes-loading', () => false)
  const error = useState<string | null>('game-modes-error', () => null)
  const lastFetchTime = useState<number>('game-modes-last-fetch', () => 0)

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000

  /**
   * Fetch game modes with caching
   */
  const fetchModes = async (forceRefresh = false) => {
    const now = Date.now()

    // Return cached data if still fresh
    if (!forceRefresh && gameModes.value.length > 0 && now - lastFetchTime.value < CACHE_DURATION) {
      return gameModes.value
    }

    try {
      loading.value = true
      error.value = null

      const modes = await fetchGameModes()

      // Add icon property to each mode and filter enabled ones
      gameModes.value = modes
        .filter((mode) => mode.enabled)
        .map((mode) => ({
          ...mode,
          icon: iconMap[mode.id] || 'mdi:gamepad-variant',
        }))

      lastFetchTime.value = now

      return gameModes.value
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to load game modes'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Navigate to a game mode
   */
  const navigateToMode = (modeId: string) => {
    const router = useRouter()

    if (modeId === 'GUESS_FLAG') {
      return router.push('/play/guess-the-flag')
    } else if (modeId === 'TIME_TRIAL') {
      return router.push('/play/time-trial')
    } else if (modeId === 'FIND_CAPITAL') {
      return router.push('/play/find-capital')
    } else if (modeId === 'HIGHER_LOWER') {
      return router.push('/play/higher-lower')
    } else if (modeId === 'SILHOUETTE') {
      return router.push('/play/silhouette')
    } else {
      // For other modes, use the [mode] folder
      return router.push(`/play/${modeId.toLowerCase()}`)
    }
  }

  return {
    gameModes,
    loading,
    error,
    fetchModes,
    navigateToMode,
  }
}
