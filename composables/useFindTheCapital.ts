/**
 * Find the Capital Game Mode Composable
 * Handles game logic for capital location game
 */

import countries from 'world-countries'
import capitalsData from '~/data/capitals-coordinates.json'

type CountryData = (typeof countries)[0]

/**
 * Get flag URL from backend cache
 */
const getFlagUrl = (cca2Code: string): string => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  return `${apiBase}/api/flags/${cca2Code.toLowerCase()}`
}

interface CapitalGameState {
  countryName: string
  capitalName: string
  capitalLat: number
  capitalLng: number
  flagImage: string
  score: number
}

export const useFindTheCapital = () => {
  // Game state
  const gameState = useState<CapitalGameState | null>('find-capital-game', () => null)
  const finalScore = useState<number>('find-capital-final-score', () => 0)
  const correctAnswerName = useState<string | null>('find-capital-correct-answer', () => null)

  // UI state
  const loading = ref(false)
  const selectedLocation = ref<{ lat: number; lng: number } | null>(null)
  const showFeedback = ref(false)
  const isCorrect = ref(false)
  const gameOver = ref(false)
  const lastDistance = ref<number>(0)

  // Get countries with capitals that exist in our capitals database
  const countriesWithCapitals = countries.filter(
    (c) => c.capital && c.capital.length > 0 && capitalsData[c.cca3 as keyof typeof capitalsData]
  )

  // Track used countries
  const usedCountries = useState<Set<string>>('find-capital-used', () => new Set())

  /**
   * Get random country with capital
   */
  const getRandomCountry = (): CountryData | null => {
    const availableCountries = countriesWithCapitals.filter((c) => !usedCountries.value.has(c.cca3))

    // Reset if all countries used
    if (availableCountries.length === 0) {
      usedCountries.value.clear()
      return getRandomCountry()
    }

    const randomIndex = Math.floor(Math.random() * availableCountries.length)
    const country = availableCountries[randomIndex]
    usedCountries.value.add(country.cca3)

    return country
  }

  /**
   * Start new game
   */
  const startGame = async () => {
    try {
      loading.value = true

      const country = getRandomCountry()
      if (!country) throw new Error('No countries available')

      const capitalInfo = capitalsData[country.cca3 as keyof typeof capitalsData]
      if (!capitalInfo) throw new Error('Capital coordinates not found')

      gameState.value = {
        countryName: country.name.common,
        capitalName: country.capital![0],
        capitalLat: capitalInfo.lat,
        capitalLng: capitalInfo.lng,
        flagImage: getFlagUrl(country.cca2),
        score: 0,
      }

      usedCountries.value.clear()
      usedCountries.value.add(country.cca3)
      finalScore.value = 0
      correctAnswerName.value = null
      gameOver.value = false
      showFeedback.value = false
      selectedLocation.value = null
    } catch (error) {
      console.error('Failed to start game:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Calculate distance between two coordinates in km
   */
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Submit answer (clicked location)
   */
  const submitAnswer = async (clickedLat: number, clickedLng: number) => {
    if (!gameState.value || loading.value || showFeedback.value) return

    try {
      loading.value = true
      selectedLocation.value = { lat: clickedLat, lng: clickedLng }

      const distance = calculateDistance(
        clickedLat,
        clickedLng,
        gameState.value.capitalLat,
        gameState.value.capitalLng
      )

      // Store the distance for display
      lastDistance.value = Math.round(distance)

      // Accept answer if within 250km (adjustable threshold)
      const THRESHOLD_KM = 250
      isCorrect.value = distance <= THRESHOLD_KM

      showFeedback.value = true

      if (!isCorrect.value) {
        // Wrong answer - set final score for results page
        finalScore.value = gameState.value.score
        correctAnswerName.value = `${gameState.value.capitalName} (${gameState.value.countryName})`
        // Don't set gameOver here - let the user click the button
      }
    } catch (error) {
      console.error('Answer submission error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Continue to next country (after correct answer)
   */
  const continueGame = async () => {
    if (!gameState.value || !isCorrect.value) return

    try {
      loading.value = true

      // Load next question
      const country = getRandomCountry()
      if (!country) throw new Error('No countries available')

      const capitalInfo = capitalsData[country.cca3 as keyof typeof capitalsData]
      if (!capitalInfo) throw new Error('Capital coordinates not found')

      gameState.value = {
        countryName: country.name.common,
        capitalName: country.capital![0],
        capitalLat: capitalInfo.lat,
        capitalLng: capitalInfo.lng,
        flagImage: getFlagUrl(country.cca2),
        score: gameState.value.score + 1,
      }

      showFeedback.value = false
      selectedLocation.value = null
    } catch (error) {
      console.error('Continue game error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Submit final score to backend
   */
  const submitScore = async (score: number) => {
    try {
      const { apiRequest } = useApi()
      const response = await apiRequest('/api/game/submit', {
        method: 'POST',
        body: {
          mode: 'FIND_CAPITAL',
          score,
          answers: score,
          correctAnswers: score,
        },
      })
      return response
    } catch (error) {
      console.error('Score submission error:', error)
      throw error
    }
  }

  /**
   * Reset game state
   */
  const resetGame = () => {
    gameState.value = null
    finalScore.value = 0
    correctAnswerName.value = null
    selectedLocation.value = null
    showFeedback.value = false
    isCorrect.value = false
    gameOver.value = false
    usedCountries.value.clear()
  }

  return {
    gameState,
    finalScore,
    correctAnswerName,
    loading,
    selectedLocation,
    showFeedback,
    isCorrect,
    gameOver,
    lastDistance,
    startGame,
    submitAnswer,
    continueGame,
    submitScore,
    resetGame,
  }
}
