<template>
  <div class="max-w-6xl mx-auto">
    <!-- Game Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <NuxtLink
          to="/play/higher-lower"
          class="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
        >
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          <span>Back to Rules</span>
        </NuxtLink>

        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm text-gray-400">Current Streak</p>
            <p class="text-3xl font-bold text-primary-400">{{ score }}</p>
          </div>
          <button @click="showQuitDialog = true" class="btn-secondary px-4 py-2">
            <Icon name="mdi:close" class="w-5 h-5 inline mr-1" />
            Quit
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card p-12 text-center">
      <div
        class="animate-spin w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"
      ></div>
      <p class="text-gray-400">Preparing countries...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card p-12 text-center">
      <Icon name="mdi:alert-circle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <p class="text-gray-300 mb-6">{{ error }}</p>
      <button @click="router.push('/play/higher-lower')" class="btn-primary">Back to Rules</button>
    </div>

    <!-- Game Board -->
    <div v-else-if="gameState && !gameState.gameOver" class="space-y-6">
      <div class="grid md:grid-cols-2 gap-6">
        <!-- First Country (Reference) -->
        <div
          class="card p-6 bg-gradient-to-br from-primary-900/20 to-primary-800/20 border-2 border-primary-500/50"
        >
          <div class="aspect-[3/2] bg-gray-800 rounded-lg overflow-hidden mb-4">
            <img
              v-if="currentCountry"
              :src="currentCountry.flagImage"
              :alt="`Flag of ${currentCountry.name}`"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-100 mb-2">{{ currentCountry?.name }}</p>
            <div class="bg-primary-900/50 rounded-lg p-4 border border-primary-500/30">
              <p class="text-sm text-gray-400 mb-1">Land Area</p>
              <p class="text-3xl font-bold text-primary-400">{{ currentCountry?.areaFormatted }}</p>
            </div>
          </div>
        </div>

        <!-- Second Country (Guess) -->
        <div class="card p-6">
          <div class="aspect-[3/2] bg-gray-800 rounded-lg overflow-hidden mb-4">
            <img
              v-if="nextCountry"
              :src="nextCountry.flagImage"
              :alt="`Flag of ${nextCountry.name}`"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-100 mb-4">{{ nextCountry?.name }}</p>

            <!-- Show Area When Feedback is Displayed -->
            <div v-if="showFeedback && revealedCountry" class="mb-4">
              <div class="bg-green-900/50 rounded-lg p-4 border border-green-500/30 animate-pulse">
                <p class="text-sm text-gray-400 mb-1">Land Area</p>
                <p class="text-3xl font-bold text-green-400">{{ revealedCountry.areaFormatted }}</p>
              </div>
              <div class="mt-4 flex items-center justify-center gap-2 text-green-400">
                <Icon name="mdi:check-circle" class="w-6 h-6" />
                <span class="font-bold text-lg">Correct! +1</span>
              </div>
            </div>

            <!-- Guess Buttons -->
            <div v-else-if="!answering && !showFeedback" class="flex gap-3 justify-center">
              <button
                @click="submitGuess('higher')"
                :disabled="answering || showFeedback"
                class="flex-1 px-8 py-4 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg font-bold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Icon name="mdi:chevron-up" class="w-6 h-6" />
                <span>Higher</span>
              </button>
              <button
                @click="submitGuess('lower')"
                :disabled="answering || showFeedback"
                class="flex-1 px-8 py-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-bold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Icon name="mdi:chevron-down" class="w-6 h-6" />
                <span>Lower</span>
              </button>
            </div>

            <!-- Processing -->
            <div v-else-if="answering" class="py-4">
              <div
                class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Over Modal -->
    <div
      v-if="gameState?.gameOver"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <div class="card max-w-2xl w-full p-8">
        <div class="text-center mb-8">
          <div v-if="gameState.perfectGame" class="mb-6">
            <Icon name="mdi:trophy" class="w-24 h-24 text-yellow-400 mx-auto mb-4" />
            <h2 class="text-4xl font-bold text-yellow-400 mb-2">Perfect Game!</h2>
            <p class="text-gray-300">{{ gameState.message }}</p>
          </div>
          <div v-else>
            <Icon name="mdi:close-circle" class="w-24 h-24 text-red-500 mx-auto mb-4" />
            <h2 class="text-4xl font-bold text-gray-100 mb-2">Game Over!</h2>
          </div>
        </div>

        <!-- Final Score -->
        <div
          class="bg-gradient-to-br from-primary-900/40 to-primary-800/40 rounded-xl p-8 mb-6 border border-primary-500/30"
        >
          <p class="text-sm text-gray-400 mb-2 text-center">Final Streak</p>
          <p class="text-6xl font-bold text-primary-400 text-center">{{ gameState.finalScore }}</p>
        </div>

        <!-- Answer Reveal (if wrong answer) -->
        <div
          v-if="!gameState.correct && gameState.currentCountry && gameState.previousCountry"
          class="bg-gray-800/50 rounded-lg p-6 mb-6"
        >
          <p class="text-sm text-gray-400 mb-4 text-center">The correct answer was:</p>
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <p class="text-lg font-semibold text-gray-200 mb-1">
                {{ gameState.previousCountry.name }}
              </p>
              <p class="text-2xl font-bold text-gray-100">
                {{ gameState.previousCountry.areaFormatted }}
              </p>
            </div>
            <div>
              <p class="text-lg font-semibold text-gray-200 mb-1">
                {{ gameState.currentCountry.name }}
              </p>
              <p class="text-2xl font-bold text-primary-400">
                {{ gameState.currentCountry.areaFormatted }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button @click="playAgain" class="btn-primary flex-1">
            <Icon name="mdi:refresh" class="w-5 h-5 inline mr-2" />
            Play Again
          </button>
          <NuxtLink to="/play" class="btn-secondary flex-1 text-center">
            <Icon name="mdi:home" class="w-5 h-5 inline mr-2" />
            Back to Menu
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Quit Confirmation Dialog -->
    <div
      v-if="showQuitDialog"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <div class="card max-w-md w-full p-6">
        <h3 class="text-2xl font-bold text-gray-100 mb-4">Quit Game?</h3>
        <p class="text-gray-300 mb-6">
          Are you sure you want to quit? Your current streak of
          <strong class="text-primary-400">{{ score }}</strong> will be lost.
        </p>
        <div class="flex gap-4">
          <button @click="showQuitDialog = false" class="btn-secondary flex-1">Cancel</button>
          <button @click="handleQuit" class="btn-primary flex-1 bg-red-600 hover:bg-red-500">
            Quit Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Higher/Lower - Game Page
 * Compare country sizes and build your streak
 */
definePageMeta({
  layout: 'default',
  middleware: 'can-play',
})

const router = useRouter()
const { apiRequest } = useApi()
const { user } = useAuth()

interface Country {
  code: string
  name: string
  flagImage: string
  area?: number
  areaFormatted?: string
}

interface GameState {
  sessionId?: string
  score: number
  firstCountry?: Country
  secondCountry?: Country
  gameOver?: boolean
  finalScore?: number
  correct?: boolean
  currentCountry?: Country
  previousCountry?: Country
  nextCountry?: Country
  perfectGame?: boolean
  message?: string
}

const gameState = ref<GameState | null>(null)
const currentCountry = ref<Country | null>(null)
const nextCountry = ref<Country | null>(null)
const score = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)
const answering = ref(false)
const showQuitDialog = ref(false)
const showFeedback = ref(false)
const wasCorrect = ref(false)
const revealedCountry = ref<Country | null>(null)

// Start game on mount
const startGame = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await apiRequest<GameState>('/api/game/higher-lower/start', {
      method: 'POST',
    })

    gameState.value = response
    currentCountry.value = response.firstCountry ?? null
    nextCountry.value = response.secondCountry ?? null
    score.value = response.score
  } catch (err: any) {
    // Check if user is banned/suspended
    if (err.data?.banned || err.data?.suspended) {
      error.value = err.data.message
      setTimeout(() => router.push('/play'), 2000)
      return
    }
    error.value = err.data?.message || 'Failed to start game'
  } finally {
    loading.value = false
  }
}

// Submit guess
const submitGuess = async (guess: 'higher' | 'lower') => {
  if (!gameState.value?.sessionId || !currentCountry.value) return

  try {
    answering.value = true

    const response = await apiRequest<GameState>('/api/game/higher-lower/answer', {
      method: 'POST',
      body: {
        sessionId: gameState.value.sessionId,
        guess,
        previousCountryCode: currentCountry.value.code,
      },
    })

    if (response.gameOver) {
      // Game ended
      gameState.value = { ...gameState.value, ...response }

      // Submit score if user is logged in
      if (user.value && response.finalScore && response.finalScore > 0) {
        try {
          await apiRequest('/api/game/submit', {
            method: 'POST',
            body: {
              mode: 'HIGHER_LOWER',
              score: response.finalScore,
              data: {},
            },
          })
        } catch (submitErr) {
          console.error('Failed to submit score:', submitErr)
        }
      }
    } else {
      // Show feedback for correct answer
      wasCorrect.value = true
      revealedCountry.value = response.currentCountry ?? null
      showFeedback.value = true
      answering.value = false

      // Wait 2 seconds before showing next question
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Continue game
      showFeedback.value = false
      currentCountry.value = response.currentCountry ?? null
      nextCountry.value = response.nextCountry ?? null
      score.value = response.score
    }
  } catch (err: any) {
    // Check if user is banned/suspended
    if (err.data?.banned || err.data?.suspended) {
      error.value = err.data.message
      setTimeout(() => router.push('/play'), 2000)
      return
    }
    error.value = err.data?.message || 'Failed to process answer'
  } finally {
    answering.value = false
  }
}

// Play again
const playAgain = () => {
  gameState.value = null
  currentCountry.value = null
  nextCountry.value = null
  score.value = 0
  startGame()
}

// Handle quit
const handleQuit = () => {
  router.push('/play/higher-lower')
}

onMounted(() => {
  startGame()
})
</script>
