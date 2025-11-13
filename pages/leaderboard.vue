<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-100 mb-2">Leaderboard</h1>
      <p class="text-gray-400">See how you rank against other players worldwide</p>
    </div>

    <!-- User Search -->
    <div class="card p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-100 mb-4">Find a Player</h2>
      <div class="flex gap-4">
        <div class="flex-1 relative">
          <Icon name="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by username..."
            class="input-field pl-10"
            @input="handleSearch"
          />
        </div>
      </div>
      
      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="mt-4 space-y-2">
        <NuxtLink
          v-for="user in searchResults"
          :key="user.id"
          :to="`/users/${user.id}`"
          class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold overflow-hidden">
            <img v-if="user.avatarUrl" :src="getAvatarUrl(user.avatarUrl)" alt="Avatar" class="w-full h-full object-cover">
            <span v-else>{{ user.username.charAt(0).toUpperCase() }}</span>
          </div>
          <div>
            <p class="font-medium text-gray-100">{{ user.username }}</p>
            <p class="text-sm text-gray-400">Joined {{ formatDate(user.createdAt) }}</p>
          </div>
        </NuxtLink>
      </div>
      <div v-else-if="searchQuery && searchQuery.length >= 2" class="mt-4 text-center text-gray-400 text-sm">
        No users found
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-6 mb-8">
      <div class="max-w-md">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Game Mode</label>
          <select v-model="filters.mode" class="input-field">
            <option :value="undefined">All Modes</option>
            <option value="GUESS_FLAG">Guess the Flag - Infinite Mode</option>
            <option value="TIME_TRIAL">Time Trial</option>
            <option value="FIND_CAPITAL">Find the Capital</option>
            <option value="HIGHER_LOWER">Higher/Lower</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Current User Stats (shown when mode is selected and user is logged in) -->
    <div v-if="filters.mode && user && userStats" class="card p-6 mb-8 bg-gradient-to-br from-primary-900/20 to-primary-800/20 border-2 border-primary-500/30">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden border-4 border-primary-500/50">
            <img v-if="user.avatarUrl" :src="getAvatarUrl(user.avatarUrl)" alt="Your Avatar" class="w-full h-full object-cover">
            <span v-else>{{ user.username.charAt(0).toUpperCase() }}</span>
          </div>
          <div>
            <p class="text-sm text-gray-400">Your Stats</p>
            <p class="text-2xl font-bold text-gray-100">{{ user.username }}</p>
          </div>
        </div>
        <div class="flex gap-6">
          <div class="text-center">
            <p class="text-3xl font-bold text-primary-400">{{ userStats.rank || 'N/A' }}</p>
            <p class="text-sm text-gray-400">Rank</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-primary-400">{{ userStats.score || 0 }}</p>
            <p class="text-sm text-gray-400">Best Score</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-primary-400">{{ userStats.gamesPlayed || 0 }}</p>
            <p class="text-sm text-gray-400">Games Played</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card p-8 text-center">
      <div class="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Loading leaderboard...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card p-8 text-center">
      <Icon name="mdi:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p class="text-gray-300 mb-4">{{ error }}</p>
      <button @click="fetchLeaderboard" class="btn-primary">Try Again</button>
    </div>

    <!-- Leaderboard Table -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-950 border-b border-gray-800">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                Rank
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                Player
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                Mode
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                Score
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="entry in paginatedLeaderboard"
              :key="entry.id"
              class="transition-colors"
              :class="[
                entry.user.id === user?.id 
                  ? 'bg-primary-900/20 hover:bg-primary-900/30 border-l-4 border-primary-500' 
                  : 'hover:bg-gray-950'
              ]"
            >
              <td class="px-6 py-4">
                <div class="w-8">
                  <div
                    v-if="entry.rank <= 3"
                    class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                    :class="{
                      'bg-yellow-500': entry.rank === 1,
                      'bg-gray-400': entry.rank === 2,
                      'bg-orange-600': entry.rank === 3,
                    }"
                  >
                    {{ entry.rank }}
                  </div>
                  <span v-else class="text-gray-300 font-medium text-center block">{{ entry.rank }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <NuxtLink :to="`/users/${entry.user.id}`" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold overflow-hidden"
                  >
                    <img v-if="entry.user.avatarUrl" :src="getAvatarUrl(entry.user.avatarUrl)" alt="Avatar" class="w-full h-full object-cover">
                    <span v-else>{{ entry.user.username.charAt(0).toUpperCase() }}</span>
                  </div>
                  <span class="font-medium text-gray-100 hover:text-primary-400 transition-colors">{{ entry.user.username }}</span>
                </NuxtLink>
              </td>
              <td class="px-6 py-4">
                <span class="capitalize text-gray-300">{{ formatModeName(entry.mode) }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-lg font-bold text-primary-600">{{ entry.score }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(entry.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="leaderboard.length === 0" class="p-12 text-center">
        <Icon name="mdi:trophy-outline" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-400">No entries yet. Be the first to play!</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="p-6 border-t border-gray-800 flex items-center justify-between">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="mdi:chevron-left" class="w-5 h-5" />
          <span>Previous</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            class="px-4 py-2 rounded-lg font-medium transition-colors"
            :class="[
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <Icon name="mdi:chevron-right" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardEntry, LeaderboardFilters } from '~/types'

/**
 * Leaderboard page
 * Displays global rankings with filtering options, pagination, and user stats
 */
const { getLeaderboard, apiRequest } = useApi()
const { liveLeaderboard } = useSocket()
const { user } = useAuth()

const leaderboard = ref<LeaderboardEntry[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 50

const filters = reactive<LeaderboardFilters>({
  mode: undefined,
  limit: 1000, // Fetch more for pagination
})

// User stats for selected mode
const userStats = ref<{
  rank: number | null
  score: number
  gamesPlayed: number
} | null>(null)

// Pagination
const totalPages = computed(() => Math.ceil(leaderboard.value.length / itemsPerPage))
const paginatedLeaderboard = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return leaderboard.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// User search
const searchQuery = ref('')
const searchResults = ref<Array<{
  id: string
  username: string
  avatarUrl: string | null
  createdAt: string
}>>([])
let searchTimeout: NodeJS.Timeout | null = null

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      const response = await apiRequest<{ users: typeof searchResults.value }>(
        `/api/users/search?q=${encodeURIComponent(searchQuery.value)}`,
        { method: 'GET', requiresAuth: false }
      )
      searchResults.value = response.users
    } catch (err) {
      console.error('Search failed:', err)
      searchResults.value = []
    }
  }, 300)
}

const fetchLeaderboard = async () => {
  try {
    loading.value = true
    error.value = null

    const entries = await getLeaderboard(filters)
    leaderboard.value = entries
    
    // Reset to first page when filters change
    currentPage.value = 1

    // Fetch user stats if a mode is selected and user is logged in
    if (filters.mode && user.value) {
      await fetchUserStats()
    } else {
      userStats.value = null
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load leaderboard'
  } finally {
    loading.value = false
  }
}

const fetchUserStats = async () => {
  if (!user.value || !filters.mode) return

  try {
    // Find user's rank in leaderboard
    const userEntry = leaderboard.value.find(entry => entry.user.id === user.value?.id)
    
    // Get user's game sessions for this mode
    const sessions = await apiRequest<{ sessions: any[] }>(
      `/api/game/history?mode=${filters.mode}`,
      { method: 'GET', requiresAuth: true }
    )

    userStats.value = {
      rank: userEntry?.rank || null,
      score: userEntry?.score || 0,
      gamesPlayed: sessions.sessions?.length || 0,
    }
  } catch (err) {
    console.error('Failed to fetch user stats:', err)
    userStats.value = null
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatModeName = (mode: string) => {
  const modeNames: Record<string, string> = {
    'FLAGS': 'Flags',
    'CAPITALS': 'Capitals',
    'MAPS': 'Maps',
    'MIXED': 'Mixed',
    'GUESS_FLAG': 'Guess the Flag',
    'TIME_TRIAL': 'Time Trial',
    'FIND_CAPITAL': 'Find the Capital',
    'HIGHER_LOWER': 'Higher/Lower',
  }
  return modeNames[mode] || mode
}

// Get avatar URL
const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  if (!avatarUrl) return ''
  // If avatar is already a full URL, return it
  if (avatarUrl.startsWith('http')) return avatarUrl
  // Otherwise, prepend the API base URL
  const config = useRuntimeConfig()
  return `${config.public.apiBase}${avatarUrl}`
}

// Watch for filter changes
watch(filters, () => {
  fetchLeaderboard()
})

// Watch for live updates
watch(liveLeaderboard, (newLeaderboard) => {
  if (newLeaderboard.length > 0) {
    leaderboard.value = [...newLeaderboard]
  }
})

onMounted(() => {
  fetchLeaderboard()
})
</script>
