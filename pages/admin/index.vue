<script setup lang="ts">
/**
 * Admin Dashboard - Main Overview Page
 *
 * Features:
 * - System health monitoring
 * - Recent activity feed
 */

definePageMeta({
  middleware: 'admin',
  layout: 'default',
})

const { apiRequest } = useApi()
const toast = useToast()

interface SystemHealth {
  uptime: string
  uptimeSeconds: number
  status: 'healthy' | 'warning' | 'error'
  server: {
    memory: {
      used: number
      total: number
      percentage: number
    }
    cpu: {
      usage: number
    }
    platform: string
    nodeVersion: string
  }
  database: {
    status: 'connected' | 'disconnected'
    responseTime: number
  }
  sessions: {
    active: number
    total: number
  }
}

interface RecentActivity {
  id: string
  type: 'user_registered' | 'game_played'
  message: string
  timestamp: string
  user?: {
    username: string
    id: string
  }
}

const systemHealth = ref<SystemHealth | null>(null)
const recentActivity = ref<RecentActivity[]>([])
const loading = ref(true)
const healthLoading = ref(false)

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true
    const response = await apiRequest<{ recentActivity: RecentActivity[] }>(
      '/api/admin/dashboard',
      { requiresAuth: true }
    )
    recentActivity.value = response.recentActivity
  } catch (error: any) {
    toast.error(error.message || 'Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

// Fetch system health
const fetchSystemHealth = async (silent = false) => {
  try {
    if (!silent) {
      healthLoading.value = true
    }
    const response = await apiRequest<{ metrics: SystemHealth }>(
      '/api/admin/system/health',
      { requiresAuth: true }
    )
    systemHealth.value = response.metrics
  } catch (error: any) {
    if (!silent) {
      toast.error(error.message || 'Failed to load system health')
    }
  } finally {
    healthLoading.value = false
  }
}

// Auto-refresh
const refreshInterval = ref<NodeJS.Timeout | null>(null)

onMounted(() => {
  fetchDashboardData()
  fetchSystemHealth()
  // Refresh every 30 seconds
  refreshInterval.value = setInterval(() => {
    fetchDashboardData()
    fetchSystemHealth(true)
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

// Format helpers
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
  return `${days}d ago`
}

const formatBytes = (bytes: number) => {
  const gb = bytes / (1024 ** 3)
  return `${gb.toFixed(2)} GB`
}

// Activity icon mapping
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user_registered':
      return 'mdi:account-plus'
    case 'game_played':
      return 'mdi:gamepad-variant'
    default:
      return 'mdi:information'
  }
}

// Activity color mapping
const getActivityColor = (type: string) => {
  switch (type) {
    case 'user_registered':
      return 'bg-green-500/20 text-green-400'
    case 'game_played':
      return 'bg-blue-500/20 text-blue-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

const getStatusColor = (status: string) => {
  if (status === 'healthy') return 'text-green-400'
  if (status === 'warning') return 'text-yellow-400'
  return 'text-red-400'
}

const getStatusBg = (status: string) => {
  if (status === 'healthy') return 'bg-green-500/20 border-green-500/30'
  if (status === 'warning') return 'bg-yellow-500/20 border-yellow-500/30'
  return 'bg-red-500/20 border-red-500/30'
}

const getMetricColor = (percentage: number, inverted = false) => {
  if (inverted) {
    // For metrics where lower is better (CPU, Memory)
    if (percentage < 50) return 'text-green-400'
    if (percentage < 80) return 'text-yellow-400'
    return 'text-red-400'
  } else {
    // For metrics where higher is better
    if (percentage > 80) return 'text-green-400'
    if (percentage > 50) return 'text-yellow-400'
    return 'text-red-400'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
      <p class="text-gray-400">System health monitoring and recent activity</p>
    </div>

    <!-- System Health Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-100">System Health</h2>
        <button
          @click="fetchSystemHealth()"
          :disabled="healthLoading"
          class="flex items-center gap-2 px-4 py-2 glass-btn rounded-lg hover:scale-105 transition-transform"
        >
          <Icon
            name="mdi:refresh"
            class="w-5 h-5"
            :class="{ 'animate-spin': healthLoading }"
          />
          <span class="text-sm font-medium">Refresh</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="!systemHealth && healthLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="glass-card p-6 animate-pulse">
          <div class="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div class="h-8 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>

      <!-- System Health Content -->
      <div v-else-if="systemHealth" class="space-y-6">
        <!-- Overall Status Banner -->
        <div
          class="glass-card p-6 border-l-4 transition-all duration-300"
          :class="systemHealth.status === 'healthy' ? 'border-green-500' : systemHealth.status === 'warning' ? 'border-yellow-500' : 'border-red-500'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center"
                :class="getStatusBg(systemHealth.status)"
              >
                <Icon
                  :name="systemHealth.status === 'healthy' ? 'mdi:check-circle' : systemHealth.status === 'warning' ? 'mdi:alert' : 'mdi:alert-octagon'"
                  class="w-8 h-8"
                  :class="getStatusColor(systemHealth.status)"
                />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-100">
                  {{ systemHealth.status === 'healthy' ? 'All Systems Operational' : systemHealth.status === 'warning' ? 'System Warning' : 'System Error' }}
                </h3>
                <p class="text-gray-400 mt-1">
                  Uptime: <span class="font-mono text-gray-300">{{ systemHealth.uptime }}</span>
                </p>
              </div>
            </div>
            <div class="text-right hidden md:block">
              <div class="text-sm text-gray-400">System Status</div>
              <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full border mt-2"
                :class="getStatusBg(systemHealth.status)"
              >
                <div
                  class="w-2 h-2 rounded-full animate-pulse"
                  :class="systemHealth.status === 'healthy' ? 'bg-green-500' : systemHealth.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'"
                ></div>
                <span class="text-sm font-semibold capitalize">{{ systemHealth.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- CPU Usage -->
          <div class="glass-card p-6 hover-lift">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Icon name="mdi:cpu-64-bit" class="w-6 h-6 text-blue-400" />
              </div>
              <span class="text-xs text-gray-400">CPU</span>
            </div>
            <div class="mb-2">
              <div class="text-3xl font-bold" :class="getMetricColor(systemHealth.server.cpu.usage, true)">
                {{ systemHealth.server.cpu.usage.toFixed(1) }}%
              </div>
              <div class="text-sm text-gray-400">Usage</div>
            </div>
            <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="systemHealth.server.cpu.usage < 50 ? 'bg-green-500' : systemHealth.server.cpu.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'"
                :style="{ width: `${systemHealth.server.cpu.usage}%` }"
              ></div>
            </div>
          </div>

          <!-- Memory Usage -->
          <div class="glass-card p-6 hover-lift">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Icon name="mdi:memory" class="w-6 h-6 text-purple-400" />
              </div>
              <span class="text-xs text-gray-400">Memory</span>
            </div>
            <div class="mb-2">
              <div class="text-3xl font-bold" :class="getMetricColor(systemHealth.server.memory.percentage, true)">
                {{ systemHealth.server.memory.percentage.toFixed(1) }}%
              </div>
              <div class="text-sm text-gray-400">
                {{ formatBytes(systemHealth.server.memory.used) }} / {{ formatBytes(systemHealth.server.memory.total) }}
              </div>
            </div>
            <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="systemHealth.server.memory.percentage < 50 ? 'bg-green-500' : systemHealth.server.memory.percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'"
                :style="{ width: `${systemHealth.server.memory.percentage}%` }"
              ></div>
            </div>
          </div>

          <!-- Database Status -->
          <div class="glass-card p-6 hover-lift">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Icon name="mdi:database" class="w-6 h-6 text-green-400" />
              </div>
              <span class="text-xs text-gray-400">Database</span>
            </div>
            <div class="mb-2">
              <div
                class="text-3xl font-bold"
                :class="systemHealth.database.status === 'connected' ? 'text-green-400' : 'text-red-400'"
              >
                {{ systemHealth.database.status === 'connected' ? 'Connected' : 'Offline' }}
              </div>
              <div class="text-sm text-gray-400">
                {{ systemHealth.database.responseTime }}ms response
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-full animate-pulse"
                :class="systemHealth.database.status === 'connected' ? 'bg-green-500' : 'bg-red-500'"
              ></div>
              <span class="text-xs text-gray-400">
                {{ systemHealth.database.status === 'connected' ? 'Operational' : 'Connection Lost' }}
              </span>
            </div>
          </div>

          <!-- Active Sessions -->
          <div class="glass-card p-6 hover-lift">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Icon name="mdi:account-multiple" class="w-6 h-6 text-orange-400" />
              </div>
              <span class="text-xs text-gray-400">Users</span>
            </div>
            <div class="mb-2">
              <div class="text-3xl font-bold text-orange-400">
                {{ systemHealth.sessions.active }}
              </div>
              <div class="text-sm text-gray-400">
                Active (15 min)
              </div>
            </div>
            <div class="text-xs text-gray-400">
              Total registered: {{ systemHealth.sessions.total }}
            </div>
          </div>
        </div>

        <!-- System Info -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-gray-100 mb-4">System Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center gap-3">
              <Icon name="mdi:server" class="w-5 h-5 text-gray-400" />
              <div>
                <div class="text-sm text-gray-400">Platform</div>
                <div class="text-gray-100 font-medium">{{ systemHealth.server.platform }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Icon name="mdi:nodejs" class="w-5 h-5 text-gray-400" />
              <div>
                <div class="text-sm text-gray-400">Node.js Version</div>
                <div class="text-gray-100 font-medium">{{ systemHealth.server.nodeVersion }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-100">Recent Activity</h2>
        <button
          @click="fetchDashboardData"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 glass-btn rounded-lg hover:scale-105 transition-transform"
        >
          <Icon
            name="mdi:refresh"
            class="w-5 h-5"
            :class="{ 'animate-spin': loading }"
          />
          <span class="text-sm font-medium">Refresh</span>
        </button>
      </div>

      <div class="glass-card p-6">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg animate-pulse">
            <div class="w-10 h-10 bg-gray-700 rounded-lg"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="recentActivity.length === 0" class="text-center py-12">
          <Icon name="mdi:clock-outline" class="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p class="text-gray-400 text-lg">No recent activity</p>
          <p class="text-gray-500 text-sm mt-2">Activity will appear here as users interact with the application</p>
        </div>

        <!-- Activity List -->
        <div v-else class="space-y-2">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-start gap-3 p-4 rounded-lg glass-card-dark hover:bg-gray-800/50 transition-all duration-200 group"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
              :class="getActivityColor(activity.type)"
            >
              <Icon :name="getActivityIcon(activity.type)" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-gray-100 font-medium">{{ activity.message }}</p>
              <div class="flex items-center gap-3 mt-1">
                <p v-if="activity.user" class="text-sm text-gray-400">
                  <Icon name="mdi:account" class="w-4 h-4 inline mr-1" />
                  {{ activity.user.username }}
                </p>
                <span class="text-sm text-gray-500">{{ formatRelativeTime(activity.timestamp) }}</span>
              </div>
            </div>
            <Icon name="mdi:chevron-right" class="w-5 h-5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 8px currentColor;
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 12px currentColor;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
</style>
