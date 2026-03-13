<template>
  <div class="max-w-4xl mx-auto">
    <!-- Game Header -->
    <GameHeader
      :mode="mode"
      :difficulty="difficulty"
      :current-question="currentQuestion"
      :total-questions="totalQuestions"
      :score="score"
    />

    <!-- Game Content -->
    <div class="card p-8 my-8">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-100 mb-8">This is a gameplay placeholder</h2>

        <div class="bg-gray-800 rounded-xl p-12 mb-8">
          <Icon name="mdi:flag-variant" class="w-32 h-32 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-400">Game interface will be implemented here</p>
        </div>

        <!-- Mock Answer Buttons -->
        <div class="grid grid-cols-2 gap-4 mb-8">
          <button
            v-for="i in 4"
            :key="i"
            class="p-4 rounded-lg border-2 border-gray-800 hover:border-primary-500 hover:bg-primary-900/20 transition-all"
          >
            Answer Option {{ i }}
          </button>
        </div>

        <!-- Progress -->
        <div class="flex justify-between items-center text-sm text-gray-400 mb-4">
          <span>Question {{ currentQuestion }} of {{ totalQuestions }}</span>
          <span>Score: {{ score }}</span>
        </div>

        <div class="w-full bg-gray-700 rounded-full h-2">
          <div
            class="bg-primary-600 h-2 rounded-full transition-all"
            :style="{ width: `${(currentQuestion / totalQuestions) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between">
      <button @click="goBack" class="btn-secondary">
        <Icon name="mdi:arrow-left" class="w-5 h-5 inline mr-2" />
        Exit Game
      </button>

      <button @click="finishGame" class="btn-primary">
        Finish Game
        <Icon name="mdi:check" class="w-5 h-5 inline ml-2" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameMode, GameDifficulty } from '~/types'

/**
 * Game play screen (placeholder)
 * TODO: Implement actual game logic with questions and scoring
 */
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { emitGameStart } = useSocket()

const mode = computed(() => route.params.mode as GameMode)
const difficulty = computed(() => (route.query.difficulty as GameDifficulty) || 'medium')

// Mock game state
const currentQuestion = ref(1)
const totalQuestions = ref(15)
const score = ref(0)

const goBack = () => {
  router.push(`/play/${mode.value}`)
}

const finishGame = () => {
  router.push({
    path: `/play/${mode.value}/results`,
    query: {
      difficulty: difficulty.value,
      score: score.value.toString(),
      correct: currentQuestion.value.toString(),
      total: totalQuestions.value.toString(),
    },
  })
}

// Emit game start event
onMounted(() => {
  emitGameStart(mode.value, difficulty.value)
})
</script>
