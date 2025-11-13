<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-100 mb-2">Solo Play</h1>
      <p class="text-gray-400">Challenge yourself and compete on the leaderboard</p>
    </div>

    <!-- Registration Required Warning (for guests) -->
    <div v-if="!user && requireRegistration" class="registration-card relative overflow-hidden mb-8">
      <!-- Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-indigo-600/10"></div>
      <div class="absolute inset-0 bg-blue-500/5 backdrop-blur-sm"></div>

      <!-- Decorative Elements -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <!-- Content -->
      <div class="relative z-10 p-8">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <!-- Icon with animated glow -->
          <div class="relative flex-shrink-0">
            <div class="absolute inset-0 bg-blue-500 blur-xl opacity-30 animate-pulse"></div>
            <div class="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Icon name="mdi:account-alert" class="w-12 h-12 text-white" />
            </div>
          </div>

          <!-- Text Content -->
          <div class="flex-1">
            <h3 class="text-2xl md:text-3xl font-bold mb-3">
              <span class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Registration Required
              </span>
            </h3>
            <p class="text-gray-300 text-lg mb-6 leading-relaxed">
              Create your free account to start playing! Join our community and track your progress, compete on leaderboards, and master geography.
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4">
              <NuxtLink to="/auth/register" class="registration-btn registration-btn-primary group">
                <Icon name="mdi:account-plus" class="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Create Account</span>
                <Icon name="mdi:arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </NuxtLink>
              <NuxtLink to="/auth/login" class="registration-btn registration-btn-secondary group">
                <Icon name="mdi:login" class="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Sign In</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Decorative Corner Accent -->
          <div class="hidden lg:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-bl-full"></div>
        </div>
      </div>

      <!-- Border Glow -->
      <div class="absolute inset-0 rounded-xl border border-blue-500/30 pointer-events-none"></div>
    </div>

    <!-- Ban/Suspend Warning -->
    <div v-if="user?.status === 'BANNED'" class="card bg-red-900/20 border border-red-500/50 p-6 mb-8">
      <div class="flex items-start gap-4">
        <Icon name="mdi:alert-octagon" class="w-8 h-8 text-red-500 flex-shrink-0" />
        <div class="flex-1">
          <h3 class="text-xl font-bold text-red-400 mb-2">Account Banned - Cannot Play</h3>
          <p class="text-red-300 mb-2">{{ user.banReason || 'Your account has been banned by an administrator.' }}</p>
          <p v-if="user.bannedUntil" class="text-sm text-red-400">
            Ban expires: {{ formatDate(user.bannedUntil) }}
          </p>
          <p v-else class="text-sm text-red-400">
            This is a permanent ban.
          </p>
        </div>
      </div>
    </div>

    <div v-else-if="user?.status === 'SUSPENDED'" class="card bg-yellow-900/20 border border-yellow-500/50 p-6 mb-8">
      <div class="flex items-start gap-4">
        <Icon name="mdi:alert" class="w-8 h-8 text-yellow-500 flex-shrink-0" />
        <div class="flex-1">
          <h3 class="text-xl font-bold text-yellow-400 mb-2">Account Suspended - Cannot Play</h3>
          <p class="text-yellow-300 mb-2">{{ user.banReason || 'Your account has been suspended by an administrator.' }}</p>
          <p v-if="user.bannedUntil" class="text-sm text-yellow-400">
            Suspension expires: {{ formatDate(user.bannedUntil) }}
          </p>
          <p v-else class="text-sm text-yellow-400">
            This is an indefinite suspension.
          </p>
        </div>
      </div>
    </div>

    <!-- Only show game modes if user is not banned or suspended AND (user is logged in OR registration not required) -->
    <template v-if="(!user || user.status === 'ACTIVE') && (user || !requireRegistration)">
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="card p-6 animate-pulse">
          <div class="w-16 h-16 bg-gray-700 rounded-xl mb-4"></div>
          <div class="h-6 bg-gray-700 rounded mb-2"></div>
          <div class="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>

      <!-- Game Modes Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GameCard
          v-for="mode in gameModes"
          :key="mode.id"
          :mode="mode"
          @click="selectMode(mode.id)"
        />
      </div>

      <!-- Error State -->
      <div v-if="error" class="card p-6 text-center">
        <Icon name="mdi:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p class="text-gray-300 mb-4">{{ error }}</p>
        <button @click="fetchGameModes" class="btn-primary">Try Again</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { GameModeConfig } from '~/types'

/**
 * Game mode selection page
 * Displays all available game modes
 */
definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { getGameModes } = useApi()
const { user } = useAuth()
const { requireRegistration, fetchSystemSettings } = useSystemSettings()

const gameModes = ref<GameModeConfig[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Icon mapping for game modes
const iconMap: Record<string, string> = {
  FLAGS: 'mdi:flag',
  CAPITALS: 'mdi:city',
  MAPS: 'mdi:map',
  MIXED: 'mdi:shuffle-variant',
  GUESS_FLAG: 'mdi:flag-checkered',
  TIME_TRIAL: 'mdi:timer-sand',
  FIND_CAPITAL: 'mdi:map-marker',
  HIGHER_LOWER: 'mdi:chevron-triple-up',
}

// Fetch game modes on mount
const fetchGameModes = async () => {
  try {
    loading.value = true
    error.value = null

    const modes = await getGameModes()
    // Add icon property to each mode
    gameModes.value = modes
      .filter((mode) => mode.enabled)
      .map((mode) => ({
        ...mode,
        icon: iconMap[mode.id] || 'mdi:gamepad-variant',
      }))
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load game modes'
  } finally {
    loading.value = false
  }
}
const selectMode = (modeId: string) => {
  // Route based on game mode
  if (modeId === 'GUESS_FLAG') {
    router.push('/play/guess-the-flag')
  } else if (modeId === 'TIME_TRIAL') {
    router.push('/play/time-trial')
  } else if (modeId === 'FIND_CAPITAL') {
    router.push('/play/find-capital')
  } else if (modeId === 'HIGHER_LOWER') {
    router.push('/play/higher-lower')
  } else {
    // For other modes, use the [mode] folder
    router.push(`/play/${modeId.toLowerCase()}`)
  }
}

onMounted(() => {
  fetchSystemSettings()
  fetchGameModes()
})
</script>

<style scoped>
.registration-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border-radius: 1.5rem;
  transition: all 0.3s ease-in-out;
}

.registration-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease-in-out;
  text-decoration: none;
}

.registration-btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.registration-btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.registration-btn-secondary {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 2px solid rgba(59, 130, 246, 0.3);
}

.registration-btn-secondary:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}
</style>
