<template>
  <div class="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold gradient-text mb-2">Analytics Dashboard</h1>
        <p class="text-gray-400">Track growth, usage trends, and key metrics</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="loadAnalytics"
          class="glass-btn px-4 py-2 rounded-xl hover-lift flex items-center gap-2"
        >
          <Icon name="mdi:refresh" class="w-5 h-5" />
          Refresh
        </button>
        <select
          v-model="timeRange"
          @change="loadAnalytics"
          class="px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="mdi:loading" class="w-12 h-12 text-blue-500 animate-spin mx-auto" />
      <p class="text-gray-400 mt-4">Loading analytics...</p>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="glass-card p-6 hover-lift animate-fade-in-up stagger-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Total Users</p>
              <p class="text-3xl font-bold gradient-text mt-1">{{ analytics.totalUsers }}</p>
              <p class="text-xs text-green-400 mt-1">
                +{{ analytics.newUsers }} this period
              </p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Icon name="mdi:account-group" class="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div class="glass-card p-6 hover-lift animate-fade-in-up stagger-2">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Games Played</p>
              <p class="text-3xl font-bold gradient-text mt-1">{{ analytics.totalGames }}</p>
              <p class="text-xs text-green-400 mt-1">
                +{{ analytics.newGames }} this period
              </p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Icon name="mdi:gamepad-variant" class="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div class="glass-card p-6 hover-lift animate-fade-in-up stagger-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Active Users</p>
              <p class="text-3xl font-bold gradient-text mt-1">{{ analytics.activeUsers }}</p>
              <p class="text-xs text-gray-400 mt-1">
                Last 24 hours
              </p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Icon name="mdi:account-check" class="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div class="glass-card p-6 hover-lift animate-fade-in-up stagger-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Avg. Session</p>
              <p class="text-3xl font-bold gradient-text mt-1">{{ analytics.avgSessionTime }}m</p>
              <p class="text-xs text-gray-400 mt-1">
                Per user
              </p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Icon name="mdi:clock-outline" class="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- User Growth Chart -->
        <div class="glass-card p-6 animate-fade-in-up stagger-5">
          <h2 class="text-xl font-semibold gradient-text mb-4">User Growth</h2>
          <div class="h-64">
            <canvas ref="userGrowthChart"></canvas>
          </div>
        </div>

        <!-- Game Activity Chart -->
        <div class="glass-card p-6 animate-fade-in-up stagger-6">
          <h2 class="text-xl font-semibold gradient-text mb-4">Game Activity</h2>
          <div class="h-64">
            <canvas ref="gameActivityChart"></canvas>
          </div>
        </div>

        <!-- Game Mode Popularity -->
        <div class="glass-card p-6 animate-fade-in-up stagger-7">
          <h2 class="text-xl font-semibold gradient-text mb-4">Game Mode Popularity</h2>
          <div class="h-64">
            <canvas ref="gameModeChart"></canvas>
          </div>
        </div>

        <!-- Peak Hours Chart -->
        <div class="glass-card p-6 animate-fade-in-up stagger-8">
          <h2 class="text-xl font-semibold gradient-text mb-4">Peak Usage Hours</h2>
          <div class="h-64">
            <canvas ref="peakHoursChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Detailed Stats Table -->
      <div class="glass-card p-6 animate-fade-in-up stagger-9">
        <h2 class="text-xl font-semibold gradient-text mb-4">Detailed Metrics</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-4 glass-card-dark rounded-xl">
            <p class="text-gray-400 text-sm">User Retention Rate</p>
            <p class="text-2xl font-bold gradient-text mt-1">{{ analytics.retentionRate }}%</p>
          </div>
          <div class="p-4 glass-card-dark rounded-xl">
            <p class="text-gray-400 text-sm">Avg. Games per User</p>
            <p class="text-2xl font-bold gradient-text mt-1">{{ analytics.avgGamesPerUser }}</p>
          </div>
          <div class="p-4 glass-card-dark rounded-xl">
            <p class="text-gray-400 text-sm">Top Score Today</p>
            <p class="text-2xl font-bold gradient-text mt-1">{{ analytics.topScoreToday }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * Admin Analytics Dashboard Page
 *
 * Features:
 * - User growth over time
 * - Game activity trends
 * - Game mode popularity
 * - Peak usage hours
 * - Retention metrics
 *
 * SECURITY: Protected by admin middleware
 */
import { Chart, registerables } from 'chart.js'

definePageMeta({
  middleware: 'admin',
})

Chart.register(...registerables)

const toast = useToast()

interface AnalyticsData {
  totalUsers: number
  newUsers: number
  activeUsers: number
  totalGames: number
  newGames: number
  avgSessionTime: number
  retentionRate: number
  avgGamesPerUser: number
  topScoreToday: number
  userGrowthData: { labels: string[]; data: number[] }
  gameActivityData: { labels: string[]; data: number[] }
  gameModeData: { labels: string[]; data: number[] }
  peakHoursData: { labels: string[]; data: number[] }
}

// State
const loading = ref(true)
const timeRange = ref('30d')
const analytics = ref<AnalyticsData>({
  totalUsers: 0,
  newUsers: 0,
  activeUsers: 0,
  totalGames: 0,
  newGames: 0,
  avgSessionTime: 0,
  retentionRate: 0,
  avgGamesPerUser: 0,
  topScoreToday: 0,
  userGrowthData: { labels: [], data: [] },
  gameActivityData: { labels: [], data: [] },
  gameModeData: { labels: [], data: [] },
  peakHoursData: { labels: [], data: [] },
})

// Chart refs
const userGrowthChart = ref<HTMLCanvasElement | null>(null)
const gameActivityChart = ref<HTMLCanvasElement | null>(null)
const gameModeChart = ref<HTMLCanvasElement | null>(null)
const peakHoursChart = ref<HTMLCanvasElement | null>(null)

// Chart instances
let userGrowthChartInstance: Chart | null = null
let gameActivityChartInstance: Chart | null = null
let gameModeChartInstance: Chart | null = null
let peakHoursChartInstance: Chart | null = null

// Load analytics data
async function loadAnalytics() {
  try {
    loading.value = true

    // Fetch analytics data from backend
    const response = await $fetch<AnalyticsData>(`/api/admin/analytics?range=${timeRange.value}`)

    analytics.value = response

    // Update charts after data is loaded
    await nextTick()
    renderCharts()
  } catch (error: any) {
    toast.error(error.data?.message || 'Failed to load analytics')

    // Use mock data for demonstration
    loadMockData()
    await nextTick()
    renderCharts()
  } finally {
    loading.value = false
  }
}

// Load mock data for demonstration
function loadMockData() {
  const days = parseInt(timeRange.value)
  const labels = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (Math.min(days, 30) - i - 1))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  analytics.value = {
    totalUsers: 1234,
    newUsers: 156,
    activeUsers: 89,
    totalGames: 5678,
    newGames: 423,
    avgSessionTime: 12,
    retentionRate: 78,
    avgGamesPerUser: 4.6,
    topScoreToday: 9850,
    userGrowthData: {
      labels,
      data: Array.from({ length: labels.length }, (_, i) => Math.floor(100 + i * 10 + Math.random() * 50)),
    },
    gameActivityData: {
      labels,
      data: Array.from({ length: labels.length }, (_, i) => Math.floor(50 + i * 5 + Math.random() * 30)),
    },
    gameModeData: {
      labels: ['Guess the Flag'],
      data: [100],
    },
    peakHoursData: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      data: [20, 15, 45, 80, 95, 75],
    },
  }
}

// Render all charts
function renderCharts() {
  renderUserGrowthChart()
  renderGameActivityChart()
  renderGameModeChart()
  renderPeakHoursChart()
}

// Render user growth chart
function renderUserGrowthChart() {
  if (!userGrowthChart.value) return

  if (userGrowthChartInstance) {
    userGrowthChartInstance.destroy()
  }

  const ctx = userGrowthChart.value.getContext('2d')
  if (!ctx) return

  userGrowthChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: analytics.value.userGrowthData.labels,
      datasets: [{
        label: 'New Users',
        data: analytics.value.userGrowthData.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
          },
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
          },
        },
      },
    },
  })
}

// Render game activity chart
function renderGameActivityChart() {
  if (!gameActivityChart.value) return

  if (gameActivityChartInstance) {
    gameActivityChartInstance.destroy()
  }

  const ctx = gameActivityChart.value.getContext('2d')
  if (!ctx) return

  gameActivityChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: analytics.value.gameActivityData.labels,
      datasets: [{
        label: 'Games Played',
        data: analytics.value.gameActivityData.data,
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
          },
        },
      },
    },
  })
}

// Render game mode chart
function renderGameModeChart() {
  if (!gameModeChart.value) return

  if (gameModeChartInstance) {
    gameModeChartInstance.destroy()
  }

  const ctx = gameModeChart.value.getContext('2d')
  if (!ctx) return

  gameModeChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: analytics.value.gameModeData.labels,
      datasets: [{
        data: analytics.value.gameModeData.data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(34, 197, 94)',
          'rgb(251, 146, 60)',
        ],
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255, 255, 255, 0.8)',
            padding: 15,
          },
        },
      },
    },
  })
}

// Render peak hours chart
function renderPeakHoursChart() {
  if (!peakHoursChart.value) return

  if (peakHoursChartInstance) {
    peakHoursChartInstance.destroy()
  }

  const ctx = peakHoursChart.value.getContext('2d')
  if (!ctx) return

  peakHoursChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: analytics.value.peakHoursData.labels,
      datasets: [{
        label: 'Active Users',
        data: analytics.value.peakHoursData.data,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(34, 197, 94)',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
            backdropColor: 'transparent',
          },
          pointLabels: {
            color: 'rgba(255, 255, 255, 0.8)',
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  })
}

// Load analytics on mount
onMounted(() => {
  loadAnalytics()
})

// Cleanup charts on unmount
onBeforeUnmount(() => {
  if (userGrowthChartInstance) userGrowthChartInstance.destroy()
  if (gameActivityChartInstance) gameActivityChartInstance.destroy()
  if (gameModeChartInstance) gameModeChartInstance.destroy()
  if (peakHoursChartInstance) peakHoursChartInstance.destroy()
})
</script>
