<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-100 mb-2">Game Modes Management</h1>
      <p class="text-gray-400">Configure available game modes and system settings</p>
    </div>

    <!-- System Settings Card -->
    <div class="card p-6 mb-8">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-100 mb-2">System Settings</h2>
          <p class="text-gray-400 text-sm">Control global game access settings</p>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Require Registration Toggle -->
        <div class="flex items-center justify-between p-4 glass-card-dark rounded-xl">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-100 mb-1">Require Registration</h3>
            <p class="text-sm text-gray-400">When enabled, users must create an account to play games. Disable to allow guest play.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              :checked="requireRegistration"
              @change="toggleRegistrationRequirement"
              class="sr-only peer"
              :disabled="settingsLoading"
            />
            <div
              class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-900 after:border-gray-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
            ></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="i in 4" :key="i" class="card p-6 animate-pulse">
        <div class="h-16 w-16 bg-gray-700 rounded-xl mb-4"></div>
        <div class="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-700 rounded w-full"></div>
      </div>
    </div>

    <!-- Game Modes Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="mode in gameModes" :key="mode.id" class="card p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-4">
            <div
              class="w-16 h-16 rounded-xl flex items-center justify-center"
              :class="mode.enabled ? 'bg-gradient-to-br from-primary-400 to-primary-600' : 'bg-gray-300'"
            >
              <Icon :name="mode.icon" class="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-100 capitalize">{{ mode.name }}</h3>
              <p class="text-sm text-gray-400">{{ mode.id }}</p>
            </div>
          </div>

          <!-- Enable/Disable Toggle -->
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="mode.enabled"
              @change="toggleMode(mode)"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-900 after:border-gray-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
            ></div>
          </label>
        </div>

        <p class="text-gray-300 mb-4">{{ mode.description }}</p>

        <div class="flex items-center justify-between pt-4 border-t border-gray-800">
          <span
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="mode.enabled ? 'bg-green-900/30 text-green-700' : 'bg-gray-800 text-gray-300'"
          >
            {{ mode.enabled ? 'Enabled' : 'Disabled' }}
          </span>
          <button
            @click="openEditModal(mode)"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Edit Details
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <AdminModal
      v-model="editModal.open"
      title="Edit Game Mode"
      confirm-text="Save Changes"
      :loading="editModal.loading"
      @confirm="handleSaveChanges"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            v-model="editModal.data.name"
            type="text"
            class="input-field"
            placeholder="Game mode name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            v-model="editModal.data.description"
            rows="3"
            class="input-field"
            placeholder="Game mode description"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Icon</label>
          <input
            v-model="editModal.data.icon"
            type="text"
            class="input-field"
            placeholder="mdi:icon-name"
          />
        </div>

        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-300">Enabled</label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="editModal.data.enabled"
              type="checkbox"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-900 after:border-gray-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
            ></div>
          </label>
        </div>
      </div>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
/**
 * Admin game modes management page
 *
 * SECURITY: Protected by admin middleware
 */
definePageMeta({
  middleware: 'admin',
})

const { apiRequest } = useApi()
const toast = useToast()

interface GameModeAdmin {
  id: string
  name: string
  description: string | null
  icon: string
  enabled: boolean
  playCount: number
  createdAt: string
  updatedAt: string
}

const gameModes = ref<GameModeAdmin[]>([])
const loading = ref(true)

const requireRegistration = ref(false)
const settingsLoading = ref(false)

const editModal = reactive({
  open: false,
  modeId: '',
  data: {
    name: '',
    description: '',
    icon: '',
    enabled: false,
  },
  loading: false,
})

const fetchGameModes = async () => {
  try {
    loading.value = true

    const response = await apiRequest<{ gameModes: GameModeAdmin[] }>('/api/admin/game-modes', {
      requiresAuth: true,
    })
    gameModes.value = response.gameModes
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to load game modes'
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const fetchSystemSettings = async () => {
  try {
    const response = await apiRequest<{ requireRegistration: boolean }>('/api/admin/system/settings', {
      requiresAuth: true,
    })
    requireRegistration.value = response.requireRegistration
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to load system settings'
    toast.error(errorMessage)
  }
}

const toggleRegistrationRequirement = async () => {
  try {
    settingsLoading.value = true
    const newValue = !requireRegistration.value

    await apiRequest('/api/admin/system/settings', {
      method: 'PUT',
      body: { requireRegistration: newValue },
      requiresAuth: true,
    })

    requireRegistration.value = newValue
    toast.success(
      newValue
        ? 'Registration now required to play games'
        : 'Guest play enabled - registration no longer required'
    )
  } catch (err: any) {
    toast.error(err.message || 'Failed to update setting')
  } finally {
    settingsLoading.value = false
  }
}

const toggleMode = async (mode: GameModeAdmin) => {
  try {
    await apiRequest(`/api/admin/game-modes/${mode.id}`, {
      method: 'PUT',
      body: { enabled: !mode.enabled },
      requiresAuth: true,
    })

    // Update local data
    const index = gameModes.value.findIndex((m) => m.id === mode.id)
    if (index !== -1) {
      gameModes.value[index].enabled = !mode.enabled
    }

    toast.success(`Game mode ${!mode.enabled ? 'enabled' : 'disabled'}`)
  } catch (err: any) {
    toast.error(err.message || 'Failed to update game mode')
  }
}

const openEditModal = (mode: GameModeAdmin) => {
  editModal.modeId = mode.id
  editModal.data = {
    name: mode.name,
    description: mode.description || '',
    icon: mode.icon,
    enabled: mode.enabled,
  }
  editModal.open = true
}

const handleSaveChanges = async () => {
  try {
    editModal.loading = true

    await apiRequest(`/api/admin/game-modes/${editModal.modeId}`, {
      method: 'PUT',
      body: editModal.data,
      requiresAuth: true,
    })

    // Update local data
    const index = gameModes.value.findIndex((m) => m.id === editModal.modeId)
    if (index !== -1) {
      gameModes.value[index] = { ...gameModes.value[index], ...editModal.data }
    }

    editModal.open = false
    toast.success('Game mode updated successfully')
  } catch (err: any) {
    toast.error(err.message || 'Failed to update game mode')
  } finally {
    editModal.loading = false
  }
}

onMounted(() => {
  fetchGameModes()
  fetchSystemSettings()
})
</script>
