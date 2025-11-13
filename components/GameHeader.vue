<template>
  <div class="card p-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <!-- Mode & Difficulty -->
      <div class="flex items-center space-x-4">
        <div
          class="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center"
        >
          <Icon :name="modeIcon" class="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-100 capitalize">{{ mode }} Quiz</h2>
          <p class="text-sm text-gray-400 capitalize">{{ difficulty }} Difficulty</p>
        </div>
      </div>

      <!-- Progress & Score -->
      <div class="flex items-center space-x-8">
        <div class="text-center">
          <div class="text-sm text-gray-400">Question</div>
          <div class="text-2xl font-bold text-gray-100">
            {{ currentQuestion }} / {{ totalQuestions }}
          </div>
        </div>

        <div class="text-center">
          <div class="text-sm text-gray-400">Score</div>
          <div class="text-2xl font-bold text-primary-600">{{ score }}</div>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-4 w-full bg-gray-700 rounded-full h-2">
      <div
        class="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameMode, GameDifficulty } from '~/types'

/**
 * Game header component
 * Displays game mode, difficulty, progress, and score
 */
interface Props {
  mode: GameMode
  difficulty: GameDifficulty
  currentQuestion: number
  totalQuestions: number
  score: number
}

const props = defineProps<Props>()

const progress = computed(() => {
  if (props.totalQuestions === 0) return 0
  return Math.round((props.currentQuestion / props.totalQuestions) * 100)
})

const modeIcon = computed(() => {
  const icons: Record<string, string> = {
    flags: 'mdi:flag',
    capitals: 'mdi:city',
    maps: 'mdi:map',
    mixed: 'mdi:shuffle-variant',
  }
  return icons[props.mode] || 'mdi:gamepad-variant'
})
</script>
