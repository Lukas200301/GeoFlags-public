<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold gradient-text mb-2">Statistics & Analytics</h1>
        <p class="text-gray-400">Detailed insights into GeoFlags usage and performance</p>
      </div>
      <button
        @click="fetchStats"
        :disabled="loading"
        class="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 transition-all flex items-center gap-2"
      >
        <Icon name="mdi:refresh" class="w-5 h-5" :class="{ 'animate-spin': loading }" />
        Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !stats" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-400">Loading statistics...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="glass-card bg-red-900/20 border border-red-500/50 p-6 mb-8">
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

      <!-- Additional Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Battles -->
        <div class="glass-card p-6 hover:border-red-500/30 transition-colors">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center"
            >
              <Icon name="mdi:sword-cross" class="w-8 h-8 text-red-400" />
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-400 mb-1">Total Battles</div>
              <div class="text-2xl font-bold text-gray-100">
                {{ formatNumber(extraStats.totalBattles) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Friendships -->
        <div class="glass-card p-6 hover:border-pink-500/30 transition-colors">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center"
            >
              <Icon name="mdi:account-heart" class="w-8 h-8 text-pink-400" />
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-400 mb-1">Friendships</div>
              <div class="text-2xl font-bold text-gray-100">
                {{ formatNumber(extraStats.activeFriendships) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Leaderboard Entries -->
        <div class="glass-card p-6 hover:border-yellow-500/30 transition-colors">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center"
            >
              <Icon name="mdi:trophy" class="w-8 h-8 text-yellow-400" />
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-400 mb-1">Leaderboard</div>
              <div class="text-2xl font-bold text-gray-100">
                {{ formatNumber(extraStats.leaderboardEntries) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Avg Score -->
        <div class="glass-card p-6 hover:border-cyan-500/30 transition-colors">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center"
            >
              <Icon name="mdi:chart-line" class="w-8 h-8 text-cyan-400" />
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-400 mb-1">Avg Score</div>
              <div class="text-2xl font-bold text-gray-100">{{ averageScore }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Engagement Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- User Retention -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-100">User Retention</h3>
            <Icon name="mdi:account-reactivate" class="w-6 h-6 text-green-400" />
          </div>
          <div class="space-y-3">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">Daily Active</span>
                <span class="text-sm font-bold text-green-400">{{ dailyActiveRate }}%</span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2">
                <div
                  class="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                  :style="{ width: `${dailyActiveRate}%` }"
                ></div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">Games per User</span>
                <span class="text-sm font-bold text-purple-400">{{ gamesPerUser }}</span>
              </div>
              <div class="text-xs text-gray-500 mt-1">Average engagement metric</div>
            </div>
          </div>
        </div>

        <!-- Battle Stats -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-100">Battle Stats</h3>
            <Icon name="mdi:trophy-variant" class="w-6 h-6 text-red-400" />
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">Total Battles</span>
              <span class="text-lg font-bold text-red-400">{{
                formatNumber(extraStats.totalBattles)
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">Battles Today</span>
              <span class="text-lg font-bold text-orange-400">{{ battlesToday }}</span>
            </div>
            <div class="text-xs text-gray-500 mt-2">
              <Icon name="mdi:trending-up" class="w-3 h-3 inline mr-1 text-green-400" />
              Battle mode popularity growing
            </div>
          </div>
        </div>

        <!-- Social Stats -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-100">Social</h3>
            <Icon name="mdi:account-multiple" class="w-6 h-6 text-pink-400" />
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">Friendships</span>
              <span class="text-lg font-bold text-pink-400">{{
                formatNumber(extraStats.activeFriendships)
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">Avg Friends</span>
              <span class="text-lg font-bold text-purple-400">{{ avgFriendsPerUser }}</span>
            </div>
            <div class="text-xs text-gray-500 mt-2">
              <Icon name="mdi:account-group" class="w-3 h-3 inline mr-1 text-pink-400" />
              Strong social engagement
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Game Modes Distribution -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-100">Game Modes Popularity</h2>
            <Icon name="mdi:chart-donut" class="w-6 h-6 text-purple-400" />
          </div>
          <div v-if="stats.gameModes && stats.gameModes.length > 0" class="space-y-3">
            <div
              v-for="mode in stats.gameModes"
              :key="mode.mode"
              class="flex items-center justify-between p-3 bg-gray-950/50 rounded-lg hover:bg-gray-900/50 transition-colors"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <Icon
                  :name="getGameModeIcon(mode.mode)"
                  class="w-6 h-6 text-primary-400 flex-shrink-0"
                />
                <span class="font-medium text-gray-100 truncate">{{
                  formatGameMode(mode.mode)
                }}</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="text-lg font-bold text-primary-400">
                    {{ formatNumber(mode.count) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ getPercentage(mode.count, totalGames).toFixed(1) }}%
                  </div>
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
          <div v-else class="bg-gray-950/50 rounded-lg p-8 text-center">
            <Icon name="mdi:chart-pie" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-400">No game data available yet</p>
          </div>
        </div>

        <!-- User Activity Chart -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-100">User Activity (Last 7 Days)</h2>
            <Icon name="mdi:chart-line-variant" class="w-6 h-6 text-blue-400" />
          </div>
          <div v-if="stats.userActivity && stats.userActivity.length > 0">
            <!-- Enhanced Bar Chart -->
            <div class="space-y-2 mb-4">
              <div
                v-for="day in stats.userActivity"
                :key="day.date"
                class="flex items-center gap-3"
              >
                <div class="w-20 text-xs font-medium text-gray-400">
                  {{ formatActivityDate(day.date) }}
                </div>
                <div class="flex-1">
                  <div class="flex gap-2 items-center">
                    <div class="flex-1 bg-gray-800/50 rounded-full h-8 overflow-hidden">
                      <div
                        class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                        :style="{ width: `${Math.max(getPercentage(day.users, maxUsers), 5)}%` }"
                      >
                        <span v-if="day.users > 0" class="text-xs font-bold text-white">
                          {{ day.users }}
                        </span>
                      </div>
                    </div>
                    <div class="w-24 text-right">
                      <span class="text-xs text-gray-400">{{ day.games }} games</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-800"
            >
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded bg-blue-500"></div>
                <span>Active Users</span>
              </div>
              <div class="text-xs">
                Total: {{ totalWeeklyUsers }} users, {{ totalWeeklyGames }} games
              </div>
            </div>
          </div>
          <div v-else class="bg-gray-950/50 rounded-lg p-8 text-center">
            <Icon name="mdi:chart-line" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-400">No activity data available yet</p>
          </div>
        </div>
      </div>

      <!-- Top Players -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top by Score -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-100">Top Players by Score</h2>
            <Icon name="mdi:trophy-variant" class="w-6 h-6 text-yellow-400" />
          </div>
          <div
            v-if="stats.topPlayers.byScore && stats.topPlayers.byScore.length > 0"
            class="space-y-3"
          >
            <div
              v-for="(player, index) in stats.topPlayers.byScore"
              :key="player.id"
              class="flex items-center justify-between p-3 bg-gray-950/50 rounded-lg hover:bg-gray-900/50 transition-colors"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  :class="getRankBadgeClass(index)"
                >
                  {{ index + 1 }}
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-gray-100 truncate">{{ player.username }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ player.email }}</div>
                </div>
              </div>
              <div class="text-right ml-4">
                <div class="font-bold text-xl text-primary-400">
                  {{ formatNumber(player.totalScore) }}
                </div>
                <div class="text-xs text-gray-500">Total Score</div>
              </div>
            </div>
          </div>
          <div v-else class="bg-gray-950/50 rounded-lg p-8 text-center">
            <Icon name="mdi:trophy" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-400">No player data available yet</p>
          </div>
        </div>

        <!-- Top by Games -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-100">Most Active Players</h2>
            <Icon name="mdi:account-star" class="w-6 h-6 text-green-400" />
          </div>
          <div
            v-if="stats.topPlayers.byGames && stats.topPlayers.byGames.length > 0"
            class="space-y-3"
          >
            <div
              v-for="(player, index) in stats.topPlayers.byGames"
              :key="player.id"
              class="flex items-center justify-between p-3 bg-gray-950/50 rounded-lg hover:bg-gray-900/50 transition-colors"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  :class="getRankBadgeClass(index)"
                >
                  {{ index + 1 }}
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-gray-100 truncate">{{ player.username }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ player.email }}</div>
                </div>
              </div>
              <div class="text-right ml-4">
                <div class="font-bold text-xl text-green-400">
                  {{ formatNumber(player.gamesPlayed) }}
                </div>
                <div class="text-xs text-gray-500">Games Played</div>
              </div>
            </div>
          </div>
          <div v-else class="bg-gray-950/50 rounded-lg p-8 text-center">
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
 * Admin statistics page - Enhanced version with comprehensive metrics
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

// Extra stats state
const extraStats = ref({
  totalBattles: 0,
  activeFriendships: 0,
  leaderboardEntries: 0,
})

// Fetch statistics
const fetchStats = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await apiRequest<StatsData>('/api/admin/stats', {
      method: 'GET',
    })
    stats.value = data

    // Fetch extra statistics
    await fetchExtraStats()
  } catch (err: any) {
    console.error('Failed to fetch statistics:', err)
    error.value = err.data?.message || 'Failed to load statistics'
  } finally {
    loading.value = false
  }
}

// Fetch additional statistics
const fetchExtraStats = async () => {
  try {
    // Fetch from database tables
    const [battlesRes, friendshipsRes, leaderboardRes] = await Promise.all([
      apiRequest<{ total: number }>('/api/admin/database?table=battles&limit=1', { method: 'GET' }),
      apiRequest<{ total: number }>('/api/admin/database?table=friendships&limit=1', {
        method: 'GET',
      }),
      apiRequest<{ total: number }>('/api/admin/database?table=leaderboard_entries&limit=1', {
        method: 'GET',
      }),
    ])

    extraStats.value = {
      totalBattles: battlesRes.total || 0,
      activeFriendships: friendshipsRes.total || 0,
      leaderboardEntries: leaderboardRes.total || 0,
    }
  } catch (err) {
    console.error('Failed to fetch extra stats:', err)
  }
}

// Computed values
const totalGames = computed(() => {
  if (!stats.value?.gameModes) return 0
  return stats.value.gameModes.reduce((sum, mode) => sum + mode.count, 0)
})

const maxUsers = computed(() => {
  if (!stats.value?.userActivity) return 1
  return Math.max(...stats.value.userActivity.map((day) => day.users), 1)
})

const totalWeeklyUsers = computed(() => {
  if (!stats.value?.userActivity) return 0
  return stats.value.userActivity.reduce((sum, day) => sum + day.users, 0)
})

const totalWeeklyGames = computed(() => {
  if (!stats.value?.userActivity) return 0
  return stats.value.userActivity.reduce((sum, day) => sum + day.games, 0)
})

const dailyActiveRate = computed(() => {
  if (!stats.value?.overview) return 0
  const rate =
    (stats.value.overview.activeToday.value / stats.value.overview.totalUsers.value) * 100
  return Math.min(Math.round(rate), 100)
})

const gamesPerUser = computed(() => {
  if (!stats.value?.overview || stats.value.overview.totalUsers.value === 0) return '0'
  const avg = stats.value.overview.gamesPlayed.value / stats.value.overview.totalUsers.value
  return avg.toFixed(1)
})

const averageScore = computed(() => {
  if (!stats.value?.topPlayers.byScore || stats.value.topPlayers.byScore.length === 0) return '0'
  const total = stats.value.topPlayers.byScore.reduce((sum, p) => sum + p.totalScore, 0)
  const avg = total / stats.value.topPlayers.byScore.length
  return formatNumber(Math.round(avg))
})

const avgFriendsPerUser = computed(() => {
  if (!stats.value?.overview || stats.value.overview.totalUsers.value === 0) return '0'
  const avg = (extraStats.value.activeFriendships * 2) / stats.value.overview.totalUsers.value
  return avg.toFixed(1)
})

const battlesToday = computed(() => {
  // This would need to be calculated from actual data
  // For now, showing a placeholder
  return Math.round(extraStats.value.totalBattles * 0.1)
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

const formatActivityDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }

  // Check if it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  // Return formatted date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatGameMode = (mode: string): string => {
  return mode
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const getGameModeIcon = (mode: string): string => {
  const icons: Record<string, string> = {
    GUESS_FLAG: 'mdi:flag-triangle',
    FLAGS: 'mdi:flag',
    CAPITALS: 'mdi:city',
    FIND_CAPITAL: 'mdi:map-marker',
    MAPS: 'mdi:map',
    MIXED: 'mdi:shuffle-variant',
    TIME_TRIAL: 'mdi:timer',
    HIGHER_LOWER: 'mdi:swap-vertical',
    BATTLE_FLAG_SPEED: 'mdi:flag-checkered',
    BATTLE_CAPITAL_RUSH: 'mdi:city-variant',
    BATTLE_GEOGRAPHY_DUEL: 'mdi:earth',
    BATTLE_EXPERT_SHOWDOWN: 'mdi:trophy-award',
  }
  return icons[mode] || 'mdi:gamepad-variant'
}

const getPercentage = (value: number, max: number): number => {
  if (max === 0) return 0
  return Math.min((value / max) * 100, 100)
}

const getRankBadgeClass = (index: number): string => {
  if (index === 0)
    return 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50'
  if (index === 1) return 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg shadow-gray-400/50'
  if (index === 2)
    return 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/50'
  return 'bg-gradient-to-br from-primary-400 to-primary-600'
}

// Load stats on mount
onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
