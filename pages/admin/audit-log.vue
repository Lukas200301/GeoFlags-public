<script setup lang="ts">
/**
 * Admin Audit Log Page
 *
 * Features:
 * - View all admin actions
 * - Pagination
 * - Real-time updates via polling
 */

definePageMeta({
  middleware: 'admin',
  layout: 'default',
})

const { apiRequest } = useApi()
const toast = useToast()

interface AuditLogEntry {
  id: string
  adminId: string
  action: string
  targetId?: string
  details: Record<string, any>
  ip?: string
  createdAt: string
  admin: {
    username: string
    email: string
  }
}

// State
const logs = ref<AuditLogEntry[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const totalLogs = ref(0)
const totalPages = ref(0)
const searchQuery = ref('')
const actionFilter = ref('all')

// Fetch audit logs
const fetchLogs = async () => {
  try {
    loading.value = true

    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: pageSize.value.toString(),
    })

    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }

    if (actionFilter.value !== 'all') {
      params.append('action', actionFilter.value)
    }

    const response = await apiRequest<{
      logs: AuditLogEntry[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
    }>(`/api/admin/audit-logs?${params.toString()}`, { requiresAuth: true })

    logs.value = response.logs
    totalLogs.value = response.pagination.total
    totalPages.value = response.pagination.totalPages
  } catch (error: any) {
    toast.error(error.message || 'Failed to load audit logs')
  } finally {
    loading.value = false
  }
}

// Watch for filter changes
watch([searchQuery, actionFilter], () => {
  currentPage.value = 1
  fetchLogs()
})

// Action types for filter
const actionTypes = [
  { value: 'all', label: 'All Actions' },
  { value: 'ROLE_CHANGE', label: 'Role Changes' },
  { value: 'USER_DELETE', label: 'User Deletions' },
  { value: 'USER_STATUS_CHANGE', label: 'Status Changes' },
  { value: 'GAME_MODE_UPDATE', label: 'Game Mode Updates' },
  { value: 'LEADERBOARD_DELETE', label: 'Leaderboard Deletions' },
  { value: 'LEADERBOARD_BULK_DELETE', label: 'Bulk Deletions' },
]

// Initial fetch
onMounted(() => {
  fetchLogs()
})

// Auto-refresh every 30 seconds
const refreshInterval = ref<NodeJS.Timeout | null>(null)

onMounted(() => {
  refreshInterval.value = setInterval(fetchLogs, 30000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

// Format timestamp
const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Get action icon
const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase()
  if (actionLower.includes('user')) return 'mdi:account'
  if (actionLower.includes('role')) return 'mdi:shield-account'
  if (actionLower.includes('delete')) return 'mdi:delete'
  if (actionLower.includes('create')) return 'mdi:plus-circle'
  if (actionLower.includes('update')) return 'mdi:pencil'
  if (
    actionLower.includes('ban') ||
    actionLower.includes('suspend') ||
    actionLower.includes('status')
  )
    return 'mdi:gavel'
  if (actionLower.includes('leaderboard')) return 'mdi:trophy'
  if (actionLower.includes('mode')) return 'mdi:gamepad'
  return 'mdi:information'
}

// Get action color
const getActionColor = (action: string) => {
  const actionLower = action.toLowerCase()
  if (actionLower.includes('delete') || actionLower.includes('ban'))
    return 'bg-red-500/20 text-red-400'
  if (actionLower.includes('suspend') || actionLower.includes('status'))
    return 'bg-yellow-500/20 text-yellow-400'
  if (actionLower.includes('create')) return 'bg-green-500/20 text-green-400'
  if (actionLower.includes('update') || actionLower.includes('role'))
    return 'bg-blue-500/20 text-blue-400'
  return 'bg-gray-500/20 text-gray-400'
}

// Format action name
const formatActionName = (action: string) => {
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Pagination
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchLogs()
}

// Relative time
const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return formatTimestamp(timestamp)
}
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold gradient-text mb-2">Audit Log</h1>
        <p class="text-gray-400">Track all administrative actions and system changes</p>
      </div>
      <button
        @click="fetchLogs"
        :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 glass-btn rounded-lg hover:scale-105 transition-transform"
      >
        <Icon name="mdi:refresh" class="w-5 h-5" :class="{ 'animate-spin': loading }" />
        <span class="text-sm font-medium">Refresh</span>
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="glass-card p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Search Bar -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Search</label>
          <div class="relative">
            <Icon
              name="mdi:magnify"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by admin username or action..."
              class="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>

        <!-- Action Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Action Type</label>
          <select
            v-model="actionFilter"
            class="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          >
            <option v-for="type in actionTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="glass-card p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Icon name="mdi:file-document-outline" class="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-100">{{ totalLogs }}</div>
            <div class="text-sm text-gray-400">Total Audit Logs</div>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Icon name="mdi:clock-outline" class="w-6 h-6 text-green-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-100">
              {{ logs.length > 0 ? formatRelativeTime(logs[0].createdAt) : 'N/A' }}
            </div>
            <div class="text-sm text-gray-400">Latest Activity</div>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Icon name="mdi:refresh" class="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-100">Auto</div>
            <div class="text-sm text-gray-400">Refreshes every 30s</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Log List -->
    <div class="glass-card p-6">
      <h2 class="text-xl font-bold text-gray-100 mb-6">Recent Actions</h2>

      <!-- Loading State -->
      <div v-if="loading && logs.length === 0" class="space-y-3">
        <div
          v-for="i in 5"
          :key="i"
          class="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg animate-pulse"
        >
          <div class="w-12 h-12 bg-gray-700 rounded-lg"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="logs.length === 0" class="text-center py-12">
        <Icon name="mdi:file-document-outline" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p class="text-gray-400 text-lg">No audit logs found</p>
        <p class="text-gray-500 text-sm mt-2">Administrative actions will be logged here</p>
      </div>

      <!-- Logs List -->
      <div v-else class="space-y-3">
        <div
          v-for="log in logs"
          :key="log.id"
          class="p-4 rounded-lg glass-card-dark hover:bg-gray-800/50 transition-all duration-200 group"
        >
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
              :class="getActionColor(log.action)"
            >
              <Icon :name="getActionIcon(log.action)" class="w-6 h-6" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 class="text-gray-100 font-semibold text-lg">
                    {{ formatActionName(log.action) }}
                  </h3>
                  <p class="text-sm text-gray-400 mt-1">
                    by <span class="text-gray-300 font-medium">{{ log.admin.username }}</span>
                    <span class="text-gray-500 mx-1">•</span>
                    <span class="text-gray-500">{{ log.admin.email }}</span>
                  </p>
                </div>
                <div class="text-right flex-shrink-0">
                  <span class="text-sm text-gray-400">
                    {{ formatRelativeTime(log.createdAt) }}
                  </span>
                </div>
              </div>

              <!-- Details -->
              <div
                v-if="log.details && Object.keys(log.details).length > 0"
                class="mt-3 pt-3 border-t border-gray-700/50"
              >
                <details class="group/details">
                  <summary
                    class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center gap-2 select-none"
                  >
                    <Icon
                      name="mdi:chevron-right"
                      class="w-4 h-4 group-open/details:rotate-90 transition-transform"
                    />
                    <span>View Details</span>
                    <span class="text-xs text-gray-500"
                      >({{ Object.keys(log.details).length }} items)</span
                    >
                  </summary>
                  <div class="mt-3 ml-6">
                    <div class="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                      <pre class="text-xs text-gray-300 overflow-x-auto">{{
                        JSON.stringify(log.details, null, 2)
                      }}</pre>
                    </div>
                  </div>
                </details>
              </div>

              <!-- Metadata -->
              <div class="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span v-if="log.ip" class="flex items-center gap-1">
                  <Icon name="mdi:ip" class="w-3 h-3" />
                  {{ log.ip }}
                </span>
                <span v-if="log.targetId" class="flex items-center gap-1">
                  <Icon name="mdi:target" class="w-3 h-3" />
                  Target: {{ log.targetId.substring(0, 8) }}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between mt-6 pt-6 border-t border-gray-800"
      >
        <p class="text-sm text-gray-400">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to
          {{ Math.min(currentPage * pageSize, totalLogs) }} of {{ totalLogs }} logs
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
            class="p-2 rounded-lg glass-btn transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
          >
            <Icon name="mdi:chevron-left" class="w-5 h-5 text-gray-300" />
          </button>

          <!-- Page Numbers -->
          <div class="flex items-center gap-1">
            <button
              v-for="page in Math.min(5, totalPages)"
              :key="page"
              @click="goToPage(page)"
              class="px-3 py-1 rounded-lg text-sm font-medium transition-all"
              :class="
                currentPage === page ? 'bg-primary-500 text-white' : 'glass-btn hover:bg-gray-700'
              "
            >
              {{ page }}
            </button>
            <span v-if="totalPages > 5" class="text-gray-500 px-2">...</span>
            <button
              v-if="totalPages > 5 && currentPage < totalPages"
              @click="goToPage(totalPages)"
              class="px-3 py-1 rounded-lg text-sm font-medium glass-btn hover:bg-gray-700'"
            >
              {{ totalPages }}
            </button>
          </div>

          <button
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
            class="p-2 rounded-lg glass-btn transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
          >
            <Icon name="mdi:chevron-right" class="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
