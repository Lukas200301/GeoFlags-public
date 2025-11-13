<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-100 mb-2">Statistics & Analytics</h1>
      <p class="text-gray-400">Detailed insights into GeoFlags usage and performance</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-gray-400">Loading statistics...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card bg-red-900/20 border border-red-500/50 p-6 mb-8">
      <div class="flex items-center gap-3">
        <Icon name="mdi:alert-circle" class="w-6 h-6 text-red-500" />
        <div>
          <h3 class="text-lg font-semibold text-red-400">Failed to Load Statistics</h3>
          <p class="text-red-300 text-sm">{{ error }}</p>
        </div>
      </div>
      <button @click="fetchStats" class="btn-primary mt-4">
        <Icon name="mdi:refresh" class="w-5 h-5 mr-2" />
        Retry
      </button>
    </div>

    <!-- Statistics Content -->
    <div v-else-if="stats">
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AdminCard
          title="Total Users"
          :value="formatNumber(stats.overview.totalUsers.value)"
          icon="mdi:account-group"
          icon-bg-color="bg-blue-900/30"
          icon-color="text-blue-600"
          :trend="stats.overview.totalUsers.trend"
        />

        <AdminCard
          title="Active Today"
          :value="formatNumber(stats.overview.activeToday.value)"
          icon="mdi:account-check"
          icon-bg-color="bg-green-900/30"
          icon-color="text-green-600"
          :trend="stats.overview.activeToday.trend"
        />

        <AdminCard
          title="Games Played"
          :value="formatNumber(stats.overview.gamesPlayed.value)"
          icon="mdi:gamepad-variant"
          icon-bg-color="bg-purple-900/30"
          icon-color="text-purple-600"
          :trend="stats.overview.gamesPlayed.trend"
        />

        <AdminCard
          title="Avg Session"
          :value="stats.overview.avgSession.value"
          icon="mdi:clock-outline"
          icon-bg-color="bg-orange-900/30"
          icon-color="text-orange-600"
          :trend="stats.overview.avgSession.trend"
        />
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Game Modes Distribution -->
        <div class="card p-6">
          <h2 class="text-xl font-bold text-gray-100 mb-4">Game Modes Popularity</h2>
          <div v-if="stats.gameModes && stats.gameModes.length > 0" class="space-y-3">
            <div
              v-for="mode in stats.gameModes"
              :key="mode.mode"
              class="flex items-center justify-between p-3 bg-gray-950 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <Icon :name="getGameModeIcon(mode.mode)" class="w-6 h-6 text-primary-400" />
                <span class="font-medium text-gray-100">{{ formatGameMode(mode.mode) }}</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="text-lg font-bold text-primary-400">{{ formatNumber(mode.count) }}</div>
                  <div class="text-xs text-gray-500">games</div>
                </div>
                <div class="w-32 bg-gray-800 rounded-full h-2">
                  <div
                    class="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${getPercentage(mode.count, totalGames)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="bg-gray-950 rounded-lg p-8 text-center">
            <Icon name="mdi:chart-pie" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-400">No game data available yet</p>
          </div>
        </div>

        <!-- User Activity Chart -->
        <div class="card p-6">
          <h2 class="text-xl font-bold text-gray-100 mb-4">User Activity (Last 7 Days)</h2>
          <div v-if="stats.userActivity && stats.userActivity.length > 0">
            <!-- Simple Bar Chart -->
            <div class="space-y-2 mb-4">
              <div
                v-for="day in stats.userActivity"
                :key="day.date"
                class="flex items-center gap-3"
              >
                <div class="w-16 text-xs text-gray-400">{{ formatDate(day.date) }}</div>
                <div class="flex-1">
                  <div class="flex gap-2 items-center">
                    <div class="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
                      <div
                        class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        :style="{ width: `${getPercentage(day.users, maxUsers)}%` }"
                      >
                        <span v-if="day.users > 0" class="text-xs font-medium text-white">{{ day.users }}</span>
                      </div>
                    </div>
                    <div class="w-20 text-right">
                      <span class="text-xs text-gray-400">{{ day.games }} games</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-800">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded bg-blue-500"></div>
                <span>Active Users</span>
              </div>
            </div>
          </div>
          <div v-else class="bg-gray-950 rounded-lg p-8 text-center">
            <Icon name="mdi:chart-line" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-400">No activity data available yet</p>
          </div>
        </div>
      </div>

      <!-- Top Players -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top by Score -->
        <div class="card p-6">
          <h2 class="text-xl font-bold text-gray-100 mb-4">Top Players by Score</h2>
          <div v-if="stats.topPlayers.byScore && stats.topPlayers.byScore.length > 0" class="space-y-3">
            <div
              v-for="(player, index) in stats.topPlayers.byScore"
              :key="player.id"
              class="flex items-center justify-between p-3 bg-gray-950 rounded-lg hover:bg-gray-900/50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  :class="getRankBadgeClass(index)"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <div class="font-medium text-gray-100">{{ player.username }}</div>
                  <div class="text-sm text-gray-500">{{ player.email }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-primary-600">{{ formatNumber(player.totalScore) }}</div>
                <div class="text-xs text-gray-500">Total Score</div>
              </div>
            </div>
          </div>
          <div v-else class="bg-gray-950 rounded-lg p-8 text-center">
            <Icon name="mdi:trophy" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-400">No player data available yet</p>
          </div>
        </div>

        <!-- Top by Games -->
        <div class="card p-6">
          <h2 class="text-xl font-bold text-gray-100 mb-4">Most Active Players</h2>
          <div v-if="stats.topPlayers.byGames && stats.topPlayers.byGames.length > 0" class="space-y-3">
            <div
              v-for="(player, index) in stats.topPlayers.byGames"
              :key="player.id"
              class="flex items-center justify-between p-3 bg-gray-950 rounded-lg hover:bg-gray-900/50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  :class="getRankBadgeClass(index)"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <div class="font-medium text-gray-100">{{ player.username }}</div>
                  <div class="text-sm text-gray-500">{{ player.email }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-green-600">{{ formatNumber(player.gamesPlayed) }}</div>
                <div class="text-xs text-gray-500">Games Played</div>
              </div>
            </div>
          </div>
          <div v-else class="bg-gray-950 rounded-lg p-8 text-center">
            <Icon name="mdi:gamepad-variant" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-400">No player data available yet</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Admin statistics page
 *
 * SECURITY: Protected by admin middleware
 */
definePageMeta({
  middleware: 'admin',
})

const { apiRequest } = useApi()

interface StatsData {
  overview: {
    totalUsers: {
      value: number
      trend: {
        direction: 'up' | 'down'
        value: number
        label: string
      }
    }
    activeToday: {
      value: number
      trend: {
        direction: 'up' | 'down'
        value: number
        label: string
      }
    }
    gamesPlayed: {
      value: number
      trend: {
        direction: 'up' | 'down'
        value: number
        label: string
      }
    }
    avgSession: {
      value: string
      trend: {
        direction: 'up' | 'down'
        value: number
        label: string
      }
    }
  }
  gameModes: Array<{
    mode: string
    count: number
  }>
  userActivity: Array<{
    date: string
    users: number
    games: number
  }>
  topPlayers: {
    byScore: Array<{
      id: string
      username: string
      email: string
      totalScore: number
    }>
    byGames: Array<{
      id: string
      username: string
      email: string
      gamesPlayed: number
    }>
  }
}

const stats = ref<StatsData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch statistics
const fetchStats = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await apiRequest<StatsData>('/api/admin/stats', {
      method: 'GET',
    })
    stats.value = data
  } catch (err: any) {
    console.error('Failed to fetch statistics:', err)
    error.value = err.data?.message || 'Failed to load statistics'
  } finally {
    loading.value = false
  }
}

// Computed values
const totalGames = computed(() => {
  if (!stats.value?.gameModes) return 0
  return stats.value.gameModes.reduce((sum, mode) => sum + mode.count, 0)
})

const maxUsers = computed(() => {
  if (!stats.value?.userActivity) return 1
  return Math.max(...stats.value.userActivity.map(day => day.users), 1)
})

// Format helpers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatGameMode = (mode: string): string => {
  return mode.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

const getGameModeIcon = (mode: string): string => {
  const icons: Record<string, string> = {
    GUESS_FLAG: 'mdi:flag-triangle',
    FLAGS: 'mdi:flag',
    CAPITALS: 'mdi:city',
    MAPS: 'mdi:map',
    MIXED: 'mdi:shuffle-variant',
  }
  return icons[mode] || 'mdi:gamepad-variant'
}

const getPercentage = (value: number, max: number): number => {
  if (max === 0) return 0
  return Math.min((value / max) * 100, 100)
}

const getRankBadgeClass = (index: number): string => {
  if (index === 0) return 'bg-gradient-to-br from-yellow-400 to-yellow-600'
  if (index === 1) return 'bg-gradient-to-br from-gray-300 to-gray-500'
  if (index === 2) return 'bg-gradient-to-br from-orange-400 to-orange-600'
  return 'bg-gradient-to-br from-primary-400 to-primary-600'
}

// Load stats on mount
onMounted(() => {
  fetchStats()
})
</script>
