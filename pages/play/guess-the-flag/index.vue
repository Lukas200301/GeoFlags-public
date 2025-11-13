<template>
  <div class="max-w-4xl mx-auto">
    <div class="card p-8 md:p-12">
      <!-- Header -->
      <div class="text-center mb-8" v-motion :initial="{ opacity: 0, y: -20 }" :visible="{ opacity: 1, y: 0 }">
        <Icon name="mdi:flag" class="w-20 h-20 text-sky-500 mx-auto mb-4" />
        <h1 class="text-4xl md:text-5xl font-bold text-gray-100 mb-3">Guess the Flag</h1>
        <p class="text-xl text-gray-400">Infinite Mode</p>
      </div>

      <!-- Game Rules -->
      <div
        class="space-y-6 mb-8"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0, transition: { delay: 100 } }"
      >
        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 class="text-2xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Icon name="mdi:information" class="w-6 h-6 text-sky-500" />
            How to Play
          </h2>
          <ul class="space-y-3 text-gray-300">
            <li class="flex items-start gap-3">
              <Icon name="mdi:flag-variant" class="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
              <span>A flag will be displayed on your screen</span>
            </li>
            <li class="flex items-start gap-3">
              <Icon name="mdi:format-list-numbered" class="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
              <span>Choose the correct country name from four options</span>
            </li>
            <li class="flex items-start gap-3">
              <Icon name="mdi:infinity" class="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
              <span>The game continues infinitely until you guess wrong</span>
            </li>
            <li class="flex items-start gap-3">
              <Icon name="mdi:refresh" class="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
              <span>Flags won't repeat until all have been shown once</span>
            </li>
            <li class="flex items-start gap-3">
              <Icon name="mdi:trophy" class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>Your final score is the number of correct guesses in a row</span>
            </li>
          </ul>
        </div>

        <!-- Tips -->
        <div class="bg-sky-500/10 rounded-xl p-6 border border-sky-500/30">
          <h3 class="text-lg font-semibold text-sky-400 mb-3 flex items-center gap-2">
            <Icon name="mdi:lightbulb" class="w-5 h-5" />
            Pro Tips
          </h3>
          <ul class="space-y-2 text-gray-300 text-sm">
            <li class="flex items-start gap-2">
              <span class="text-sky-500">•</span>
              <span>Pay attention to flag colors, patterns, and symbols</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-sky-500">•</span>
              <span>Take your time - there's no time limit!</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-sky-500">•</span>
              <span>Learn as you go - wrong answers help you remember</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Start Button -->
      <div
        class="text-center"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :visible="{ opacity: 1, scale: 1, transition: { delay: 200 } }"
      >
        <button
          @click="handleStartGame"
          :disabled="loading"
          class="btn-primary btn-lg px-12 py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="loading" name="mdi:loading" class="w-6 h-6 animate-spin" />
          <Icon v-else name="mdi:play" class="w-6 h-6" />
          <span>{{ loading ? 'Loading...' : 'Start Game' }}</span>
        </button>

        <!-- Error message -->
        <div v-if="error" class="mt-4 text-red-400 text-sm">
          {{ error }}
        </div>
      </div>

      <!-- Back Button -->
      <div class="mt-8 text-center">
        <NuxtLink to="/play" class="text-gray-400 hover:text-gray-300 transition-colors inline-flex items-center gap-2">
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          <span>Back to Game Modes</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Guess the Flag - Start Screen
 * Shows game rules and start button
 */
definePageMeta({
  layout: 'default',
  middleware: 'can-play',
})

const router = useRouter()
const { startGame } = useGuessTheFlag()

const loading = ref(false)
const error = ref<string | null>(null)

/**
 * Handle start game button click
 */
const handleStartGame = async () => {
  try {
    loading.value = true
    error.value = null

    await startGame()

    // Navigate to game screen
    router.push('/play/guess-the-flag/game')
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to start game. Please try again.'
    console.error('Start game error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.btn-lg {
  @apply inline-flex items-center gap-3 font-semibold rounded-xl transition-all duration-200;
  @apply hover:scale-105 active:scale-95;
}
</style>
