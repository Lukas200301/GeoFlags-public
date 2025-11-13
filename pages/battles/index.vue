<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Battle Rooms
        </h1>
        <button
          @click="showCreateModal = true"
          class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
        >
          <Icon name="mdi:plus-circle" class="inline-block mr-2" />
          Create Room
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 mb-6 border-b border-white/10">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-3 font-semibold transition-all duration-300 relative',
            activeTab === tab.id
              ? 'text-purple-400'
              : 'text-gray-400 hover:text-gray-200'
          ]"
        >
          {{ tab.label }}
          <div
            v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500"
          />
        </button>
      </div>

      <!-- Available Rooms -->
      <div v-if="activeTab === 'rooms'" class="space-y-4">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>

        <div v-else-if="availableRooms.length === 0" class="text-center py-12 glass-card">
          <Icon name="mdi:door-open" class="text-6xl text-gray-600 mb-4" />
          <p class="text-gray-400 text-lg mb-4">No rooms available</p>
          <button
            @click="showCreateModal = true"
            class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all"
          >
            Create the First Room
          </button>
        </div>

        <div v-else>
          <div class="grid gap-4">
            <div
              v-for="room in paginatedRooms"
              :key="room.id"
              class="glass-card p-6 hover:scale-[1.02] transition-transform duration-300"
            >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-6 mb-4">
                  <!-- Host -->
                  <div class="flex items-center gap-3">
                    <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl font-bold animate-pulse">
                      {{ room.challenger.username[0].toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm text-gray-400">Host</div>
                      <div class="font-semibold text-lg">{{ room.challenger.username }}</div>
                    </div>
                  </div>

                  <Icon name="mdi:sword-cross" class="text-3xl text-purple-400" />

                  <!-- Waiting for opponent -->
                  <div class="flex items-center gap-3">
                    <div class="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                      <Icon name="mdi:account-question" class="text-3xl text-gray-500" />
                    </div>
                    <div>
                      <div class="text-sm text-gray-400">Waiting for</div>
                      <div class="font-semibold text-lg text-gray-500">Opponent</div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-4 text-sm">
                  <span class="px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 font-semibold">
                    {{ getModeName(room.mode) }}
                  </span>
                  <span class="text-gray-400">Created {{ formatRelativeTime(room.createdAt) }}</span>
                </div>
              </div>

              <button
                @click="joinRoom(room.id)"
                :disabled="room.challenger.id === currentUserId"
                class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="mdi:login" class="inline-block mr-2" />
                Join Room
              </button>
            </div>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="flex items-center justify-center gap-2 mt-6">
            <button
              @click="roomsPage = Math.max(1, roomsPage - 1)"
              :disabled="roomsPage === 1"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Icon name="mdi:chevron-left" />
            </button>
            <span class="px-4 py-2 text-gray-300">
              Page {{ roomsPage }} of {{ totalRoomsPages }}
            </span>
            <button
              @click="roomsPage = Math.min(totalRoomsPages, roomsPage + 1)"
              :disabled="roomsPage === totalRoomsPages"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Icon name="mdi:chevron-right" />
            </button>
          </div>
        </div>
      </div>

      <!-- My Active Battles -->
      <div v-if="activeTab === 'active'" class="space-y-4">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>

        <div v-else-if="activeBattles.length === 0" class="text-center py-12 glass-card">
          <Icon name="mdi:sword-cross" class="text-6xl text-gray-600 mb-4" />
          <p class="text-gray-400 text-lg">No active battles</p>
        </div>

        <div v-else>
          <div class="grid gap-4">
            <div
              v-for="battle in paginatedActiveBattles"
              :key="battle.id"
              class="glass-card p-6 hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              @click="joinBattle(battle.id)"
            >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-6 mb-4">
                  <!-- Player 1 -->
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center font-bold">
                      {{ battle.challenger.username[0].toUpperCase() }}
                    </div>
                    <span class="font-semibold">{{ battle.challenger.username }}</span>
                  </div>

                  <Icon name="mdi:sword-cross" class="text-2xl text-purple-400" />

                  <!-- Player 2 -->
                  <div class="flex items-center gap-3">
                    <div v-if="battle.opponent" class="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center font-bold">
                      {{ battle.opponent.username[0].toUpperCase() }}
                    </div>
                    <div v-else class="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                      <Icon name="mdi:help" />
                    </div>
                    <span class="font-semibold">{{ battle.opponent?.username || 'Waiting...' }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-4 text-sm text-gray-400">
                  <span class="px-3 py-1 bg-purple-500/20 rounded-full">
                    {{ getModeName(battle.mode) }}
                  </span>
                  <span>Status: {{ battle.status === 'WAITING' ? 'Waiting for opponent' : 'In Progress' }}</span>
                </div>
              </div>

              <button
                class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all"
              >
                {{ battle.status === 'WAITING' ? 'Cancel' : 'Continue Battle' }}
              </button>
            </div>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="flex items-center justify-center gap-2 mt-6">
            <button
              @click="activePage = Math.max(1, activePage - 1)"
              :disabled="activePage === 1"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Icon name="mdi:chevron-left" />
            </button>
            <span class="px-4 py-2 text-gray-300">
              Page {{ activePage }} of {{ totalActivePages }}
            </span>
            <button
              @click="activePage = Math.min(totalActivePages, activePage + 1)"
              :disabled="activePage === totalActivePages"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Icon name="mdi:chevron-right" />
            </button>
          </div>
        </div>
      </div>

      <!-- Battle History -->
      <div v-if="activeTab === 'history'" class="space-y-4">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>

        <div v-else-if="battleHistory.length === 0" class="text-center py-12 glass-card">
          <p class="text-gray-400">No battle history</p>
        </div>

        <div v-else>
          <div class="grid gap-4">
            <div
              v-for="battle in paginatedHistory"
              :key="battle.id"
              class="glass-card p-6"
            >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-6 mb-4">
                  <!-- Player 1 -->
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center font-bold relative">
                      {{ battle.challenger.username[0].toUpperCase() }}
                      <div v-if="battle.winnerId === battle.challenger.id" class="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Icon name="mdi:crown" class="text-sm" />
                      </div>
                    </div>
                    <div>
                      <div class="font-semibold">{{ battle.challenger.username }}</div>
                      <div class="text-sm text-gray-400">
                        {{ getChallengerScore(battle) }} points
                      </div>
                    </div>
                  </div>

                  <Icon name="mdi:sword-cross" class="text-2xl text-gray-500" />

                  <!-- Player 2 -->
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center font-bold relative">
                      {{ battle.opponent.username[0].toUpperCase() }}
                      <div v-if="battle.winnerId === battle.opponent.id" class="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Icon name="mdi:crown" class="text-sm" />
                      </div>
                    </div>
                    <div>
                      <div class="font-semibold">{{ battle.opponent.username }}</div>
                      <div class="text-sm text-gray-400">
                        {{ getOpponentScore(battle) }} points
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-4 text-sm text-gray-400">
                  <span class="px-3 py-1 bg-purple-500/20 rounded-full">
                    {{ getModeName(battle.mode) }}
                  </span>
                  <span>{{ formatDate(battle.completedAt) }}</span>
                </div>
              </div>
            </div>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="flex items-center justify-center gap-2 mt-6">
            <button
              @click="historyPage = Math.max(1, historyPage - 1)"
              :disabled="historyPage === 1"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Icon name="mdi:chevron-left" />
            </button>
            <span class="px-4 py-2 text-gray-300">
              Page {{ historyPage }} of {{ totalHistoryPages }}
            </span>
            <button
              @click="historyPage = Math.min(totalHistoryPages, historyPage + 1)"
              :disabled="historyPage === totalHistoryPages"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Icon name="mdi:chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Room Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 md:left-64 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="showCreateModal = false"
    >
      <div class="glass-card p-8 max-w-md w-full m-4" @click.stop>
        <h2 class="text-2xl font-bold mb-4">Create Battle Room</h2>
        <p class="text-gray-300 mb-6">Choose a game mode for your battle room:</p>

        <div class="space-y-3">
          <button
            v-for="mode in gameModes"
            :key="mode.id"
            @click="createRoom(mode.id)"
            class="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all text-left"
          >
            <div class="font-bold text-lg">{{ mode.name }}</div>
            <div class="text-sm opacity-80">{{ mode.description }}</div>
          </button>
        </div>

        <button
          @click="showCreateModal = false"
          class="mt-4 w-full px-4 py-3 bg-white/10 rounded-lg font-semibold hover:bg-white/20 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types'

definePageMeta({
  middleware: 'auth'
})

interface BattlesResponse {
  battles: any[]
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { getCsrfToken } = useApi()

const activeTab = ref<'rooms' | 'active' | 'history'>('rooms')
const loading = ref(false)
const showCreateModal = ref(false)

const availableRooms = ref<any[]>([])
const activeBattles = ref<any[]>([])
const battleHistory = ref<any[]>([])
const gameModes = ref<any[]>([])

// Pagination
const roomsPage = ref(1)
const activePage = ref(1)
const historyPage = ref(1)
const itemsPerPage = 20

const user = useState<User | null>('user')
const currentUserId = computed(() => user.value?.id)

// Paginated data
const paginatedRooms = computed(() => {
  const start = (roomsPage.value - 1) * itemsPerPage
  return availableRooms.value.slice(start, start + itemsPerPage)
})

const paginatedActiveBattles = computed(() => {
  const start = (activePage.value - 1) * itemsPerPage
  return activeBattles.value.slice(start, start + itemsPerPage)
})

const paginatedHistory = computed(() => {
  const start = (historyPage.value - 1) * itemsPerPage
  return battleHistory.value.slice(start, start + itemsPerPage)
})

// Total pages
const totalRoomsPages = computed(() => Math.ceil(availableRooms.value.length / itemsPerPage))
const totalActivePages = computed(() => Math.ceil(activeBattles.value.length / itemsPerPage))
const totalHistoryPages = computed(() => Math.ceil(battleHistory.value.length / itemsPerPage))

const tabs = computed(() => [
  { id: 'rooms' as 'rooms' | 'active' | 'history', label: 'Available Rooms', badge: availableRooms.value.length || null },
  { id: 'active' as 'rooms' | 'active' | 'history', label: 'My Battles', badge: activeBattles.value.length || null },
  { id: 'history' as 'rooms' | 'active' | 'history', label: 'History' }
])

let refreshInterval: NodeJS.Timeout | null = null

onMounted(async () => {
  await Promise.all([
    loadAvailableRooms(),
    loadActiveBattles(),
    loadBattleHistory(),
    loadGameModes()
  ])

  // Auto-refresh rooms every 5 seconds when on rooms tab
  refreshInterval = setInterval(async () => {
    if (activeTab.value === 'rooms') {
      await loadAvailableRooms()
    }
  }, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})

watch(activeTab, async (newTab) => {
  if (newTab === 'rooms') {
    await loadAvailableRooms()
  } else if (newTab === 'active') {
    await loadActiveBattles()
  } else if (newTab === 'history') {
    await loadBattleHistory()
  }
})

async function loadAvailableRooms() {
  try {
    if (activeTab.value === 'rooms') {
      loading.value = true
    }
    const data = await $fetch<BattlesResponse>(`${apiBase}/api/battles/rooms`, {
      credentials: 'include'
    })
    availableRooms.value = data.battles
  } catch (error) {
    console.error('Failed to load available rooms:', error)
  } finally {
    loading.value = false
  }
}

async function loadActiveBattles() {
  try {
    loading.value = true
    const data = await $fetch<BattlesResponse>(`${apiBase}/api/battles/active`, {
      credentials: 'include'
    })
    activeBattles.value = data.battles
  } catch (error) {
    console.error('Failed to load active battles:', error)
  } finally {
    loading.value = false
  }
}

async function loadBattleHistory() {
  try {
    loading.value = true
    const data = await $fetch<BattlesResponse>(`${apiBase}/api/battles/history`, {
      credentials: 'include'
    })
    battleHistory.value = data.battles
  } catch (error) {
    console.error('Failed to load battle history:', error)
  } finally {
    loading.value = false
  }
}

async function loadGameModes() {
  try {
    const data = await $fetch(`${apiBase}/api/game/modes`)
    // Filter for battle modes only (modes starting with BATTLE_)
    gameModes.value = data.modes.filter((mode: any) => 
      mode.id.startsWith('BATTLE_')
    )
  } catch (error) {
    console.error('Failed to load game modes:', error)
    gameModes.value = []
  }
}

async function createRoom(mode: string) {
  try {
    const csrfToken = await getCsrfToken()
    const response = await $fetch(`${apiBase}/api/battles/rooms/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken
      },
      body: { mode }
    })
    showCreateModal.value = false
    // Navigate to the created room
    navigateTo(`/battles/${response.battle.id}`)
  } catch (error: any) {
    alert(error.data?.error || 'Failed to create room')
  }
}

async function joinRoom(battleId: string) {
  try {
    const csrfToken = await getCsrfToken()
    await $fetch(`${apiBase}/api/battles/rooms/${battleId}/join`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })
    // Navigate to the battle
    navigateTo(`/battles/${battleId}`)
  } catch (error: any) {
    alert(error.data?.error || 'Failed to join room')
    // Refresh rooms in case it was taken
    await loadAvailableRooms()
  }
}

function joinBattle(battleId: string) {
  navigateTo(`/battles/${battleId}`)
}

function getModeName(modeId: string) {
  const mode = gameModes.value.find(m => m.id === modeId)
  return mode?.name || modeId
}

function getChallengerScore(battle: any) {
  const participant = battle.participants.find((p: any) => p.userId === battle.challengerId)
  return participant?.score || 0
}

function getOpponentScore(battle: any) {
  const participant = battle.participants.find((p: any) => p.userId === battle.opponentId)
  return participant?.score || 0
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString()
}

function formatRelativeTime(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
</script>
