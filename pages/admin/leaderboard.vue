<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold gradient-text mb-2">Leaderboard Management</h1>
        <p class="text-gray-400">Manage and moderate leaderboard entries</p>
      </div>
      <div class="flex gap-3">
        <button
          v-if="selectedEntries.length > 0"
          @click="openBulkDeleteModal"
          class="glass-btn-danger px-4 py-2 rounded-xl hover-lift"
        >
          <Icon name="mdi:delete-multiple" class="w-5 h-5 inline mr-2" />
          Delete Selected ({{ selectedEntries.length }})
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 hover-lift">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Total Entries</p>
            <p class="text-3xl font-bold gradient-text mt-1">{{ stats.total }}</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Icon name="mdi:format-list-numbered" class="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      <div class="glass-card p-6 hover-lift">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">This Week</p>
            <p class="text-3xl font-bold gradient-text mt-1">{{ stats.thisWeek }}</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Icon name="mdi:calendar-week" class="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      <div class="glass-card p-6 hover-lift">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Top Score</p>
            <p class="text-3xl font-bold gradient-text mt-1">{{ stats.topScore }}</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Icon name="mdi:trophy" class="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Game Mode</label>
          <select
            v-model="filters.mode"
            @change="loadEntries"
            class="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="">All Modes</option>
            <option value="GUESS_FLAG">Guess The Flag</option>
            <option value="TIME_TRIAL">Time Trial</option>
            <option value="FIND_CAPITAL">Find the Capital</option>
            <option value="HIGHER_LOWER">Higher Lower</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
          <select
            v-model="filters.sortBy"
            @change="loadEntries"
            class="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="score">Score (Highest)</option>
            <option value="date">Date (Newest)</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-300 hover:bg-black/40 hover:border-white/20 transition-all"
          >
            <Icon name="mdi:filter-off" class="w-5 h-5 inline mr-2" />
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Leaderboard Table -->
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold gradient-text">Leaderboard Entries</h2>
        <div class="text-sm text-gray-400">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <Icon name="mdi:loading" class="w-12 h-12 text-blue-500 animate-spin mx-auto" />
        <p class="text-gray-400 mt-4">Loading entries...</p>
      </div>

      <div v-else-if="entries.length === 0" class="text-center py-12">
        <Icon name="mdi:trophy-outline" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-400">No leaderboard entries found</p>
      </div>

      <div v-else class="space-y-4">
        <!-- Select All -->
        <div class="flex items-center gap-3 pb-4 border-b border-white/5">
          <input
            type="checkbox"
            :checked="allSelected"
            @change="toggleSelectAll"
            class="w-4 h-4 rounded bg-black/30 border-white/10"
          />
          <span class="text-sm text-gray-400">Select All</span>
        </div>

        <!-- Entry Rows -->
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="glass-card-dark p-4 hover-lift group"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 flex-1">
              <!-- Checkbox -->
              <input
                type="checkbox"
                :checked="selectedEntries.includes(entry.id)"
                @change="toggleSelection(entry.id)"
                class="w-4 h-4 rounded bg-black/30 border-white/10"
              />

              <!-- Rank -->
              <div class="w-12 text-center">
                <div
                  v-if="entry.rank <= 3"
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="{
                    'bg-yellow-500/20': entry.rank === 1,
                    'bg-gray-300/20': entry.rank === 2,
                    'bg-orange-500/20': entry.rank === 3,
                  }"
                >
                  <Icon
                    name="mdi:trophy"
                    class="w-5 h-5"
                    :class="{
                      'text-yellow-400': entry.rank === 1,
                      'text-gray-300': entry.rank === 2,
                      'text-orange-400': entry.rank === 3,
                    }"
                  />
                </div>
                <span v-else class="text-gray-400 font-medium">#{{ entry.rank }}</span>
              </div>

              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-gray-100 font-medium truncate">{{ entry.user.username }}</p>
                  <span class="text-xs text-gray-500">{{ entry.user.email }}</span>
                </div>
                <p class="text-sm text-gray-400">
                  {{ formatGameMode(entry.mode) }} •
                  {{ formatDate(entry.createdAt) }}
                </p>
              </div>

              <!-- Score -->
              <div class="text-right">
                <p class="text-2xl font-bold gradient-text">{{ entry.score.toLocaleString() }}</p>
                <p class="text-xs text-gray-500">points</p>
              </div>

              <!-- Actions -->
              <button
                @click="openDeleteModal(entry)"
                class="opacity-0 group-hover:opacity-100 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
              >
                <Icon name="mdi:delete" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-300 hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Icon name="mdi:chevron-left" class="w-5 h-5 inline mr-1" />
          Previous
        </button>

        <div class="flex items-center gap-2">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 rounded-xl transition-all',
              page === currentPage
                ? 'bg-blue-500 text-white'
                : 'bg-black/30 border border-white/10 text-gray-300 hover:bg-black/40'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-300 hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next
          <Icon name="mdi:chevron-right" class="w-5 h-5 inline ml-1" />
        </button>
      </div>
    </div>

    <!-- Delete Single Entry Modal -->
    <AdminModal
      v-model="deleteModal.open"
      title="Delete Leaderboard Entry"
      confirm-text="Delete Entry"
      danger
      :loading="deleteModal.loading"
      @confirm="handleDeleteEntry"
    >
      <div class="space-y-4">
        <div class="flex items-center space-x-3 p-4 bg-red-900/20 rounded-lg">
          <Icon name="mdi:alert" class="w-6 h-6 text-red-400" />
          <p class="text-sm text-red-300">
            This action cannot be undone.
          </p>
        </div>
        <p class="text-gray-300">
          Are you sure you want to delete this leaderboard entry?
        </p>
        <div v-if="deleteModal.entry" class="glass-card-dark p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-100 font-medium">{{ deleteModal.entry.user.username }}</p>
              <p class="text-sm text-gray-400">{{ formatGameMode(deleteModal.entry.mode) }}</p>
            </div>
            <p class="text-xl font-bold gradient-text">{{ deleteModal.entry.score.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </AdminModal>

    <!-- Bulk Delete Modal -->
    <AdminModal
      v-model="bulkDeleteModal.open"
      title="Delete Multiple Entries"
      confirm-text="Delete All Selected"
      danger
      :loading="bulkDeleteModal.loading"
      @confirm="handleBulkDelete"
    >
      <div class="space-y-4">
        <div class="flex items-center space-x-3 p-4 bg-red-900/20 rounded-lg">
          <Icon name="mdi:alert" class="w-6 h-6 text-red-400" />
          <p class="text-sm text-red-300">
            This action cannot be undone. {{ selectedEntries.length }} entries will be permanently deleted.
          </p>
        </div>
        <p class="text-gray-300">
          Are you sure you want to delete {{ selectedEntries.length }} leaderboard entries?
        </p>
      </div>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
/**
 * Admin Leaderboard Management Page
 *
 * Features:
 * - View all leaderboard entries with pagination
 * - Filter by game mode
 * - Sort by score or date
 * - Delete individual entries
 * - Bulk delete multiple entries
 * - Real-time statistics
 *
 * SECURITY: Protected by admin middleware
 */
definePageMeta({
  middleware: 'admin',
})

const toast = useToast()

interface LeaderboardEntry {
  id: string
  score: number
  mode: string
  createdAt: string
  rank: number
  user: {
    id: string
    username: string
    email: string
  }
}

interface LeaderboardResponse {
  entries: Omit<LeaderboardEntry, 'rank'>[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// State
const loading = ref(true)
const entries = ref<LeaderboardEntry[]>([])
const selectedEntries = ref<string[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalEntries = ref(0)

const stats = ref({
  total: 0,
  thisWeek: 0,
  topScore: 0,
})

const filters = reactive({
  mode: '',
  sortBy: 'score',
})

const deleteModal = reactive({
  open: false,
  loading: false,
  entry: null as LeaderboardEntry | null,
})

const bulkDeleteModal = reactive({
  open: false,
  loading: false,
})

// Computed
const allSelected = computed(() => {
  return entries.value.length > 0 && selectedEntries.value.length === entries.value.length
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

// Methods
async function loadEntries() {
  try {
    loading.value = true

    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: '20',
    })

    if (filters.mode) {
      params.append('mode', filters.mode)
    }

    const response = await $fetch<LeaderboardResponse>(`${apiBase}/api/admin/leaderboard?${params}`, {
      credentials: 'include',
    })

    entries.value = response.entries.map((entry, index: number) => ({
      ...entry,
      rank: (currentPage.value - 1) * 20 + index + 1,
    }))

    totalPages.value = response.pagination.totalPages
    totalEntries.value = response.pagination.total

    // Calculate stats
    await loadStats()
  } catch (error: any) {
    toast.error(error.data?.message || 'Failed to load leaderboard entries')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    const allEntries = await $fetch<LeaderboardResponse>(`${apiBase}/api/admin/leaderboard?limit=1000`, {
      credentials: 'include',
    })

    stats.value.total = allEntries.pagination.total

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    stats.value.thisWeek = allEntries.entries.filter((entry) => {
      return new Date(entry.createdAt) >= oneWeekAgo
    }).length

    stats.value.topScore = allEntries.entries.length > 0
      ? Math.max(...allEntries.entries.map((e) => e.score))
      : 0
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

function toggleSelection(id: string) {
  const index = selectedEntries.value.indexOf(id)
  if (index === -1) {
    selectedEntries.value.push(id)
  } else {
    selectedEntries.value.splice(index, 1)
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedEntries.value = []
  } else {
    selectedEntries.value = entries.value.map(e => e.id)
  }
}

function openDeleteModal(entry: LeaderboardEntry) {
  deleteModal.entry = entry
  deleteModal.open = true
}

function openBulkDeleteModal() {
  bulkDeleteModal.open = true
}

async function handleDeleteEntry() {
  if (!deleteModal.entry) return

  try {
    deleteModal.loading = true

    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    await $fetch(`${apiBase}/api/admin/leaderboard/${deleteModal.entry.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    toast.success('Leaderboard entry deleted successfully')
    deleteModal.open = false
    deleteModal.entry = null

    await loadEntries()
  } catch (error: any) {
    toast.error(error.data?.message || 'Failed to delete entry')
  } finally {
    deleteModal.loading = false
  }
}

async function handleBulkDelete() {
  try {
    bulkDeleteModal.loading = true

    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    await $fetch(`${apiBase}/api/admin/leaderboard/bulk-delete`, {
      method: 'POST',
      credentials: 'include',
      body: {
        ids: selectedEntries.value,
      },
    })

    toast.success(`Successfully deleted ${selectedEntries.value.length} entries`)
    bulkDeleteModal.open = false
    selectedEntries.value = []

    await loadEntries()
  } catch (error: any) {
    toast.error(error.data?.message || 'Failed to delete entries')
  } finally {
    bulkDeleteModal.loading = false
  }
}

function clearFilters() {
  filters.mode = ''
  filters.sortBy = 'score'
  currentPage.value = 1
  loadEntries()
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadEntries()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadEntries()
  }
}

function goToPage(page: number) {
  currentPage.value = page
  loadEntries()
}

function formatGameMode(mode: string): string {
  const modes: Record<string, string> = {
    GUESS_FLAG: 'Guess The Flag',
    TIME_TRIAL: 'Time Trial',
    FIND_CAPITAL: 'Find the Capital',
    HIGHER_LOWER: 'Higher Lower',
  }
  return modes[mode] || mode
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Load entries on mount
onMounted(() => {
  loadEntries()
})
</script>
