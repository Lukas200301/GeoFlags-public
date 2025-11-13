<script setup lang="ts">
/**
 * Admin System Health Page
 *
 * Features:
 * - System metrics (CPU, memory, uptime)
 * - Database health
 * - API response times
 * - Active connections
 * - Real-time monitoring
 */

definePageMeta({
  middleware: 'admin',
  layout: 'default',
})

const { apiRequest } = useApi()
const toast = useToast()

interface SystemMetrics {
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
    connections: {
      active: number
      idle: number
      total: number
    }
  }
  api: {
    totalRequests: number
    averageResponseTime: number
    errorRate: number
  }
  sessions: {
    active: number
    total: number
  }
}

// State
const metrics = ref<SystemMetrics | null>(null)
const loading = ref(true)
const lastUpdated = ref<Date | null>(null)

// Fetch system metrics
const fetchMetrics = async () => {
  try {
    loading.value = true
    const response = await apiRequest<{ metrics: SystemMetrics }>(
      '/api/admin/system/health',
      { requiresAuth: true }
    )
    metrics.value = response.metrics
    lastUpdated.value = new Date()
  } catch (error: any) {
    toast.error(error.message || 'Failed to load system metrics')
  } finally {
    loading.value = false
  }
}

// Initial fetch
onMounted(() => {
  fetchMetrics()
})

// Auto-refresh every 10 seconds
const refreshInterval = ref<NodeJS.Timeout | null>(null)

onMounted(() => {
  refreshInterval.value = setInterval(fetchMetrics, 10000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

// Format bytes
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
    case 'connected':
      return 'text-green-500'
    case 'warning':
      return 'text-yellow-500'
    case 'error':
    case 'disconnected':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

// Get status background color
const getStatusBgColor = (status: string) => {
  switch (status) {
    case 'healthy':
    case 'connected':
      return 'bg-green-500/20'
    case 'warning':
      return 'bg-yellow-500/20'
    case 'error':
    case 'disconnected':
      return 'bg-red-500/20'
    default:
      return 'bg-gray-500/20'
  }
}

// Get metric color based on threshold
const getMetricColor = (value: number, warningThreshold: number, errorThreshold: number) => {
  if (value >= errorThreshold) return 'text-red-500'
  if (value >= warningThreshold) return 'text-yellow-500'
  return 'text-green-500'
}

// Format time ago
const formatTimeAgo = (date: Date | null) => {
  if (!date) return 'Never'
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-100 mb-2">System Health</h1>
        <p class="text-gray-400">Monitor system performance and health metrics</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500">Updated {{ formatTimeAgo(lastUpdated) }}</span>
        <button
          @click="fetchMetrics"
          class="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Icon name="mdi:refresh" class="w-5 h-5" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !metrics" class="admin-card text-center py-12">
      <Icon name="mdi:loading" class="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
      <p class="text-gray-400">Loading system metrics...</p>
    </div>

    <!-- System Status -->
    <div v-else-if="metrics">
      <!-- Overall Status Banner -->
      <div class="admin-card mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              :class="[
                'w-16 h-16 rounded-full flex items-center justify-center',
                getStatusBgColor(metrics.status)
              ]"
            >
              <Icon
                :name="metrics.status === 'healthy' ? 'mdi:check-circle' : metrics.status === 'warning' ? 'mdi:alert' : 'mdi:alert-circle'"
                :class="['w-8 h-8', getStatusColor(metrics.status)]"
              />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-100">
                {{ metrics.status === 'healthy' ? 'All Systems Operational' : metrics.status === 'warning' ? 'System Warning' : 'System Error' }}
              </h2>
              <p class="text-gray-400">Uptime: {{ metrics.uptime }}</p>
            </div>
          </div>
          <div :class="['px-4 py-2 rounded-full text-sm font-medium', getStatusBgColor(metrics.status), getStatusColor(metrics.status)]">
            {{ metrics.status.toUpperCase() }}
          </div>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Server Metrics -->
        <div class="admin-card">
          <h3 class="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Icon name="mdi:server" class="w-5 h-5" />
            Server
          </h3>
          <div class="space-y-4">
            <!-- Memory Usage -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">Memory Usage</span>
                <span :class="['text-sm font-medium', getMetricColor(metrics.server.memory.percentage, 70, 90)]">
                  {{ metrics.server.memory.percentage.toFixed(1) }}%
                </span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  class="h-full transition-all duration-500 rounded-full"
                  :class="[
                    metrics.server.memory.percentage >= 90 ? 'bg-red-500' :
                    metrics.server.memory.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  ]"
                  :style="{ width: `${metrics.server.memory.percentage}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ formatBytes(metrics.server.memory.used) }} / {{ formatBytes(metrics.server.memory.total) }}
              </p>
            </div>

            <!-- CPU Usage -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">CPU Usage</span>
                <span :class="['text-sm font-medium', getMetricColor(metrics.server.cpu.usage, 70, 90)]">
                  {{ metrics.server.cpu.usage.toFixed(1) }}%
                </span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  class="h-full transition-all duration-500 rounded-full"
                  :class="[
                    metrics.server.cpu.usage >= 90 ? 'bg-red-500' :
                    metrics.server.cpu.usage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  ]"
                  :style="{ width: `${metrics.server.cpu.usage}%` }"
                ></div>
              </div>
            </div>

            <!-- System Info -->
            <div class="pt-2 border-t border-gray-800 space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Platform:</span>
                <span class="text-gray-200">{{ metrics.server.platform }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Node.js:</span>
                <span class="text-gray-200">{{ metrics.server.nodeVersion }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Database Metrics -->
        <div class="admin-card">
          <h3 class="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Icon name="mdi:database" class="w-5 h-5" />
            Database
          </h3>
          <div class="space-y-4">
            <!-- Status -->
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <span class="text-sm text-gray-400">Status</span>
              <span :class="['text-sm font-medium flex items-center gap-2', getStatusColor(metrics.database.status)]">
                <div :class="['w-2 h-2 rounded-full', metrics.database.status === 'connected' ? 'bg-green-500' : 'bg-red-500']"></div>
                {{ metrics.database.status === 'connected' ? 'Connected' : 'Disconnected' }}
              </span>
            </div>

            <!-- Response Time -->
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <span class="text-sm text-gray-400">Response Time</span>
              <span :class="['text-sm font-medium', getMetricColor(metrics.database.responseTime, 100, 500)]">
                {{ metrics.database.responseTime }}ms
              </span>
            </div>

            <!-- Connections -->
            <div class="pt-2 border-t border-gray-800 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Active:</span>
                <span class="text-gray-200 font-medium">{{ metrics.database.connections.active }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Idle:</span>
                <span class="text-gray-200">{{ metrics.database.connections.idle }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Total:</span>
                <span class="text-gray-200 font-medium">{{ metrics.database.connections.total }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- API & Sessions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- API Metrics -->
        <div class="admin-card">
          <h3 class="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Icon name="mdi:api" class="w-5 h-5" />
            API Performance
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <span class="text-sm text-gray-400">Total Requests</span>
              <span class="text-lg font-bold text-gray-100">{{ metrics.api.totalRequests.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <span class="text-sm text-gray-400">Avg Response Time</span>
              <span :class="['text-lg font-bold', getMetricColor(metrics.api.averageResponseTime, 200, 500)]">
                {{ metrics.api.averageResponseTime }}ms
              </span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <span class="text-sm text-gray-400">Error Rate</span>
              <span :class="['text-lg font-bold', getMetricColor(metrics.api.errorRate, 5, 10)]">
                {{ metrics.api.errorRate.toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Session Metrics -->
        <div class="admin-card">
          <h3 class="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Icon name="mdi:account-multiple" class="w-5 h-5" />
            Active Sessions
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <span class="text-sm text-gray-400">Active Now</span>
              <span class="text-lg font-bold text-green-500">{{ metrics.sessions.active }}</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <span class="text-sm text-gray-400">Total Sessions</span>
              <span class="text-lg font-bold text-gray-100">{{ metrics.sessions.total.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-card {
  @apply bg-gray-900/50 rounded-lg border border-gray-800 p-6;
}
</style>
