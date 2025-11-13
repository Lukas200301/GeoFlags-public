<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold text-gray-100 mb-2">User Management</h1>
        <p class="text-gray-400">Manage all registered users</p>
      </div>
      <button @click="fetchUsers" class="btn-secondary">
        <Icon name="mdi:refresh" class="w-5 h-5 inline mr-2" />
        Refresh
      </button>
    </div>

    <!-- Search Bar -->
    <div class="card p-4 mb-6">
      <div class="relative">
        <Icon name="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by username or email..."
          class="input-field pl-10"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card p-8 text-center">
      <div class="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card p-8 text-center">
      <Icon name="mdi:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p class="text-gray-300 mb-4">{{ error }}</p>
      <button @click="fetchUsers" class="btn-primary">Try Again</button>
    </div>

    <!-- Users Table -->
    <AdminTable
      v-else
      :columns="columns"
      :data="filteredUsers"
      empty-message="No users found"
      show-pagination
      :items-per-page="50"
    >
      <!-- Username Cell -->
      <template #cell-username="{ row }">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold overflow-hidden"
          >
            <img v-if="row.avatarUrl" :src="getAvatarUrl(row.avatarUrl)" alt="Avatar" class="w-full h-full object-cover">
            <span v-else>{{ row.username.charAt(0).toUpperCase() }}</span>
          </div>
          <div>
            <div class="font-medium text-gray-100">{{ row.username }}</div>
            <div class="text-sm text-gray-500">{{ row.email }}</div>
          </div>
        </div>
      </template>

      <!-- Role Cell -->
      <template #cell-role="{ row }">
        <span
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="{
            'bg-red-900/30 text-red-700': row.role === 'admin',
            'bg-gray-800 text-gray-300': row.role === 'user',
          }"
        >
          {{ row.role }}
        </span>
      </template>

      <!-- Status Cell -->
      <template #cell-status="{ row }">
        <span
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="{
            'bg-green-900/30 text-green-700': row.status === 'active',
            'bg-red-900/30 text-red-700': row.status === 'banned',
            'bg-yellow-900/30 text-yellow-700': row.status === 'suspended',
          }"
        >
          {{ row.status }}
        </span>
      </template>

      <!-- Games Played Cell -->
      <template #cell-gamesPlayed="{ row }">
        <span class="text-gray-100 font-medium">{{ row.gamesPlayed }}</span>
      </template>

      <!-- Total Score Cell -->
      <template #cell-totalScore="{ row }">
        <span class="text-primary-600 font-bold">{{ row.totalScore.toLocaleString() }}</span>
      </template>

      <!-- Last Login Cell -->
      <template #cell-lastLogin="{ row }">
        <span class="text-gray-400 text-sm">
          {{ row.lastLogin ? formatRelativeTime(row.lastLogin) : 'Never' }}
        </span>
      </template>

      <!-- Created At Cell -->
      <template #cell-createdAt="{ row }">
        <span class="text-gray-400 text-sm">{{ formatDate(row.createdAt) }}</span>
      </template>

      <!-- Actions Cell -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end space-x-2">
          <button
            @click="openDetailsModal(row)"
            class="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details
          </button>
          <button
            @click="openStatusModal(row)"
            class="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Change Status
          </button>
          <button
            @click="openDeleteModal(row)"
            class="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </template>
    </AdminTable>

    <!-- User Details Modal -->
    <AdminModal
      v-model="detailsModal.open"
      title="User Details"
      :show-confirm="false"
      cancel-text="Close"
    >
      <div v-if="detailsModal.user" class="space-y-4">
        <!-- User Info -->
        <div class="glass-card-dark p-4">
          <div class="flex items-center space-x-4 mb-4">
            <div class="relative">
              <div
                class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-2xl overflow-hidden"
              >
                <img v-if="detailsModal.user.avatarUrl" :src="getAvatarUrl(detailsModal.user.avatarUrl)" alt="Avatar" class="w-full h-full object-cover">
                <span v-else>{{ detailsModal.user.username.charAt(0).toUpperCase() }}</span>
              </div>
              <button
                v-if="detailsModal.user.avatarUrl"
                @click="handleDeleteAvatar(detailsModal.user)"
                class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-colors"
                title="Delete avatar"
              >
                <Icon name="mdi:close" class="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-100">{{ detailsModal.user.username }}</h3>
              <p class="text-gray-400">{{ detailsModal.user.email }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-400">Role</p>
              <span
                class="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-red-900/30 text-red-700': detailsModal.user.role === 'ADMIN',
                  'bg-gray-800 text-gray-300': detailsModal.user.role === 'USER',
                }"
              >
                {{ detailsModal.user.role }}
              </span>
            </div>

            <div>
              <p class="text-sm text-gray-400">Status</p>
              <span
                class="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-900/30 text-green-700': detailsModal.user.status === 'ACTIVE',
                  'bg-red-900/30 text-red-700': detailsModal.user.status === 'BANNED',
                  'bg-yellow-900/30 text-yellow-700': detailsModal.user.status === 'SUSPENDED',
                }"
              >
                {{ detailsModal.user.status }}
              </span>
            </div>

            <div>
              <p class="text-sm text-gray-400">Member Since</p>
              <p class="text-gray-100 mt-1">{{ formatDate(detailsModal.user.createdAt) }}</p>
            </div>

            <div>
              <p class="text-sm text-gray-400">Last Active</p>
              <p class="text-gray-100 mt-1">
                {{ detailsModal.user.lastLogin ? formatRelativeTime(detailsModal.user.lastLogin) : 'Never' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="glass-card-dark p-4">
          <h4 class="text-lg font-semibold text-gray-100 mb-3">Statistics</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-400">Games Played</p>
              <p class="text-2xl font-bold text-primary-600 mt-1">{{ detailsModal.user.gamesPlayed }}</p>
            </div>

            <div>
              <p class="text-sm text-gray-400">Total Score</p>
              <p class="text-2xl font-bold text-primary-600 mt-1">{{ detailsModal.user.totalScore.toLocaleString() }}</p>
            </div>

            <div>
              <p class="text-sm text-gray-400">Average Score</p>
              <p class="text-xl font-semibold text-gray-100 mt-1">
                {{ detailsModal.user.gamesPlayed > 0 ? Math.round(detailsModal.user.totalScore / detailsModal.user.gamesPlayed).toLocaleString() : '0' }}
              </p>
            </div>

            <div>
              <p class="text-sm text-gray-400">User ID</p>
              <p class="text-xs font-mono text-gray-300 mt-1 break-all">{{ detailsModal.user.id }}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminModal>

    <!-- Change Status Modal -->
    <AdminModal
      v-model="statusModal.open"
      title="Change User Status"
      confirm-text="Update Status"
      :loading="statusModal.loading"
      :danger="statusModal.newStatus === 'BANNED'"
      @confirm="handleStatusChange"
    >
      <div class="space-y-4">
        <p class="text-gray-300">
          Change status for <strong class="text-white">{{ statusModal.user?.username }}</strong>
        </p>

        <!-- Status Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">New Status</label>
          <select
            v-model="statusModal.newStatus"
            class="input-field"
          >
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>

        <!-- Ban/Suspend Reason (shown when banned or suspended) -->
        <div v-if="statusModal.newStatus !== 'ACTIVE'">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Reason <span class="text-red-400">*</span>
          </label>
          <textarea
            v-model="statusModal.reason"
            class="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            rows="3"
            :placeholder="statusModal.newStatus === 'BANNED' ? 'Why is this user being banned?' : 'Why is this user being suspended?'"
          ></textarea>
        </div>

        <!-- Expiration Date (shown when banned or suspended) -->
        <div v-if="statusModal.newStatus !== 'ACTIVE'">
          <label class="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              v-model="statusModal.hasExpiration"
              class="w-4 h-4 rounded bg-black/30 border-white/10"
            />
            <span class="text-sm font-medium text-gray-300">Set expiration date</span>
          </label>

          <div v-if="statusModal.hasExpiration">
            <input
              type="datetime-local"
              v-model="statusModal.expiresAt"
              class="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              :min="new Date().toISOString().slice(0, 16)"
            />
            <p class="text-xs text-gray-400 mt-1">
              {{ statusModal.newStatus === 'BANNED' ? 'Ban' : 'Suspension' }} will automatically expire at this date
            </p>
          </div>
        </div>

        <!-- Warning for permanent ban -->
        <div v-if="statusModal.newStatus === 'BANNED' && !statusModal.hasExpiration" class="flex items-center space-x-3 p-4 bg-red-900/20 rounded-lg">
          <Icon name="mdi:alert" class="w-6 h-6 text-red-400" />
          <p class="text-sm text-red-300">
            This will be a permanent ban. User will not be able to access the application.
          </p>
        </div>
      </div>
    </AdminModal>

    <!-- Delete Confirmation Modal -->
    <AdminModal
      v-model="deleteModal.open"
      title="Delete User"
      confirm-text="Delete User"
      danger
      :loading="deleteModal.loading"
      @confirm="handleDeleteUser"
    >
      <div class="space-y-4">
        <div class="flex items-center space-x-3 p-4 bg-red-900/20 rounded-lg">
          <Icon name="mdi:alert" class="w-6 h-6 text-red-600" />
          <p class="text-sm text-red-700">
            This action cannot be undone. All user data will be permanently deleted.
          </p>
        </div>
        <p class="text-gray-300">
          Are you sure you want to delete <strong>{{ deleteModal.user?.username }}</strong>?
        </p>
      </div>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import type { AdminUser } from '~/types'

/**
 * Admin users management page
 *
 * SECURITY: Protected by admin middleware
 * - All mutations require re-confirmation via modal
 */
definePageMeta({
  middleware: 'admin',
})

const { getAdminUsers, updateUserStatus, deleteUser } = useApi()

const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')

const columns = [
  { key: 'username', label: 'User' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'gamesPlayed', label: 'Games' },
  { key: 'totalScore', label: 'Score' },
  { key: 'lastLogin', label: 'Last Active' },
  { key: 'createdAt', label: 'Joined' },
]

// Filter users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) {
    return users.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// Details Modal
const detailsModal = reactive({
  open: false,
  user: null as AdminUser | null,
})

// Status Modal
const statusModal = reactive({
  open: false,
  user: null as AdminUser | null,
  newStatus: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED' | 'BANNED',
  reason: '',
  hasExpiration: false,
  expiresAt: '',
  loading: false,
})

// Delete Modal
const deleteModal = reactive({
  open: false,
  user: null as AdminUser | null,
  loading: false,
})

const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = null

    const data = await getAdminUsers()
    users.value = data
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const openDetailsModal = (user: AdminUser) => {
  detailsModal.user = user
  detailsModal.open = true
}

const openStatusModal = (user: AdminUser) => {
  statusModal.user = user
  statusModal.newStatus = user.status
  statusModal.reason = ''
  statusModal.hasExpiration = false
  statusModal.expiresAt = ''
  statusModal.open = true
}

const openDeleteModal = (user: AdminUser) => {
  deleteModal.user = user
  deleteModal.open = true
}

const handleStatusChange = async () => {
  if (!statusModal.user) return

  // Validate reason for ban/suspend
  if (statusModal.newStatus !== 'ACTIVE' && !statusModal.reason.trim()) {
    alert('Please provide a reason for this action')
    return
  }

  try {
    statusModal.loading = true

    await updateUserStatus(
      statusModal.user.id,
      statusModal.newStatus,
      statusModal.reason || undefined,
      statusModal.hasExpiration && statusModal.expiresAt ? statusModal.expiresAt : undefined
    )

    // Update local data
    const index = users.value.findIndex((u) => u.id === statusModal.user!.id)
    if (index !== -1) {
      users.value[index].status = statusModal.newStatus
    }

    statusModal.open = false
    alert(`User status updated successfully to ${statusModal.newStatus}`)
  } catch (err: any) {
    console.error('Status change error:', err)
    const errorMessage = err?.data?.message || err?.message || 'Failed to update user status'
    alert(errorMessage)
  } finally {
    statusModal.loading = false
  }
}

const handleDeleteUser = async () => {
  if (!deleteModal.user) return

  try {
    deleteModal.loading = true

    await deleteUser(deleteModal.user.id)

    // Remove from local data
    users.value = users.value.filter((u) => u.id !== deleteModal.user!.id)

    deleteModal.open = false
  } catch (err: any) {
    alert(err.data?.message || 'Failed to delete user')
  } finally {
    deleteModal.loading = false
  }
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(dateString)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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

// Delete user avatar
const handleDeleteAvatar = async (user: AdminUser) => {
  if (!confirm(`Delete avatar for ${user.username}?`)) return

  try {
    const { apiRequest } = useApi()
    await apiRequest(`/api/admin/users/${user.id}/avatar`, {
      method: 'DELETE',
    })

    // Update local data
    const index = users.value.findIndex((u) => u.id === user.id)
    if (index !== -1) {
      users.value[index].avatarUrl = undefined
    }

    // Update modal if open
    if (detailsModal.user?.id === user.id) {
      detailsModal.user.avatarUrl = undefined
    }

    alert('Avatar deleted successfully')
  } catch (err: any) {
    alert(err.data?.message || 'Failed to delete avatar')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
