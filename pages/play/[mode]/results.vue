<template>
  <div class="max-w-4xl mx-auto">
    <div class="card p-8 text-center">
      <!-- Success Icon -->
      <div
        class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center animate-slide-up"
      >
        <Icon name="mdi:trophy" class="w-16 h-16 text-white" />
      </div>

      <h1 class="text-4xl font-bold text-gray-100 mb-2">Game Complete!</h1>
      <p class="text-gray-400 mb-8 capitalize">{{ mode }} Quiz - {{ difficulty }} Difficulty</p>

      <!-- Score Display -->
      <ScoreDisplay
        :score="score"
        :correct-answers="correctAnswers"
        :total-questions="totalQuestions"
        :time-taken="timeTaken"
      />

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <button @click="playAgain" class="btn-primary">
          <Icon name="mdi:refresh" class="w-5 h-5 inline mr-2" />
          Play Again
        </button>

        <NuxtLink to="/leaderboard" class="btn-secondary">
          <Icon name="mdi:trophy" class="w-5 h-5 inline mr-2" />
          View Leaderboard
        </NuxtLink>

        <NuxtLink to="/play" class="btn-secondary">
          <Icon name="mdi:arrow-left" class="w-5 h-5 inline mr-2" />
          Change Mode
        </NuxtLink>
      </div>

      <!-- Submit Score -->
      <div v-if="!scoreSubmitted" class="mt-8">
        <button
          @click="submitGameScore"
          class="text-primary-600 hover:text-primary-700 font-medium"
          :disabled="submitting"
        >
          {{ submitting ? 'Submitting...' : 'Submit Score to Leaderboard' }}
        </button>
      </div>

      <div v-else class="mt-8 text-green-600 flex items-center justify-center space-x-2">
        <Icon name="mdi:check-circle" class="w-5 h-5" />
        <span>Score submitted to leaderboard!</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameMode, GameDifficulty, ScoreSubmission } from '~/types'

/**
 * Game results screen
 * Displays score and allows score submission to leaderboard
 */
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { submitScore } = useApi()
const { emitGameEnd } = useSocket()

const mode = computed(() => route.params.mode as GameMode)
const difficulty = computed(() => (route.query.difficulty as GameDifficulty) || 'medium')
const score = computed(() => parseInt(route.query.score as string) || 0)
const correctAnswers = computed(() => parseInt(route.query.correct as string) || 0)
const totalQuestions = computed(() => parseInt(route.query.total as string) || 15)

// Mock time taken (in seconds)
const timeTaken = ref(120)

const scoreSubmitted = ref(false)
const submitting = ref(false)

const submitGameScore = async () => {
  try {
    submitting.value = true

    const submission: ScoreSubmission = {
      mode: mode.value,
      difficulty: difficulty.value,
      score: score.value,
      questions: totalQuestions.value,
      correctAnswers: correctAnswers.value,
      timeTaken: timeTaken.value,
    }

    await submitScore(submission)

    // Emit game end event via Socket.io
    emitGameEnd(submission)

    scoreSubmitted.value = true
  } catch (error) {
    console.error('Failed to submit score:', error)
  } finally {
    submitting.value = false
  }
}

const playAgain = () => {
  router.push(`/play/${mode.value}`)
}

// Auto-submit score on mount (optional)
onMounted(() => {
  // Uncomment to auto-submit:
  // submitGameScore()
})
</script>
