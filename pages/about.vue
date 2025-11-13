<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-100 mb-2">About GeoFlags</h1>
      <p class="text-gray-400">Learn more about our geography quiz game</p>
    </div>

    <!-- About Content -->
    <div class="card p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-100 mb-4">What is GeoFlags?</h2>
      <p class="text-gray-300 mb-4">
        GeoFlags is an interactive geography quiz game designed to help you test and improve your
        knowledge of world geography. Whether you're a geography enthusiast or just looking to
        learn more about the world, GeoFlags offers an engaging way to discover countries, flags,
        and capitals.
      </p>
      <p class="text-gray-300">
        Challenge yourself across multiple game modes, compete with players worldwide on the global
        leaderboard, and track your progress as you master geography from around the globe.
      </p>
    </div>

    <!-- Features -->
    <div class="card p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-100 mb-6">Features</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="feature in features" :key="feature.title" class="flex space-x-4">
          <div
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0"
          >
            <Icon :name="feature.icon" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="font-bold text-gray-100 mb-1">{{ feature.title }}</h3>
            <p class="text-sm text-gray-400">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Modes -->
    <div class="card p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-100 mb-6">Game Modes</h2>
      <div class="space-y-4">
        <div v-for="mode in gameModes" :key="mode.name" class="border-l-4 border-primary-500 pl-4">
          <h3 class="font-bold text-gray-100 mb-1">{{ mode.name }}</h3>
          <p class="text-gray-400">{{ mode.description }}</p>
        </div>
      </div>
    </div>

    <!-- Technology Stack -->
    <div class="card p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-100 mb-6">Built With</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="tech in technologies" :key="tech.name" class="text-center">
          <div class="w-16 h-16 mx-auto mb-2 bg-gray-800 rounded-lg flex items-center justify-center">
            <Icon :name="tech.icon" class="w-10 h-10 text-primary-600" />
          </div>
          <p class="text-sm font-medium text-gray-300">{{ tech.name }}</p>
        </div>
      </div>
    </div>

    <!-- Legal Links -->
    <div class="glass-card-dark p-6 border-t border-gray-700">
      <h2 class="text-xl font-semibold text-gray-100 mb-4">Legal Information</h2>
      <div class="flex flex-wrap gap-4">
        <NuxtLink
          to="/legal/terms"
          class="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
        >
          <Icon name="mdi:file-document" class="w-5 h-5" />
          <span>Terms of Service</span>
        </NuxtLink>
        <span class="text-gray-600">•</span>
        <NuxtLink
          to="/legal/privacy"
          class="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
        >
          <Icon name="mdi:shield-lock" class="w-5 h-5" />
          <span>Privacy Policy</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * About page
 * Information about the application
 */
const features = [
  {
    title: 'Multiple Game Modes',
    description: 'Choose from flags, capitals, maps, or mixed quiz modes',
    icon: 'mdi:gamepad-variant',
  },
  {
    title: 'Difficulty Levels',
    description: 'Easy, medium, and hard difficulties for all skill levels',
    icon: 'mdi:speedometer',
  },
  {
    title: 'Global Leaderboard',
    description: 'Compete with players worldwide and track your ranking',
    icon: 'mdi:trophy',
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your scores and improvement over time',
    icon: 'mdi:chart-line',
  },
  {
    title: 'Real-time Updates',
    description: 'Live leaderboard updates using WebSocket technology',
    icon: 'mdi:lightning-bolt',
  },
  {
    title: 'Responsive Design',
    description: 'Play on any device - desktop, tablet, or mobile',
    icon: 'mdi:devices',
  },
]

const gameModes = [
  {
    name: 'Flags Quiz',
    description: 'Test your knowledge of world flags by identifying countries from their flags',
  },
  {
    name: 'Capitals Quiz',
    description: 'Match countries with their capital cities in this challenging mode',
  },
  {
    name: 'Maps Quiz',
    description: 'Recognize countries by their map outlines and geographical shapes',
  },
  {
    name: 'Mixed Mode',
    description: 'A combination of all quiz types for the ultimate geography challenge',
  },
]

const technologies = [
  { name: 'Nuxt 4', icon: 'mdi:nuxt' },
  { name: 'TypeScript', icon: 'mdi:language-typescript' },
  { name: 'TailwindCSS', icon: 'mdi:tailwind' },
  { name: 'Socket.io', icon: 'mdi:connection' },
]
</script>
