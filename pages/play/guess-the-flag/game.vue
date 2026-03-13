<template>
  <div class="max-w-5xl mx-auto">
    <!-- Loading State -->
    <div v-if="!gameState" class="card p-12 text-center">
      <Icon name="mdi:loading" class="w-16 h-16 text-sky-500 mx-auto mb-4 animate-spin" />
      <p class="text-gray-300">Loading game...</p>
    </div>

    <!-- Game Screen -->
    <div v-else class="space-y-6">
      <!-- Score Header -->
      <div
        class="card p-6"
        v-motion
        :initial="{ opacity: 0, y: -20 }"
        :visible="{ opacity: 1, y: 0 }"
      >
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="bg-sky-500/20 rounded-xl p-3">
              <Icon name="mdi:trophy" class="w-8 h-8 text-sky-500" />
            </div>
            <div>
              <p class="text-sm text-gray-400">Current Score</p>
              <p class="text-3xl font-bold text-gray-100">{{ gameState.score }}</p>
            </div>
          </div>
          <button
            @click="showQuitDialog = true"
            class="btn-secondary px-4 py-2 text-sm"
            :disabled="loading"
          >
            <Icon name="mdi:close" class="w-5 h-5" />
            <span>Quit</span>
          </button>
        </div>
      </div>

      <!-- Flag Display -->
      <div
        class="card p-8 md:p-12"
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :visible="{ opacity: 1, scale: 1, transition: { delay: 100 } }"
      >
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold text-gray-100 mb-6">
            Which country does this flag belong to?
          </h2>

          <!-- Flag Image -->
          <div class="relative inline-block">
            <div
              class="flag-container relative overflow-hidden rounded-xl shadow-2xl border-4 border-gray-700 bg-gray-900"
              @contextmenu.prevent
              @dragstart.prevent
            >
              <img
                :src="gameState.flagImage"
                :alt="`Flag ${gameState.score + 1}`"
                class="flag-image w-full h-full object-contain select-none pointer-events-none"
                draggable="false"
                @contextmenu.prevent
              />
            </div>

            <!-- Feedback Overlay -->
            <transition name="feedback">
              <div
                v-if="showFeedback"
                class="absolute inset-0 flex items-center justify-center rounded-xl"
                :class="isCorrect ? 'bg-green-500/90' : 'bg-red-500/90'"
              >
                <Icon
                  :name="isCorrect ? 'mdi:check-circle' : 'mdi:close-circle'"
                  class="w-24 h-24 text-white animate-bounce"
                />
              </div>
            </transition>
          </div>
        </div>

        <!-- Options -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <button
            v-for="(option, index) in gameState.options"
            :key="option.id"
            @click="handleAnswer(option.id)"
            :disabled="loading || showFeedback"
            class="option-button"
            :class="{
              'option-selected': selectedAnswer === option.id,
              'option-correct': showFeedback && isCorrect && selectedAnswer === option.id,
              'option-wrong': showFeedback && !isCorrect && selectedAnswer === option.id,
            }"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :visible="{ opacity: 1, x: 0, transition: { delay: 200 + index * 50 } }"
          >
            <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
            <span class="option-text">{{ option.name }}</span>
          </button>
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
          Are you sure you want to quit? Your current score of
          <strong class="text-sky-400">{{ gameState?.score || 0 }}</strong> will be lost.
        </p>
        <div class="flex gap-4">
          <button @click="showQuitDialog = false" class="btn-secondary flex-1">
            Continue Playing
          </button>
          <button @click="confirmQuit" class="btn-primary flex-1 bg-red-600 hover:bg-red-500">
            Quit Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Guess the Flag - Game Screen
 * Main gameplay screen with flag and options
 */
definePageMeta({
  layout: 'default',
  middleware: 'can-play',
})

const router = useRouter()
const {
  gameState,
  loading,
  selectedAnswer,
  showFeedback,
  isCorrect,
  gameOver,
  submitAnswer,
  resetGame,
} = useGuessTheFlag()

const showQuitDialog = ref(false)

// Watch for game over
watch(gameOver, (isOver) => {
  if (isOver) {
    // Navigate to results page after a short delay
    setTimeout(() => {
      router.push('/play/guess-the-flag/results')
    }, 1500)
  }
})

/**
 * Handle answer selection
 */
const handleAnswer = async (answerId: string) => {
  if (loading.value || showFeedback.value) return

  try {
    await submitAnswer(answerId)
  } catch (error: any) {
    console.error('Answer submission error:', error)
    // Handle error (could show a toast)
  }
}

/**
 * Handle quit game
 */
const confirmQuit = () => {
  resetGame()
  showQuitDialog.value = false
  router.push('/play/guess-the-flag')
}

// Redirect if no active game
onMounted(() => {
  if (!gameState.value) {
    router.push('/play/guess-the-flag')
  }
})

// Prevent right-click and inspect on flag
onMounted(() => {
  const preventInspect = (e: Event) => {
    e.preventDefault()
    return false
  }

  document.addEventListener('contextmenu', preventInspect)

  onUnmounted(() => {
    document.removeEventListener('contextmenu', preventInspect)
  })
})
</script>

<style scoped>
/* Flag Container */
.flag-container {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 3/2;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.flag-image {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
}

/* Option Buttons */
.option-button {
  @apply relative flex items-center gap-4 p-4 rounded-xl border-2 border-gray-700;
  @apply bg-gray-800 hover:bg-gray-700 hover:border-sky-500;
  @apply transition-all duration-200 text-left;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.option-button:hover:not(:disabled) {
  @apply transform scale-[1.02] shadow-lg;
}

.option-button:active:not(:disabled) {
  @apply transform scale-[0.98];
}

.option-letter {
  @apply flex items-center justify-center w-10 h-10 rounded-lg;
  @apply bg-sky-500/20 text-sky-400 font-bold text-lg;
  @apply flex-shrink-0;
}

.option-text {
  @apply text-gray-100 font-medium text-lg;
}

.option-selected {
  @apply border-sky-500 bg-sky-500/10;
}

.option-correct {
  @apply border-green-500 bg-green-500/10;
}

.option-correct .option-letter {
  @apply bg-green-500/30 text-green-400;
}

.option-wrong {
  @apply border-red-500 bg-red-500/10;
}

.option-wrong .option-letter {
  @apply bg-red-500/30 text-red-400;
}

/* Feedback Animation */
.feedback-enter-active,
.feedback-leave-active {
  transition: opacity 0.3s ease;
}

.feedback-enter-from,
.feedback-leave-to {
  opacity: 0;
}

/* Prevent text selection */
::selection {
  background: transparent;
}

::-moz-selection {
  background: transparent;
}
</style>
