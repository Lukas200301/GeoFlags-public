<template>
  <div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <NuxtLink to="/profile" class="inline-flex items-center text-primary-400 hover:text-primary-300 mb-4 transition-colors">
        <Icon name="mdi:arrow-left" class="w-5 h-5 mr-2" />
        Back to Profile
      </NuxtLink>
      <h1 class="text-4xl font-bold gradient-text mb-2">Game Statistics</h1>
      <p class="text-gray-400">Track your progress and achievements across all game modes</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="glass-card p-12 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p class="text-gray-400">Loading statistics...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="glass-card bg-red-900/20 border border-red-500/50 p-6">
      <div class="flex items-center gap-3">
        <Icon name="mdi:alert-circle" class="w-6 h-6 text-red-400" />
        <p class="text-red-400">{{ error }}</p>
      </div>
    </div>

    <!-- Stats Content -->
    <div v-else-if="stats" class="space-y-6">
      <!-- Overall Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="glass-card p-6 hover-lift">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Icon name="mdi:gamepad-variant" class="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-100">{{ stats?.totalGames || 0 }}</p>
              <p class="text-sm text-gray-400">Total Games</p>
            </div>
          </div>
        </div>

        <div class="glass-card p-6 hover-lift">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Icon name="mdi:star" class="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-100">{{ (stats?.totalScore || 0).toLocaleString() }}</p>
              <p class="text-sm text-gray-400">Total Score</p>
            </div>
          </div>
        </div>

        <div class="glass-card p-6 hover-lift">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Icon name="mdi:chart-line" class="w-7 h-7 text-green-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-100">{{ stats?.averageScore || 0 }}</p>
              <p class="text-sm text-gray-400">Average Score</p>
            </div>
          </div>
        </div>

        <div class="glass-card p-6 hover-lift">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Icon name="mdi:fire" class="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-100">{{ stats?.currentStreak || 0 }}</p>
              <p class="text-sm text-gray-400">Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Charts -->
      <div v-if="stats && stats.totalGames > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Performance Over Time -->
        <div class="glass-card p-6">
          <h2 class="text-xl font-semibold gradient-text mb-4">Performance Over Time (Last 30 Days)</h2>
          <div v-if="stats?.performanceOverTime && stats.performanceOverTime.length > 0" class="h-64">
            <LineChart
              :labels="performanceLabels"
              :datasets="performanceDatasets"
              y-axis-label="Average Score"
            />
          </div>
          <div v-else class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <Icon name="mdi:chart-line-variant" class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No performance data available yet</p>
            </div>
          </div>
        </div>

        <!-- Recent Games Trend -->
        <div class="glass-card p-6">
          <h2 class="text-xl font-semibold gradient-text mb-4">Recent Games Performance (Last 20)</h2>
          <div v-if="stats?.recentGames && stats.recentGames.length > 0" class="h-64">
            <RecentGamesChart
              :games="recentGamesLimited"
            />
          </div>
          <div v-else class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <Icon name="mdi:chart-line" class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent games data available</p>
            </div>
          </div>
        </div>

        <!-- Average Scores by Mode -->
        <div class="glass-card p-6">
          <h2 class="text-xl font-semibold gradient-text mb-4">Average Score by Game Mode</h2>
          <div v-if="stats?.averageScoresByMode && Object.keys(stats.averageScoresByMode).length > 0" class="h-64">
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

        <!-- Games Distribution -->
        <div class="glass-card p-6">
          <h2 class="text-xl font-semibold gradient-text mb-4">Games Played by Mode</h2>
          <div v-if="stats?.gamesPerMode && Object.keys(stats.gamesPerMode).length > 0" class="h-64 flex items-center justify-center">
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
      </div>

      <!-- Activity by Day of Week -->
      <div v-if="stats && stats.totalGames > 0" class="glass-card p-6">
        <h2 class="text-xl font-semibold gradient-text mb-4">Activity by Day of Week</h2>
        <div v-if="stats?.activityByDayOfWeek && stats.activityByDayOfWeek.length > 0" class="h-80">
          <BarChart
            :labels="dayOfWeekLabels"
            :datasets="dayOfWeekDatasets"
            y-axis-label="Games Played"
          />
        </div>
        <div v-else class="h-80 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <Icon name="mdi:calendar-week" class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No activity data available yet</p>
          </div>
        </div>
      </div>

      <!-- High Scores by Mode -->
      <div class="glass-card p-6">
        <h2 class="text-2xl font-semibold gradient-text mb-6">High Scores by Game Mode</h2>

        <div v-if="stats?.highScores && Object.keys(stats?.highScores).length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(score, mode) in stats?.highScores"
            :key="mode"
            class="glass-card-dark p-4 hover-lift"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold text-gray-100">{{ formatGameMode(mode) }}</h3>
              <Icon name="mdi:trophy" class="w-5 h-5 text-yellow-400" />
            </div>
            <p class="text-3xl font-bold text-primary-400">{{ score }}</p>
            <div class="mt-2 text-sm text-gray-400">
              Games played: {{ stats?.gamesPerMode?.[mode] || 0 }}
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <Icon name="mdi:emoticon-sad-outline" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p class="text-gray-400">No games played yet. Start playing to see your high scores!</p>
        </div>
      </div>


      <!-- Achievements -->
      <div class="glass-card p-6">
        <h2 class="text-2xl font-semibold gradient-text mb-6">Achievements</h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- First Game Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.totalGames || 0) >= 1
                ? 'glass-card-dark border-primary-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:flag" class="w-12 h-12 mx-auto mb-2" :class="(stats?.totalGames || 0) >= 1 ? 'text-primary-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">First Steps</p>
            <p class="text-xs text-gray-400 mt-1">Play your first game</p>
          </div>

          <!-- 10 Games Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.totalGames || 0) >= 10
                ? 'glass-card-dark border-secondary-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:trophy" class="w-12 h-12 mx-auto mb-2" :class="(stats?.totalGames || 0) >= 10 ? 'text-secondary-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Getting Started</p>
            <p class="text-xs text-gray-400 mt-1">Play 10 games</p>
          </div>

          <!-- 50 Games Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.totalGames || 0) >= 50
                ? 'glass-card-dark border-green-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:medal" class="w-12 h-12 mx-auto mb-2" :class="(stats?.totalGames || 0) >= 50 ? 'text-green-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Dedicated Player</p>
            <p class="text-xs text-gray-400 mt-1">Play 50 games</p>
          </div>

          <!-- 100 Games Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.totalGames || 0) >= 100
                ? 'glass-card-dark border-purple-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:crown" class="w-12 h-12 mx-auto mb-2" :class="(stats?.totalGames || 0) >= 100 ? 'text-purple-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Centurion</p>
            <p class="text-xs text-gray-400 mt-1">Play 100 games</p>
          </div>

          <!-- 500 Games Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.totalGames || 0) >= 500
                ? 'glass-card-dark border-amber-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:fire" class="w-12 h-12 mx-auto mb-2" :class="(stats?.totalGames || 0) >= 500 ? 'text-amber-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Legend</p>
            <p class="text-xs text-gray-400 mt-1">Play 500 games</p>
          </div>

          <!-- High Score Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.averageScore || 0) >= 80
                ? 'glass-card-dark border-yellow-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:star" class="w-12 h-12 mx-auto mb-2" :class="(stats?.averageScore || 0) >= 80 ? 'text-yellow-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Expert</p>
            <p class="text-xs text-gray-400 mt-1">80+ average score</p>
          </div>

          <!-- Perfect Average Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.averageScore || 0) >= 95
                ? 'glass-card-dark border-pink-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:diamond" class="w-12 h-12 mx-auto mb-2" :class="(stats?.averageScore || 0) >= 95 ? 'text-pink-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Perfectionist</p>
            <p class="text-xs text-gray-400 mt-1">95+ average score</p>
          </div>

          <!-- 100 Total Score Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.totalScore || 0) >= 100
                ? 'glass-card-dark border-blue-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:counter" class="w-12 h-12 mx-auto mb-2" :class="(stats?.totalScore || 0) >= 100 ? 'text-blue-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Century Scorer</p>
            <p class="text-xs text-gray-400 mt-1">100+ total score</p>
          </div>

          <!-- 500 Total Score Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.totalScore || 0) >= 500
                ? 'glass-card-dark border-cyan-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:chart-line" class="w-12 h-12 mx-auto mb-2" :class="(stats?.totalScore || 0) >= 500 ? 'text-cyan-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">High Roller</p>
            <p class="text-xs text-gray-400 mt-1">500+ total score</p>
          </div>

          <!-- 1000 Total Score Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.totalScore || 0) >= 1000
                ? 'glass-card-dark border-orange-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:rocket" class="w-12 h-12 mx-auto mb-2" :class="(stats?.totalScore || 0) >= 1000 ? 'text-orange-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Score Master</p>
            <p class="text-xs text-gray-400 mt-1">1000+ total score</p>
          </div>

          <!-- Play All Modes Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              stats?.gamesPerMode && Object.keys(stats?.gamesPerMode).length >= 3
                ? 'glass-card-dark border-emerald-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:gamepad-variant" class="w-12 h-12 mx-auto mb-2" :class="stats?.gamesPerMode && Object.keys(stats?.gamesPerMode).length >= 3 ? 'text-emerald-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Explorer</p>
            <p class="text-xs text-gray-400 mt-1">Play all game modes</p>
          </div>

          <!-- Flag Expert Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.gamesPerMode?.GUESS_FLAG || 0) >= 25
                ? 'glass-card-dark border-red-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:flag-checkered" class="w-12 h-12 mx-auto mb-2" :class="(stats?.gamesPerMode?.GUESS_FLAG || 0) >= 25 ? 'text-red-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Flag Expert</p>
            <p class="text-xs text-gray-400 mt-1">25+ Guess the Flag games</p>
          </div>

          <!-- Speed Demon Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.gamesPerMode?.TIME_TRIAL || 0) >= 25
                ? 'glass-card-dark border-indigo-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:timer-sand" class="w-12 h-12 mx-auto mb-2" :class="(stats?.gamesPerMode?.TIME_TRIAL || 0) >= 25 ? 'text-indigo-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Speed Demon</p>
            <p class="text-xs text-gray-400 mt-1">25+ Time Trial games</p>
          </div>

          <!-- Geography Master Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.gamesPerMode?.FIND_CAPITAL || 0) >= 25
                ? 'glass-card-dark border-teal-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:map-marker" class="w-12 h-12 mx-auto mb-2" :class="(stats?.gamesPerMode?.FIND_CAPITAL || 0) >= 25 ? 'text-teal-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Geography Master</p>
            <p class="text-xs text-gray-400 mt-1">25+ Find Capital games</p>
          </div>

          <!-- Comparison Champion Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.gamesPerMode?.HIGHER_LOWER || 0) >= 25
                ? 'glass-card-dark border-purple-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:chevron-triple-up" class="w-12 h-12 mx-auto mb-2" :class="(stats?.gamesPerMode?.HIGHER_LOWER || 0) >= 25 ? 'text-purple-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Comparison Champion</p>
            <p class="text-xs text-gray-400 mt-1">25+ Higher/Lower games</p>
          </div>

          <!-- High Score in Flags Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              (stats?.highScores?.GUESS_FLAG || 0) >= 50
                ? 'glass-card-dark border-rose-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:flag-variant" class="w-12 h-12 mx-auto mb-2" :class="(stats?.highScores?.GUESS_FLAG || 0) >= 50 ? 'text-rose-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">Flag Virtuoso</p>
            <p class="text-xs text-gray-400 mt-1">Score 50+ in Guess the Flag</p>
          </div>

          <!-- All-Rounder Achievement -->
          <div
            :class="[
              'text-center p-4 rounded-xl border transition-all',
              stats?.gamesPerMode &&
              Object.keys(stats?.gamesPerMode).length >= 4 &&
              Object.values(stats?.gamesPerMode).every((count: number) => count >= 10)
                ? 'glass-card-dark border-fuchsia-500/50'
                : 'glass-card-dark opacity-50'
            ]"
          >
            <Icon name="mdi:cards-diamond" class="w-12 h-12 mx-auto mb-2" :class="stats?.gamesPerMode && Object.keys(stats?.gamesPerMode).length >= 4 && Object.values(stats?.gamesPerMode).every((count: number) => count >= 10) ? 'text-fuchsia-400' : 'text-gray-600'" />
            <p class="text-sm font-medium text-gray-100">All-Rounder</p>
            <p class="text-xs text-gray-400 mt-1">10+ games in all modes</p>
          </div>
        </div>
      </div>

      <!-- Game History -->
      <div class="glass-card p-6">
        <h2 class="text-2xl font-semibold gradient-text mb-6">Recent Games</h2>

        <div v-if="gameHistory.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-700">
                <th class="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                <th class="text-left py-3 px-4 text-gray-400 font-medium">Mode</th>
                <th class="text-center py-3 px-4 text-gray-400 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="game in paginatedHistory"
                :key="game.id"
                class="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
              >
                <td class="py-3 px-4 text-gray-300">{{ formatDate(game.createdAt) }}</td>
                <td class="py-3 px-4">
                  <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-300">
                    <Icon :name="getGameModeIcon(game.mode)" class="w-4 h-4" />
                    {{ formatGameMode(game.mode) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <span class="text-lg font-bold text-gray-100">{{ game.score }}</span>
                </td>
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

        <div v-else class="text-center py-12">
          <Icon name="mdi:history" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p class="text-gray-400">No game history available</p>
          <NuxtLink to="/play" class="btn-primary mt-4 inline-block">
            Play Your First Game
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserStats } from '~/types'
import LineChart from '~/components/charts/LineChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import DoughnutChart from '~/components/charts/DoughnutChart.vue'
import RecentGamesChart from '~/components/charts/RecentGamesChart.vue'

definePageMeta({
  middleware: 'auth',
})

interface GameRecord {
  id: number
  mode: string
  score: number
  timeSpent: number
  accuracy: number
  createdAt: string
}

const stats = ref<UserStats | null>(null)
const gameHistory = ref<GameRecord[]>([])
const loading = ref(true)
const error = ref('')
const currentPage = ref(1)
const itemsPerPage = 50

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(gameHistory.value.length / itemsPerPage))

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return gameHistory.value.slice(start, end)
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

// Chart data computed properties
const performanceLabels = computed(() => {
  if (!stats.value?.performanceOverTime) return []
  return stats.value.performanceOverTime.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
})

const performanceDatasets = computed(() => {
  if (!stats.value?.performanceOverTime) return []
  return [
    {
      label: 'Average Score',
      data: stats.value.performanceOverTime.map(item => item.averageScore),
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ]
})

// Limit recent games to last 20
const recentGamesLimited = computed(() => {
  if (!stats.value?.recentGames) return []
  return stats.value.recentGames.slice(0, 20)
})

const averageScoresModeLabels = computed(() => {
  if (!stats.value?.averageScoresByMode) return []
  return Object.keys(stats.value.averageScoresByMode).map(mode => formatGameMode(mode))
})

const averageScoresDatasets = computed(() => {
  if (!stats.value?.averageScoresByMode) return []
  return [
    {
      label: 'Average Score',
      data: Object.values(stats.value.averageScoresByMode),
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

const gamesDistributionLabels = computed(() => {
  if (!stats.value?.gamesPerMode) return []
  return Object.keys(stats.value.gamesPerMode).map(mode => formatGameMode(mode))
})

const gamesDistributionData = computed(() => {
  if (!stats.value?.gamesPerMode) return []
  return Object.values(stats.value.gamesPerMode)
})

const dayOfWeekLabels = computed(() => {
  if (!stats.value?.activityByDayOfWeek) return []
  return stats.value.activityByDayOfWeek.map(item => item.day)
})

const dayOfWeekDatasets = computed(() => {
  if (!stats.value?.activityByDayOfWeek) return []
  return [
    {
      label: 'Games Played',
      data: stats.value.activityByDayOfWeek.map(item => item.gamesPlayed),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
    },
  ]
})

// Fetch stats and game history
const fetchStats = async () => {
  try {
    loading.value = true
    error.value = ''

    const { apiRequest } = useApi()
    const [statsData, historyData] = await Promise.all([
      apiRequest('/api/profile/stats', { method: 'GET' }),
      apiRequest('/api/profile/game-history', { method: 'GET' })
    ])
    
    stats.value = statsData as UserStats
    gameHistory.value = historyData as GameRecord[]
  } catch (err: any) {
    error.value = err.message || 'Failed to load statistics'
  } finally {
    loading.value = false
  }
}

// Format game mode name
const formatGameMode = (mode: string) => {
  const modeNames: Record<string, string> = {
    FLAGS: 'Flags',
    CAPITALS: 'Capitals',
    MAPS: 'Maps',
    MIXED: 'Mixed',
    GUESS_FLAG: 'Guess the Flag',
    TIME_TRIAL: 'Time Trial',
    FIND_CAPITAL: 'Find the Capital',
    HIGHER_LOWER: 'Higher/Lower',
  }
  return modeNames[mode] || mode.replace(/_/g, ' ')
}
// Get game mode icon
const getGameModeIcon = (mode: string) => {
  const icons: Record<string, string> = {
    FLAGS: 'mdi:flag',
    CAPITALS: 'mdi:city',
    MAPS: 'mdi:map',
    MIXED: 'mdi:shuffle-variant',
    GUESS_FLAG: 'mdi:flag-variant',
    TIME_TRIAL: 'mdi:timer',
    FIND_CAPITAL: 'mdi:map-marker',
    HIGHER_LOWER: 'mdi:chevron-triple-up',
  }
  return icons[mode] || 'mdi:gamepad-variant'
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Load data on mount
onMounted(() => {
  fetchStats()
})
</script>
