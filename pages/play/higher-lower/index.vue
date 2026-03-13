<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <NuxtLink
        to="/play"
        class="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors mb-4"
      >
        <Icon name="mdi:arrow-left" class="w-5 h-5" />
        <span>Back to Game Modes</span>
      </NuxtLink>

      <h1 class="text-4xl font-bold text-gray-100 mb-2">Higher or Lower</h1>
      <p class="text-gray-400">Compare country sizes and build your streak!</p>
    </div>

    <!-- Game Rules Card -->
    <div class="card p-8 mb-8">
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center"
        >
          <Icon name="mdi:chevron-triple-up" class="w-7 h-7 text-white" />
        </div>
        <h2 class="text-2xl font-bold text-gray-100">How to Play</h2>
      </div>

      <div class="space-y-6">
        <!-- Rules -->
        <div>
          <h3 class="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Icon name="mdi:information" class="w-5 h-5 text-primary-400" />
            Game Rules
          </h3>
          <ul class="space-y-2 text-gray-300">
            <li class="flex items-start gap-2">
              <Icon name="mdi:check" class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <span>You'll be shown two countries with their flags</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="mdi:check" class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <span>The first country displays its land area in km²</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="mdi:check" class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <span
                >Guess if the second country is
                <strong class="text-green-400">HIGHER</strong> (larger) or
                <strong class="text-red-400">LOWER</strong> (smaller) in area</span
              >
            </li>
            <li class="flex items-start gap-2">
              <Icon name="mdi:check" class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <span>Each correct answer adds 1 point to your score</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="mdi:check" class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <span>One wrong guess ends the game - how long can your streak go?</span>
            </li>
          </ul>
        </div>

        <!-- Scoring Info -->
        <div
          class="bg-gradient-to-br from-primary-900/20 to-primary-800/20 rounded-lg p-6 border border-primary-500/30"
        >
          <h3 class="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
            <Icon name="mdi:trophy" class="w-5 h-5" />
            Scoring
          </h3>
          <div class="space-y-2 text-gray-300">
            <p class="flex items-center gap-2">
              <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
              <span><strong class="text-white">+1 point</strong> for each correct guess</span>
            </p>
            <p class="flex items-center gap-2">
              <Icon name="mdi:fire" class="w-4 h-4 text-orange-400" />
              <span>Build the longest streak possible!</span>
            </p>
            <p class="flex items-center gap-2">
              <Icon name="mdi:account-check" class="w-4 h-4 text-primary-400" />
              <span>Login to save your high score to the leaderboard</span>
            </p>
          </div>
        </div>

        <!-- Tips -->
        <div>
          <h3 class="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Icon name="mdi:lightbulb" class="w-5 h-5 text-yellow-400" />
            Pro Tips
          </h3>
          <ul class="space-y-2 text-gray-300">
            <li class="flex items-start gap-2">
              <Icon
                name="mdi:information-outline"
                class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
              />
              <span>Remember that Russia is the world's largest country by land area</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon
                name="mdi:information-outline"
                class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
              />
              <span>Island nations are typically smaller than continental countries</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon
                name="mdi:information-outline"
                class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
              />
              <span>Australia is both a country and a continent, making it very large</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon
                name="mdi:information-outline"
                class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
              />
              <span
                >European countries tend to be smaller than North/South American or African
                countries</span
              >
            </li>
          </ul>
        </div>
      </div>

      <!-- Start Button -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/play/higher-lower/game"
          class="btn-primary btn-lg inline-flex items-center gap-2"
        >
          <Icon name="mdi:play" class="w-6 h-6" />
          <span>Start Game</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Examples Card -->
    <div class="card p-8">
      <h2 class="text-xl font-bold text-gray-100 mb-6">Example Comparison</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <div
            class="aspect-[3/2] bg-gray-800 rounded-lg overflow-hidden border-2 border-primary-500"
          >
            <div class="w-full h-full flex items-center justify-center text-gray-400">
              <Icon name="mdi:flag" class="w-16 h-16" />
            </div>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold text-gray-200">Country A</p>
            <p class="text-2xl font-bold text-primary-400">17,098,242 km²</p>
            <p class="text-sm text-gray-400 mt-1">Area is shown</p>
          </div>
        </div>

        <div class="space-y-3">
          <div class="aspect-[3/2] bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
            <div class="w-full h-full flex items-center justify-center text-gray-400">
              <Icon name="mdi:flag" class="w-16 h-16" />
            </div>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold text-gray-200">Country B</p>
            <p class="text-xl font-bold text-gray-400">??? km²</p>
            <p class="text-sm text-gray-400 mt-1">You must guess!</p>
            <div class="flex gap-3 justify-center mt-4">
              <button
                class="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-white transition-colors"
              >
                <Icon name="mdi:chevron-up" class="w-5 h-5 inline mr-1" />
                Higher
              </button>
              <button
                class="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold text-white transition-colors"
              >
                <Icon name="mdi:chevron-down" class="w-5 h-5 inline mr-1" />
                Lower
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Higher/Lower - Game Rules Page
 * Shows how to play and example comparisons
 */
definePageMeta({
  layout: 'default',
  middleware: 'can-play',
})
</script>
