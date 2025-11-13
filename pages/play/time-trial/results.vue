<template>
  <div class="max-w-4xl mx-auto">
    <div class="card p-8 md:p-12">
      <!-- Game Over Header -->
      <div class="text-center mb-8">
        <Icon
          name="mdi:timer-off"
          class="w-24 h-24 mx-auto mb-4"
          :class="score >= 30 ? 'text-amber-500' : score >= 15 ? 'text-sky-500' : 'text-gray-500'"
        />
        <h1 class="text-4xl md:text-5xl font-bold text-gray-100 mb-2">Time's Up!</h1>
        <p class="text-gray-400">You guessed {{ score }} flag{{ score !== 1 ? 's' : '' }} in 60 seconds</p>
      </div>

      <!-- Score Display -->
      <div
        class="bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl p-8 mb-8 border-2"
        :class="score >= 30 ? 'border-amber-500' : score >= 15 ? 'border-primary-500' : 'border-gray-600'"
      >
        <div class="text-center">
          <p class="text-gray-400 text-lg mb-2">Final Score</p>
          <p class="text-6xl md:text-7xl font-bold text-gray-100 mb-4">{{ score }}</p>
          <p class="text-gray-300">
            {{ getScoreMessage(score) }}
          </p>
        </div>
      </div>

      <!-- Submitted Confirmation -->
      <div
        v-if="submitted"
        class="text-center mb-6"
      >
        <div class="bg-green-500/20 border border-green-500/50 rounded-xl p-6">
          <Icon name="mdi:check-circle" class="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p class="text-green-400 text-lg font-semibold mb-2">Score Submitted to Leaderboard!</p>
          <p v-if="userRank" class="text-gray-300">
            You ranked <span class="text-primary-400 font-bold">#{{ userRank }}</span> on the leaderboard
          </p>
        </div>
      </div>

      <!-- Submitting State -->
      <div
        v-else-if="submitting"
        class="text-center mb-6"
      >
        <div class="flex items-center justify-center gap-3 text-gray-300">
          <Icon name="mdi:loading" class="w-6 h-6 animate-spin" />
          <span>Submitting to leaderboard...</span>
        </div>
        <p v-if="submitError" class="text-red-400 text-sm mt-4">
          {{ submitError }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button @click="handlePlayAgain" class="btn-primary px-6 py-3">
          <Icon name="mdi:refresh" class="w-5 h-5" />
          <span>Play Again</span>
        </button>

        <NuxtLink to="/leaderboard?mode=TIME_TRIAL" class="btn-secondary px-6 py-3">
          <Icon name="mdi:trophy" class="w-5 h-5" />
          <span>View Leaderboard</span>
        </NuxtLink>

        <NuxtLink to="/play" class="btn-secondary px-6 py-3">
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          <span>Game Modes</span>
        </NuxtLink>
      </div>

      <!-- Stats -->
      <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-gray-800/50 rounded-lg p-4 text-center">
          <Icon name="mdi:timer" class="w-8 h-8 text-primary-400 mx-auto mb-2" />
          <p class="text-gray-400 text-sm">Time</p>
          <p class="text-lg font-bold text-gray-100">60 seconds</p>
        </div>

        <div class="bg-gray-800/50 rounded-lg p-4 text-center">
          <Icon name="mdi:speedometer" class="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p class="text-gray-400 text-sm">Speed</p>
          <p class="text-lg font-bold text-gray-100">{{ averageTime }}s per flag</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Time Trial Results Screen
 * Shows final score and auto-submits to leaderboard
 */
definePageMeta({
  layout: 'default',
})

const router = useRouter()
const route = useRoute()
const { apiRequest } = useApi()
const toast = useToast()
const { socket } = useSocket()

const score = ref(parseInt(route.query.score as string) || 0)
const timeElapsed = ref(parseInt(route.query.timeElapsed as string) || 60)
const submitting = ref(false)
const submitted = ref(false)
const submitError = ref<string | null>(null)
const userRank = ref<number | null>(null)

// Calculate average time per flag
const averageTime = computed(() => {
  if (score.value === 0) return '0'
  return (timeElapsed.value / score.value).toFixed(1)
})

/**
 * Get score message based on performance
 */
const getScoreMessage = (finalScore: number): string => {
  if (finalScore >= 40) return 'Legendary! Lightning fast reflexes!'
  if (finalScore >= 30) return 'Excellent! You are a speed demon!'
  if (finalScore >= 20) return 'Great job! Very impressive!'
  if (finalScore >= 15) return 'Good performance! Keep it up!'
  if (finalScore >= 10) return 'Nice try! Practice makes perfect!'
  return 'Keep learning! Every attempt counts!'
}

/**
 * Handle score submission
 */
const handleSubmitScore = async () => {
  try {
    submitting.value = true
    submitError.value = null

    const response = await apiRequest<{ success: boolean; rank?: number }>(
      '/api/game/submit',
      {
        method: 'POST',
        body: {
          mode: 'TIME_TRIAL',
          score: score.value,
          data: {
            timeElapsed: timeElapsed.value,
            averageTime: parseFloat(averageTime.value),
          },
        },
      }
    )

    submitted.value = true
    userRank.value = response.rank || null

    // Emit socket event for real-time leaderboard update
    if (socket.value) {
      socket.value.emit('score:submit', {
        mode: 'TIME_TRIAL',
        score: score.value,
      })
    }

    toast.success('Score submitted successfully!')
  } catch (error: any) {
    const errorMessage = error.data?.message || 'Failed to submit score. Please try again.'
    submitError.value = errorMessage
    console.error('Submit score error:', error)
    toast.error(errorMessage)
  } finally {
    submitting.value = false
  }
}

/**
 * Handle play again
 */
const handlePlayAgain = () => {
  router.push('/play/time-trial/game')
}

// Auto-submit score and redirect if no score
onMounted(() => {
  if (score.value === 0) {
    router.push('/play/time-trial/game')
  } else {
    // Auto-submit score to leaderboard
    handleSubmitScore()
  }
})
</script>
