<template>
  <div class="max-w-7xl mx-auto">
    <button @click="$router.back()" class="mb-6 flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
      <Icon name="mdi:arrow-left" class="w-5 h-5" />
      <span>Back</span>
    </button>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-gray-400">Loading profile...</p>
      </div>
    </div>

    <div v-else-if="error" class="glass-card p-12 text-center">
      <Icon name="mdi:alert-circle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-gray-100 mb-2">User Not Found</h2>
      <p class="text-gray-400">{{ error }}</p>
    </div>

    <div v-else-if="publicProfile" class="space-y-6">
      <div class="glass-card p-8">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div class="relative">
            <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl overflow-hidden">
              <img v-if="publicProfile?.avatarUrl" :src="getAvatarUrl(publicProfile.avatarUrl)" alt="Avatar" class="w-full h-full object-cover">
              <span v-else>{{ publicProfile?.username.charAt(0).toUpperCase() }}</span>
            </div>
          </div>

          <div class="flex-1 text-center md:text-left">
            <h2 class="text-3xl font-bold text-gray-100 mb-2">{{ publicProfile?.username }}</h2>
            
            <div class="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
              <div class="flex items-center gap-2 text-sm">
                <Icon name="mdi:calendar" class="w-4 h-4 text-green-400" />
                <span class="text-gray-300">Joined {{ formatDate(publicProfile?.createdAt || '') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Icon name="mdi:gamepad-variant" class="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-100">{{ publicProfile?.stats.totalGames || 0 }}</p>
              <p class="text-sm text-gray-400">Games Played</p>
            </div>
          </div>
        </div>

        <div class="glass-card p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Icon name="mdi:star" class="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-100">{{ (publicProfile?.stats.totalScore || 0).toLocaleString() }}</p>
              <p class="text-sm text-gray-400">Total Score</p>
            </div>
          </div>
        </div>

        <div class="glass-card p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Icon name="mdi:chart-line" class="w-7 h-7 text-green-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-100">{{ publicProfile?.stats.averageScore || 0 }}</p>
              <p class="text-sm text-gray-400">Average Score</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="Object.keys(publicProfile?.stats.highScores || {}).length > 0" class="glass-card p-8">
        <h3 class="text-2xl font-bold text-gray-100 mb-6">High Scores by Mode</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(score, mode) in publicProfile?.stats.highScores" :key="mode" class="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon :name="getGameModeIcon(mode)" class="w-6 h-6 text-primary-400" />
              <span class="text-gray-300 font-medium">{{ formatModeName(mode) }}</span>
            </div>
            <span class="text-2xl font-bold text-primary-400">{{ score }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div v-if="publicProfile?.stats.totalGames && publicProfile.stats.totalGames > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Games Distribution Chart -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-semibold gradient-text mb-4">Games by Mode</h3>
          <div v-if="Object.keys(publicProfile?.stats.gamesPerMode || {}).length > 0" class="h-64 flex items-center justify-center">
            <DoughnutChart
              :labels="gamesDistributionLabels"
              :data="gamesDistributionData"
            />
          </div>
          <div v-else class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <Icon name="mdi:chart-donut" class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No games distribution data available</p>
            </div>
          </div>
        </div>

        <!-- Average Scores by Mode Chart -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-semibold gradient-text mb-4">Average Score by Mode</h3>
          <div v-if="publicProfile?.stats.averageScoresByMode && Object.keys(publicProfile.stats.averageScoresByMode).length > 0" class="h-64">
            <BarChart
              :labels="averageScoresModeLabels"
              :datasets="averageScoresDatasets"
              y-axis-label="Average Score"
            />
          </div>
          <div v-else class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <Icon name="mdi:chart-bar" class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No average scores data available</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="glass-card p-8">
        <h3 class="text-2xl font-bold text-gray-100 mb-6">Achievements</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.totalGames || 0) >= 1 ? 'glass-card-dark border-primary-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:flag" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.totalGames || 0) >= 1 ? 'text-primary-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">First Steps</p>
            <p class="text-xs text-gray-400 mt-1">Play first game</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.totalGames || 0) >= 10 ? 'glass-card-dark border-secondary-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:trophy" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.totalGames || 0) >= 10 ? 'text-secondary-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Getting Started</p>
            <p class="text-xs text-gray-400 mt-1">Play 10 games</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.totalGames || 0) >= 50 ? 'glass-card-dark border-green-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:medal" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.totalGames || 0) >= 50 ? 'text-green-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Dedicated Player</p>
            <p class="text-xs text-gray-400 mt-1">Play 50 games</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.totalGames || 0) >= 100 ? 'glass-card-dark border-purple-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:crown" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.totalGames || 0) >= 100 ? 'text-purple-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Centurion</p>
            <p class="text-xs text-gray-400 mt-1">Play 100 games</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.totalGames || 0) >= 500 ? 'glass-card-dark border-amber-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:fire" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.totalGames || 0) >= 500 ? 'text-amber-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Legend</p>
            <p class="text-xs text-gray-400 mt-1">Play 500 games</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.averageScore || 0) >= 80 ? 'glass-card-dark border-yellow-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:star" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.averageScore || 0) >= 80 ? 'text-yellow-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Expert</p>
            <p class="text-xs text-gray-400 mt-1">80+ average score</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.averageScore || 0) >= 95 ? 'glass-card-dark border-pink-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:diamond" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.averageScore || 0) >= 95 ? 'text-pink-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Perfectionist</p>
            <p class="text-xs text-gray-400 mt-1">95+ average score</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.totalScore || 0) >= 100 ? 'glass-card-dark border-blue-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:counter" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.totalScore || 0) >= 100 ? 'text-blue-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Century Scorer</p>
            <p class="text-xs text-gray-400 mt-1">100+ total score</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.totalScore || 0) >= 500 ? 'glass-card-dark border-cyan-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:chart-line" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.totalScore || 0) >= 500 ? 'text-cyan-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">High Roller</p>
            <p class="text-xs text-gray-400 mt-1">500+ total score</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.totalScore || 0) >= 1000 ? 'glass-card-dark border-orange-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:rocket" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.totalScore || 0) >= 1000 ? 'text-orange-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Score Master</p>
            <p class="text-xs text-gray-400 mt-1">1000+ total score</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', publicProfile?.stats.gamesPerMode && Object.keys(publicProfile?.stats.gamesPerMode).length >= 3 ? 'glass-card-dark border-emerald-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:gamepad-variant" class="w-12 h-12 mx-auto mb-2" :class="publicProfile?.stats.gamesPerMode && Object.keys(publicProfile?.stats.gamesPerMode).length >= 3 ? 'text-emerald-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Explorer</p>
            <p class="text-xs text-gray-400 mt-1">Play all game modes</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.gamesPerMode?.GUESS_FLAG || 0) >= 25 ? 'glass-card-dark border-red-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:flag-checkered" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.gamesPerMode?.GUESS_FLAG || 0) >= 25 ? 'text-red-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Flag Expert</p>
            <p class="text-xs text-gray-400 mt-1">25+ Guess the Flag games</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.gamesPerMode?.TIME_TRIAL || 0) >= 25 ? 'glass-card-dark border-indigo-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:timer-sand" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.gamesPerMode?.TIME_TRIAL || 0) >= 25 ? 'text-indigo-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Speed Demon</p>
            <p class="text-xs text-gray-400 mt-1">25+ Time Trial games</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.gamesPerMode?.FIND_CAPITAL || 0) >= 25 ? 'glass-card-dark border-teal-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:map-marker" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.gamesPerMode?.FIND_CAPITAL || 0) >= 25 ? 'text-teal-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Geography Master</p>
            <p class="text-xs text-gray-400 mt-1">25+ Find Capital games</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', (publicProfile?.stats.highScores?.GUESS_FLAG || 0) >= 50 ? 'glass-card-dark border-rose-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:flag-variant" class="w-12 h-12 mx-auto mb-2" :class="(publicProfile?.stats.highScores?.GUESS_FLAG || 0) >= 50 ? 'text-rose-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Flag Virtuoso</p>
            <p class="text-xs text-gray-400 mt-1">Score 50+ in Guess the Flag</p>
          </div>

          <div :class="['text-center p-4 rounded-xl border transition-all', publicProfile?.stats.gamesPerMode && Object.keys(publicProfile?.stats.gamesPerMode).length >= 3 && Object.values(publicProfile?.stats.gamesPerMode).every((count: number) => count >= 10) ? 'glass-card-dark border-fuchsia-500/50' : 'glass-card-dark opacity-50']">
            <Icon name="mdi:cards-diamond" class="w-12 h-12 mx-auto mb-2" :class="publicProfile?.stats.gamesPerMode && Object.keys(publicProfile?.stats.gamesPerMode).length >= 3 && Object.values(publicProfile?.stats.gamesPerMode).every((count: number) => count >= 10) ? 'text-fuchsia-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">All-Rounder</p>
            <p class="text-xs text-gray-400 mt-1">10+ games in each mode</p>
          </div>
        </div>
      </div>

      <div v-if="publicProfile?.gameHistory && publicProfile.gameHistory.length > 0" class="glass-card p-8">
        <h3 class="text-2xl font-bold text-gray-100 mb-6">Recent Games</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-700">
              <tr>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-400">Date</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-400">Mode</th>
                <th class="text-center py-3 px-4 text-sm font-semibold text-gray-400">Score</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-for="game in paginatedHistory" :key="game.id" class="hover:bg-gray-800/30">
                <td class="py-3 px-4 text-sm text-gray-300">{{ formatDate(game.createdAt) }}</td>
                <td class="py-3 px-4">
                  <span class="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">
                    <Icon :name="getGameModeIcon(game.mode)" class="w-4 h-4" />
                    {{ formatModeName(game.mode) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center text-lg font-bold text-gray-100">{{ game.score }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="mdi:chevron-left" class="w-5 h-5" />
            </button>

            <template v-for="page in visiblePages" :key="page">
              <button
                @click="currentPage = page"
                :class="[
                  'px-3 py-1 rounded-lg transition-colors',
                  currentPage === page
                    ? 'bg-primary-600 text-white font-bold'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                ]"
              >
                {{ page }}
              </button>
            </template>

            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="mdi:chevron-right" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="glass-card p-12 text-center">
        <Icon name="mdi:gamepad-variant-outline" class="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p class="text-gray-400">This user hasn't played any games yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DoughnutChart from '~/components/charts/DoughnutChart.vue'
import BarChart from '~/components/charts/BarChart.vue'

interface PublicUserProfile {
  username: string
  avatarUrl: string | null
  createdAt: string
  stats: {
    totalGames: number
    totalScore: number
    averageScore: number
    highScores: Record<string, number>
    gamesPerMode: Record<string, number>
    averageScoresByMode?: Record<string, number>
  }
  gameHistory: Array<{
    id: string
    mode: string
    score: number
    timeSpent: number
    accuracy: number
    createdAt: string
  }>
}

const route = useRoute()
const userId = route.params.id as string
const publicProfile = ref<PublicUserProfile | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const { apiRequest } = useApi()
const currentPage = ref(1)
const itemsPerPage = 50

// Computed properties for pagination
const totalPages = computed(() => {
  if (!publicProfile.value?.gameHistory) return 0
  return Math.ceil(publicProfile.value.gameHistory.length / itemsPerPage)
})

const paginatedHistory = computed(() => {
  if (!publicProfile.value?.gameHistory) return []
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return publicProfile.value.gameHistory.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const fetchPublicProfile = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await apiRequest<PublicUserProfile>(`/api/users/${userId}`, { method: 'GET', requiresAuth: false })
    publicProfile.value = data
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load user profile'
  } finally {
    loading.value = false
  }
}

const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  if (!avatarUrl) return ''
  if (avatarUrl.startsWith('http')) return avatarUrl
  const config = useRuntimeConfig()
  return `${config.public.apiBase}${avatarUrl}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatModeName = (mode: string) => {
  const modeNames: Record<string, string> = {
    'GUESS_FLAG': 'Guess the Flag',
    'TIME_TRIAL': 'Time Trial',
    'FIND_CAPITAL': 'Find the Capital',
    'HIGHER_LOWER': 'Higher/Lower',
    'FLAGS': 'Flags',
    'CAPITALS': 'Capitals',
    'MAPS': 'Maps'
  }
  return modeNames[mode] || mode
}
const getGameModeIcon = (mode: string) => {
  const icons: Record<string, string> = {
    'GUESS_FLAG': 'mdi:flag',
    'TIME_TRIAL': 'mdi:timer',
    'FIND_CAPITAL': 'mdi:map-marker',
    'HIGHER_LOWER': 'mdi:chevron-triple-up',
    'FLAGS': 'mdi:flag',
    'CAPITALS': 'mdi:city',
    'MAPS': 'mdi:map'
  }
  return icons[mode] || 'mdi:gamepad-variant'
}

// Chart data computed properties
const gamesDistributionLabels = computed(() => {
  if (!publicProfile.value?.stats.gamesPerMode) return []
  return Object.keys(publicProfile.value.stats.gamesPerMode).map(mode => formatModeName(mode))
})

const gamesDistributionData = computed(() => {
  if (!publicProfile.value?.stats.gamesPerMode) return []
  return Object.values(publicProfile.value.stats.gamesPerMode)
})

const averageScoresModeLabels = computed(() => {
  if (!publicProfile.value?.stats.averageScoresByMode) return []
  return Object.keys(publicProfile.value.stats.averageScoresByMode).map(mode => formatModeName(mode))
})

const averageScoresDatasets = computed(() => {
  if (!publicProfile.value?.stats.averageScoresByMode) return []
  return [
    {
      label: 'Average Score',
      data: Object.values(publicProfile.value.stats.averageScoresByMode),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderColor: [
        'rgb(99, 102, 241)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)',
        'rgb(34, 197, 94)',
      ],
      borderWidth: 2,
    },
  ]
})

onMounted(() => {
  fetchPublicProfile()
})
</script>
