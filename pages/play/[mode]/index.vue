<template>
  <div class="max-w-4xl mx-auto">
    <!-- Back Button -->
    <NuxtLink
      to="/play"
      class="inline-flex items-center space-x-2 text-gray-400 hover:text-gray-100 mb-6"
    >
      <Icon name="mdi:arrow-left" class="w-5 h-5" />
      <span>Back to Game Modes</span>
    </NuxtLink>

    <!-- Game Mode Header -->
    <div class="card p-8 mb-8">
      <div class="flex items-center space-x-4 mb-6">
        <div
          class="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center"
        >
          <Icon :name="modeIcon" class="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-100 capitalize">{{ mode }} Quiz</h1>
          <p class="text-gray-400">{{ modeDescription }}</p>
        </div>
      </div>

      <!-- Difficulty Selection -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-100">Select Difficulty</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            v-for="diff in difficulties"
            :key="diff.value"
            @click="selectedDifficulty = diff.value"
            class="p-6 rounded-xl border-2 transition-all hover:shadow-lg"
            :class="
              selectedDifficulty === diff.value
                ? 'border-primary-500 bg-primary-900/20'
                : 'border-gray-800 hover:border-primary-300'
            "
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-lg font-bold text-gray-100">{{ diff.label }}</span>
              <Icon
                :name="diff.icon"
                class="w-6 h-6"
                :class="selectedDifficulty === diff.value ? 'text-primary-600' : 'text-gray-400'"
              />
            </div>
            <p class="text-sm text-gray-400 text-left">{{ diff.description }}</p>
          </button>
        </div>
      </div>

      <!-- Start Button -->
      <div class="mt-8 flex justify-center">
        <button @click="startGame" class="btn-primary text-lg px-12 py-4">
          <Icon name="mdi:play-circle" class="w-6 h-6 inline mr-2" />
          Start Game
        </button>
      </div>
    </div>

    <!-- Game Rules -->
    <div class="card p-6">
      <h3 class="text-lg font-bold text-gray-100 mb-4">How to Play</h3>
      <ul class="space-y-2 text-gray-400">
        <li class="flex items-start space-x-2">
          <Icon name="mdi:check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
          <span>Answer {{ questionCount }} questions correctly to earn points</span>
        </li>
        <li class="flex items-start space-x-2">
          <Icon name="mdi:check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
          <span>Each correct answer earns you points based on difficulty</span>
        </li>
        <li class="flex items-start space-x-2">
          <Icon name="mdi:check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
          <span>Beat your high score and compete on the leaderboard</span>
        </li>
        <li class="flex items-start space-x-2">
          <Icon name="mdi:check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
          <span>No time limit - take your time and think carefully!</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameMode, GameDifficulty } from '~/types'

/**
 * Game mode entry screen
 * Allows users to select difficulty before starting
 */
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()

const mode = computed(() => route.params.mode as GameMode)
const selectedDifficulty = ref<GameDifficulty>('medium')

const difficulties = [
  {
    value: 'easy' as GameDifficulty,
    label: 'Easy',
    icon: 'mdi:emoticon-happy',
    description: '10 questions, common countries',
  },
  {
    value: 'medium' as GameDifficulty,
    label: 'Medium',
    icon: 'mdi:emoticon-neutral',
    description: '15 questions, mixed difficulty',
  },
  {
    value: 'hard' as GameDifficulty,
    label: 'Hard',
    icon: 'mdi:emoticon-cool',
    description: '20 questions, challenging countries',
  },
]

const questionCount = computed(() => {
  const diff = difficulties.find((d) => d.value === selectedDifficulty.value)
  return diff?.description.split(' ')[0] || '15'
})

const modeIcon = computed(() => {
  const icons: Record<string, string> = {
    flags: 'mdi:flag',
    capitals: 'mdi:city',
    maps: 'mdi:map',
    mixed: 'mdi:shuffle-variant',
  }
  return icons[mode.value] || 'mdi:gamepad-variant'
})

const modeDescription = computed(() => {
  const descriptions: Record<string, string> = {
    flags: 'Identify countries by their flags',
    capitals: 'Match countries with their capital cities',
    maps: 'Recognize countries by their map outlines',
    mixed: 'A combination of all game modes',
  }
  return descriptions[mode.value] || 'Test your geography knowledge'
})

const startGame = () => {
  router.push({
    path: `/play/${mode.value}/game`,
    query: { difficulty: selectedDifficulty.value },
  })
}
</script>
