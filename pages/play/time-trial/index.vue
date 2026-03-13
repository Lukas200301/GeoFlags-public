<template>
  <div class="max-w-4xl mx-auto">
    <div class="card p-8 md:p-12">
      <!-- Header -->
      <div class="text-center mb-8">
        <Icon name="mdi:timer-sand" class="w-24 h-24 mx-auto mb-4 text-primary-500 animate-pulse" />
        <h1 class="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Time Trial</h1>
        <p class="text-xl text-gray-400">60 seconds. Maximum speed. How many can you get?</p>
      </div>

      <!-- Rules -->
      <div
        class="bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-2xl p-6 mb-8 border border-primary-500/20"
      >
        <h2 class="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
          <Icon name="mdi:information" class="w-6 h-6 text-primary-400" />
          How to Play
        </h2>
        <div class="space-y-3 text-gray-300">
          <div class="flex items-start gap-3">
            <Icon name="mdi:timer" class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold text-gray-100">60 Second Time Limit</p>
              <p class="text-sm text-gray-400">
                Race against the clock to identify as many flags as possible
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="mdi:check-circle" class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold text-gray-100">Correct Answer: +1 Point</p>
              <p class="text-sm text-gray-400">Each correct answer adds to your score</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="mdi:close-circle" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold text-gray-100">Wrong Answer: -5 Seconds</p>
              <p class="text-sm text-gray-400">Incorrect guesses cost you valuable time!</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="mdi:reload" class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold text-gray-100">No Repeats</p>
              <p class="text-sm text-gray-400">Flags won't repeat until you've seen them all</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="mdi:trophy" class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold text-gray-100">Auto-Submit to Leaderboard</p>
              <p class="text-sm text-gray-400">
                Your score is automatically submitted when time runs out
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div class="bg-gray-800/50 rounded-xl p-6 mb-8">
        <h3 class="text-lg font-bold text-gray-100 mb-3 flex items-center gap-2">
          <Icon name="mdi:lightbulb" class="w-5 h-5 text-amber-400" />
          Pro Tips
        </h3>
        <ul class="space-y-2 text-gray-300 text-sm">
          <li class="flex items-start gap-2">
            <Icon name="mdi:chevron-right" class="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
            <span>Speed is key - trust your first instinct!</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="mdi:chevron-right" class="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
            <span>Be careful with wrong answers - the time penalty adds up fast</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="mdi:chevron-right" class="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
            <span>Focus on the colors and patterns of each flag</span>
          </li>
        </ul>
      </div>

      <!-- Start Button -->
      <div class="text-center">
        <button @click="startGame" class="btn-primary btn-lg px-12 py-4 text-xl">
          <Icon name="mdi:play" class="w-8 h-8" />
          <span>Start Time Trial</span>
        </button>

        <!-- Back Button -->
        <div class="mt-8 text-center">
          <NuxtLink
            to="/play"
            class="text-gray-400 hover:text-gray-300 transition-colors inline-flex items-center gap-2"
          >
            <Icon name="mdi:arrow-left" class="w-5 h-5" />
            <span>Back to Game Modes</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Time Trial Mode Landing Page
 */
definePageMeta({
  layout: 'default',
  middleware: 'can-play',
})

const router = useRouter()

const startGame = () => {
  router.push('/play/time-trial/game')
}
</script>

<style scoped>
.btn-lg {
  @apply inline-flex items-center gap-3 font-semibold rounded-xl transition-all duration-200;
  @apply hover:scale-105 active:scale-95;
}
</style>
