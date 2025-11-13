/**
 * Composable for Guess the Flag game logic
 * Handles game state, API calls, and game flow
 */
import type {
  GuessTheFlagGameState,
  GuessTheFlagAnswerResponse,
} from '~/types'

export const useGuessTheFlag = () => {
  const { apiRequest } = useApi()

  // Game state
  const gameState = useState<GuessTheFlagGameState | null>('guessTheFlag:gameState', () => null)
  const loading = useState<boolean>('guessTheFlag:loading', () => false)
  const selectedAnswer = useState<string | null>('guessTheFlag:selectedAnswer', () => null)
  const showFeedback = useState<boolean>('guessTheFlag:showFeedback', () => false)
  const isCorrect = useState<boolean>('guessTheFlag:isCorrect', () => false)
  const gameOver = useState<boolean>('guessTheFlag:gameOver', () => false)
  const finalScore = useState<number>('guessTheFlag:finalScore', () => 0)
  const correctAnswerName = useState<string>('guessTheFlag:correctAnswerName', () => '')

  /**
   * Start a new game
   */
  const startGame = async () => {
    try {
      loading.value = true
      selectedAnswer.value = null
      showFeedback.value = false
      gameOver.value = false

      const response = await apiRequest<GuessTheFlagGameState>('/api/game/guess-the-flag/start', {
        method: 'POST',
      })

      gameState.value = response
      return response
    } catch (error: any) {
      console.error('Start game error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Submit an answer
   */
  const submitAnswer = async (answer: string) => {
    if (!gameState.value) {
      throw new Error('No active game session')
    }

    try {
      loading.value = true
      selectedAnswer.value = answer

      const response = await apiRequest<GuessTheFlagAnswerResponse>('/api/game/guess-the-flag/answer', {
        method: 'POST',
        body: {
          sessionId: gameState.value.sessionId,
          answer,
        },
      })

      // Show feedback
      showFeedback.value = true
      isCorrect.value = response.correct

      if (response.gameOver) {
        // Game is over
        gameOver.value = true
        finalScore.value = response.finalScore || 0
        correctAnswerName.value = response.correctAnswerName || ''
      } else if (response.nextFlag) {
        // Correct answer - prepare next flag
        // Wait a bit before loading next flag
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Update game state with next flag
        gameState.value = {
          ...gameState.value,
          flagToken: response.nextFlag.flagToken,
          flagImage: response.nextFlag.flagImage,
          options: response.nextFlag.options,
          score: response.score || gameState.value.score,
        }

        // Reset feedback
        showFeedback.value = false
        selectedAnswer.value = null
      }

      return response
    } catch (error: any) {
      console.error('Submit answer error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Submit final score to leaderboard
   */
  const submitScore = async (score: number) => {
    try {
      const response = await apiRequest<any>('/api/game/submit', {
        method: 'POST',
        body: {
          mode: 'GUESS_FLAG',
          score,
          data: {
            gameMode: 'Guess the Flag - Infinite Mode',
          },
        },
      })

      return response
    } catch (error: any) {
      console.error('Submit score error:', error)
      throw error
    }
  }

  /**
   * Reset game state
   */
  const resetGame = () => {
    gameState.value = null
    selectedAnswer.value = null
    showFeedback.value = false
    isCorrect.value = false
    gameOver.value = false
    finalScore.value = 0
    correctAnswerName.value = ''
  }

  /**
   * Get current flag image URL (with proxy headers to prevent inspect)
   */
  const getFlagImageUrl = () => {
    return gameState.value?.flagImage || ''
  }

  return {
    // State
    gameState: readonly(gameState),
    loading: readonly(loading),
    selectedAnswer: readonly(selectedAnswer),
    showFeedback: readonly(showFeedback),
    isCorrect: readonly(isCorrect),
    gameOver: readonly(gameOver),
    finalScore: readonly(finalScore),
    correctAnswerName: readonly(correctAnswerName),

    // Methods
    startGame,
    submitAnswer,
    submitScore,
    resetGame,
    getFlagImageUrl,
  }
}
