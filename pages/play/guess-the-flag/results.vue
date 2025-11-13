<template>
  <div class="max-w-4xl mx-auto">
    <div class="card p-8 md:p-12">
      <!-- Game Over Header -->
      <div class="text-center mb-8" v-motion :initial="{ opacity: 0, scale: 0.8 }" :visible="{ opacity: 1, scale: 1 }">
        <Icon
          name="mdi:flag-checkered"
          class="w-24 h-24 mx-auto mb-4"
          :class="finalScore >= 50 ? 'text-amber-500' : finalScore >= 20 ? 'text-sky-500' : 'text-gray-500'"
        />
        <h1 class="text-4xl md:text-5xl font-bold text-gray-100 mb-2">Game Over!</h1>
        <p v-if="correctAnswerName" class="text-gray-400">
          The correct answer was: <span class="text-sky-400 font-semibold">{{ correctAnswerName }}</span>
        </p>
      </div>

      <!-- Score Display -->
      <div
        class="bg-gradient-to-br from-sky-500/20 to-purple-500/20 rounded-2xl p-8 mb-8 border-2"
        :class="finalScore >= 50 ? 'border-amber-500' : finalScore >= 20 ? 'border-sky-500' : 'border-gray-600'"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0, transition: { delay: 100 } }"
      >
        <div class="text-center">
          <p class="text-gray-400 text-lg mb-2">Your Score</p>
          <p class="text-6xl md:text-7xl font-bold text-gray-100 mb-4">{{ finalScore }}</p>
          <p class="text-gray-300">
            {{ getScoreMessage(finalScore) }}
          </p>
        </div>
      </div>

      <!-- Rank Display -->
      <div
        v-if="submitted && userRank"
        class="text-center mb-6"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :visible="{ opacity: 1, scale: 1 }"
      >
        <div class="bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/50 rounded-xl p-6">
          <Icon name="mdi:trophy" class="w-12 h-12 text-sky-400 mx-auto mb-3" />
          <p class="text-gray-300 text-lg mb-1">Leaderboard Rank</p>
          <p class="text-4xl font-bold text-sky-400">#{{ userRank }}</p>
        </div>
      </div>

      <!-- Submitting State -->
      <div
        v-else-if="submitting"
        class="text-center mb-6"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0, transition: { delay: 200 } }"
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
      <div
        class="flex flex-col sm:flex-row gap-4 justify-center"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0, transition: { delay: 300 } }"
      >
        <button @click="handlePlayAgain" class="btn-primary px-6 py-3">
          <Icon name="mdi:refresh" class="w-5 h-5" />
          <span>Play Again</span>
        </button>

        <NuxtLink to="/leaderboard?mode=guess-the-flag" class="btn-secondary px-6 py-3">
          <Icon name="mdi:trophy" class="w-5 h-5" />
          <span>View Leaderboard</span>
        </NuxtLink>

        <NuxtLink to="/play" class="btn-secondary px-6 py-3">
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          <span>Game Modes</span>
        </NuxtLink>
      </div>

      <!-- Stats -->
      <div
        class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0, transition: { delay: 400 } }"
      >
        <div class="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
          <Icon name="mdi:flag" class="w-8 h-8 text-sky-500 mx-auto mb-2" />
          <p class="text-gray-400 text-sm">Flags Guessed</p>
          <p class="text-2xl font-bold text-gray-100">{{ finalScore }}</p>
        </div>

        <div class="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
          <Icon name="mdi:target" class="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p class="text-gray-400 text-sm">Accuracy</p>
          <p class="text-2xl font-bold text-gray-100">
            {{ finalScore > 0 ? '100%' : '0%' }}
          </p>
        </div>

        <div class="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
          <Icon name="mdi:star" class="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p class="text-gray-400 text-sm">Achievement</p>
          <p class="text-lg font-bold text-gray-100">{{ getAchievement(finalScore) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Guess the Flag - Results Screen
 * Shows final score and allows submission to leaderboard
 */
definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { finalScore, correctAnswerName, submitScore, resetGame } = useGuessTheFlag()
const { socket } = useSocket()

const submitting = ref(false)
const submitted = ref(false)
const submitError = ref<string | null>(null)
const userRank = ref<number | null>(null)

/**
 * Get score message based on performance
 */
const getScoreMessage = (score: number): string => {
  if (score >= 100) return 'Legendary! You are a geography master!'
  if (score >= 50) return 'Excellent! You really know your flags!'
  if (score >= 20) return 'Great job! Keep practicing!'
  if (score >= 10) return 'Good effort! You are improving!'
  if (score >= 5) return 'Nice try! Practice makes perfect!'
  return 'Keep learning! Every flag is a step forward!'
}

/**
 * Get achievement badge
 */
const getAchievement = (score: number): string => {
  if (score >= 100) return 'Legendary'
  if (score >= 50) return 'Expert'
  if (score >= 20) return 'Pro'
  if (score >= 10) return 'Intermediate'
  if (score >= 5) return 'Beginner'
  return 'Novice'
}

/**
 * Handle score submission
 */
const handleSubmitScore = async () => {
  try {
    submitting.value = true
    submitError.value = null

    const response = await submitScore(finalScore.value)

    submitted.value = true
    userRank.value = response.rank || null

    // Emit socket event for real-time leaderboard update
    if (socket.value) {
      socket.value.emit('score:submit', {
        mode: 'GUESS_FLAG',
        score: finalScore.value,
      })
    }
  } catch (error: any) {
    submitError.value = error.data?.message || 'Failed to submit score. Please try again.'
    console.error('Submit score error:', error)
  } finally {
    submitting.value = false
  }
}

/**
 * Handle play again
 */
const handlePlayAgain = () => {
  resetGame()
  router.push('/play/guess-the-flag')
}

// Auto-submit score and redirect if no final score
onMounted(() => {
  if (finalScore.value === 0 && !correctAnswerName.value) {
    router.push('/play/guess-the-flag')
  } else {
    // Auto-submit score to leaderboard
    handleSubmitScore()
  }
})
</script>

<style scoped>
.btn-lg {
  @apply inline-flex items-center gap-3 font-semibold rounded-xl transition-all duration-200;
  @apply hover:scale-105 active:scale-95;
}
</style>
