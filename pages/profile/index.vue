<template>
  <div class="max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold gradient-text mb-2">My Profile</h1>
      <p class="text-gray-400">Manage your account and view your GeoFlags journey</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-400">Loading profile...</p>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="space-y-6">
      <!-- Ban/Suspend Warning -->
      <div
        v-if="profile.status === 'BANNED'"
        class="glass-card bg-red-900/20 border border-red-500/50 p-6"
      >
        <div class="flex items-start gap-4">
          <Icon name="mdi:alert-octagon" class="w-8 h-8 text-red-500 flex-shrink-0" />
          <div class="flex-1">
            <h3 class="text-xl font-bold text-red-400 mb-2">Account Banned</h3>
            <p class="text-red-300 mb-2">
              {{ profile.banReason || 'Your account has been banned by an administrator.' }}
            </p>
            <p v-if="profile.bannedUntil" class="text-sm text-red-400">
              Ban expires: {{ formatDate(profile.bannedUntil) }}
            </p>
            <p v-else class="text-sm text-red-400">This is a permanent ban.</p>
          </div>
        </div>
      </div>

      <div
        v-else-if="profile.status === 'SUSPENDED'"
        class="glass-card bg-yellow-900/20 border border-yellow-500/50 p-6"
      >
        <div class="flex items-start gap-4">
          <Icon name="mdi:alert" class="w-8 h-8 text-yellow-500 flex-shrink-0" />
          <div class="flex-1">
            <h3 class="text-xl font-bold text-yellow-400 mb-2">Account Suspended</h3>
            <p class="text-yellow-300 mb-2">
              {{ profile.banReason || 'Your account has been suspended by an administrator.' }}
            </p>
            <p v-if="profile.bannedUntil" class="text-sm text-yellow-400">
              Suspension expires: {{ formatDate(profile.bannedUntil) }}
            </p>
            <p v-else class="text-sm text-yellow-400">This is an indefinite suspension.</p>
          </div>
        </div>
      </div>

      <!-- Unverified Email Warning -->
      <div
        v-if="profile && !(profile as any).emailVerified"
        class="glass-card bg-orange-900/20 border border-orange-500/50 p-6"
      >
        <div class="flex items-start gap-4">
          <Icon name="mdi:email-alert" class="w-8 h-8 text-orange-500 flex-shrink-0" />
          <div class="flex-1">
            <h3 class="text-xl font-bold text-orange-400 mb-2">Email Not Verified</h3>
            <p class="text-orange-300 mb-4">
              Please verify your email address to secure your account.
            </p>
            <button
              @click="resendVerification"
              :disabled="resending"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded font-medium disabled:opacity-50 transition-colors"
            >
              {{ resending ? 'Sending...' : 'Resend Verification Link' }}
            </button>
            <p
              v-if="resendMessage"
              :class="resendSuccess ? 'text-green-400' : 'text-red-400'"
              class="mt-3 text-sm font-medium"
            >
              {{ resendMessage }}
            </p>
          </div>
        </div>
      </div>

      <!-- Profile Header Card -->
      <div class="glass-card p-8">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Avatar -->
          <div class="relative">
            <div
              class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl overflow-hidden"
            >
              <img
                v-if="profile.avatarUrl"
                :src="getAvatarUrl(profile.avatarUrl)"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ profile.username.charAt(0).toUpperCase() }}</span>
            </div>
            <div
              class="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center"
              :class="{
                'bg-green-500': profile.status === 'ACTIVE',
                'bg-red-500': profile.status === 'BANNED',
                'bg-yellow-500': profile.status === 'SUSPENDED',
              }"
            >
              <Icon
                :name="
                  profile.status === 'ACTIVE'
                    ? 'mdi:check'
                    : profile.status === 'BANNED'
                      ? 'mdi:close'
                      : 'mdi:pause'
                "
                class="w-5 h-5 text-white"
              />
            </div>
          </div>

          <!-- User Info -->
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-3xl font-bold text-gray-100 mb-2">{{ profile.username }}</h2>
            <p class="text-gray-400 mb-4">{{ profile.email }}</p>

            <div class="flex flex-wrap gap-4 justify-center md:justify-start">
              <div class="flex items-center gap-2 text-sm">
                <Icon name="mdi:shield" class="w-4 h-4 text-blue-400" />
                <span class="text-gray-300 capitalize">{{ profile.role }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Icon name="mdi:calendar" class="w-4 h-4 text-green-400" />
                <span class="text-gray-300">Joined {{ formatDate(profile.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Settings Button -->
          <NuxtLink
            to="/profile/settings"
            class="glass-btn px-6 py-3 rounded-xl hover-lift flex items-center gap-2"
          >
            <Icon name="mdi:cog" class="w-5 h-5" />
            <span>Settings</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Games Played -->
        <div class="glass-card p-6 hover-lift">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Icon name="mdi:gamepad-variant" class="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-100">{{ stats?.totalGames || 0 }}</p>
              <p class="text-sm text-gray-400">Games Played</p>
            </div>
          </div>
        </div>

        <!-- Total Score -->
        <div class="glass-card p-6 hover-lift">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Icon name="mdi:star" class="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-100">
                {{ (stats?.totalScore || 0).toLocaleString() }}
              </p>
              <p class="text-sm text-gray-400">Total Score</p>
            </div>
          </div>
        </div>

        <!-- Average Score -->
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

        <!-- Current Streak -->
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

      <!-- Quick Navigation -->
      <div class="grid grid-cols-1 gap-6">
        <!-- Game Statistics -->
        <NuxtLink to="/profile/stats" class="glass-card p-6 hover-lift group cursor-pointer">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors"
              >
                <Icon name="mdi:chart-bar" class="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-100 mb-1">Detailed Statistics</h3>
                <p class="text-sm text-gray-400">View your complete game history and performance</p>
              </div>
            </div>
            <Icon
              name="mdi:chevron-right"
              class="w-6 h-6 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
            />
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, UserStats } from '~/types'

definePageMeta({
  middleware: 'auth',
})

const { user } = useAuth()
const profile = ref<User | null>(null)
const stats = ref<UserStats | null>(null)
const loading = ref(true)

const resending = ref(false)
const resendMessage = ref('')
const resendSuccess = ref(false)

const resendVerification = async () => {
  if (resending.value) return
  resending.value = true
  resendMessage.value = ''

  try {
    const { apiRequest } = useApi()
    const res: any = await apiRequest('/api/auth/resend-verification', { method: 'POST' })
    resendSuccess.value = true
    resendMessage.value = res.message || 'Verification email resent successfully'
  } catch (err: any) {
    resendSuccess.value = false
    resendMessage.value = err.data?.message || err.message || 'Failed to resend email'
  } finally {
    resending.value = false
  }
}

// Fetch profile data
const fetchProfile = async () => {
  try {
    loading.value = true

    // Always use the user from auth as profile data
    if (user.value) {
      profile.value = user.value

      // If user is banned or suspended, don't fetch additional data
      if (user.value.status === 'BANNED' || user.value.status === 'SUSPENDED') {
        // Set default empty stats
        stats.value = {
          totalGames: 0,
          totalScore: 0,
          averageScore: 0,
          highScores: {},
          gamesPerMode: {},
          averageScoresByMode: {},
          performanceOverTime: [],
          recentGames: [],
          activityByDayOfWeek: [],
          averageAccuracy: null,
          currentStreak: 0,
          longestStreak: 0,
          favorites: { count: 0 },
          learnMode: { countriesViewed: 0, totalViews: 0, masterred: 0 },
        }
        loading.value = false
        return
      }

      // Fetch stats only (profile is already from auth)
      const { apiRequest } = useApi()
      const statsData = await apiRequest('/api/profile/stats', { method: 'GET' })
      stats.value = statsData as UserStats
    }
  } catch (err: any) {
    // If fetching stats fails, just show empty stats
    console.error('Failed to load profile stats:', err)
    stats.value = {
      totalGames: 0,
      totalScore: 0,
      averageScore: 0,
      highScores: {},
      gamesPerMode: {},
      averageScoresByMode: {},
      performanceOverTime: [],
      recentGames: [],
      activityByDayOfWeek: [],
      averageAccuracy: null,
      currentStreak: 0,
      longestStreak: 0,
      favorites: { count: 0 },
      learnMode: { countriesViewed: 0, totalViews: 0, masterred: 0 },
    }
  } finally {
    loading.value = false
  }
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

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Load data on mount
onMounted(() => {
  fetchProfile()
})
</script>
