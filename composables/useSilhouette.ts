/**
 * Composable for Country Silhouette game logic
 * Handles game state, API calls, and game flow
 */

export interface SilhouetteOption {
  id: string
  name: string
}

export interface SilhouetteGameState {
  sessionId: string
  outline: object
  options: SilhouetteOption[]
  score: number
  totalCountries: number
}

export interface SilhouetteAnswerResponse {
  correct: boolean
  gameOver: boolean
  finalScore?: number
  correctAnswer?: string
  correctAnswerName?: string
  perfectGame?: boolean
  score?: number
  nextOutline?: {
    outline: object
    options: SilhouetteOption[]
  }
}

export const useSilhouette = () => {
  const { apiRequest } = useApi()

  const gameState = useState<SilhouetteGameState | null>('silhouette:gameState', () => null)
  const loading = useState<boolean>('silhouette:loading', () => false)
  const selectedAnswer = useState<string | null>('silhouette:selectedAnswer', () => null)
  const showFeedback = useState<boolean>('silhouette:showFeedback', () => false)
  const isCorrect = useState<boolean>('silhouette:isCorrect', () => false)
  const gameOver = useState<boolean>('silhouette:gameOver', () => false)
  const finalScore = useState<number>('silhouette:finalScore', () => 0)
  const correctAnswerName = useState<string>('silhouette:correctAnswerName', () => '')

  const startGame = async () => {
    try {
      loading.value = true
      selectedAnswer.value = null
      showFeedback.value = false
      gameOver.value = false

      const response = await apiRequest<SilhouetteGameState>('/api/game/silhouette/start', {
        method: 'POST',
      })

      gameState.value = response
      return response
    } catch (error: any) {
      console.error('Silhouette start error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const submitAnswer = async (answer: string) => {
    if (!gameState.value) {
      throw new Error('No active game session')
    }

    try {
      loading.value = true
      selectedAnswer.value = answer

      const response = await apiRequest<SilhouetteAnswerResponse>('/api/game/silhouette/answer', {
        method: 'POST',
        body: {
          sessionId: gameState.value.sessionId,
          answer,
        },
      })

      showFeedback.value = true
      isCorrect.value = response.correct

      if (response.gameOver) {
        gameOver.value = true
        finalScore.value = response.finalScore || 0
        correctAnswerName.value = response.correctAnswerName || ''
      } else if (response.nextOutline) {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        gameState.value = {
          ...gameState.value,
          outline: response.nextOutline.outline,
          options: response.nextOutline.options,
          score: response.score || gameState.value.score,
        }

        showFeedback.value = false
        selectedAnswer.value = null
      }

      return response
    } catch (error: any) {
      console.error('Silhouette answer error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const submitScore = async (score: number) => {
    try {
      const response = await apiRequest<any>('/api/game/submit', {
        method: 'POST',
        body: {
          mode: 'SILHOUETTE',
          score,
          data: {
            gameMode: 'Country Silhouette',
          },
        },
      })
      return response
    } catch (error: any) {
      console.error('Submit score error:', error)
      throw error
    }
  }

  const resetGame = () => {
    gameState.value = null
    selectedAnswer.value = null
    showFeedback.value = false
    isCorrect.value = false
    gameOver.value = false
    finalScore.value = 0
    correctAnswerName.value = ''
  }

  return {
    gameState: readonly(gameState),
    loading: readonly(loading),
    selectedAnswer: readonly(selectedAnswer),
    showFeedback: readonly(showFeedback),
    isCorrect: readonly(isCorrect),
    gameOver: readonly(gameOver),
    finalScore: readonly(finalScore),
    correctAnswerName: readonly(correctAnswerName),

    startGame,
    submitAnswer,
    submitScore,
    resetGame,
  }
}
