<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent"
        >
          Friends
        </h1>
        <button
          @click="showAddFriend = true"
          class="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          <Icon name="mdi:account-plus" class="inline-block mr-2" />
          Add Friend
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
            activeTab === tab.id ? 'text-sky-400' : 'text-gray-400 hover:text-gray-200',
          ]"
        >
          {{ tab.label }}
          <div
            v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500"
          />
        </button>
      </div>

      <!-- Friends List -->
      <div v-if="activeTab === 'friends'" class="space-y-4">
        <div v-if="loading" class="text-center py-12">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"
          ></div>
        </div>

        <div v-else-if="friends.length === 0" class="text-center py-12">
          <Icon name="mdi:account-group-outline" class="text-6xl text-gray-600 mb-4" />
          <p class="text-gray-400 text-lg">No friends yet. Add some friends to get started!</p>
        </div>

        <div v-else class="grid gap-4">
          <div
            v-for="friendship in friends"
            :key="friendship.friendshipId"
            class="glass-card p-6 hover:scale-[1.02] transition-transform duration-300"
          >
            <div class="flex items-center justify-between">
              <NuxtLink
                :to="`/users/${friendship.friend.id}`"
                class="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div
                  class="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-2xl font-bold"
                >
                  {{ friendship.friend.username[0].toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-xl font-semibold">{{ friendship.friend.username }}</h3>
                  <p class="text-sm text-gray-400">
                    Friends since {{ formatDate(friendship.since) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Last active: {{ formatRelativeTime(friendship.friend.lastActive) }}
                  </p>
                </div>
              </NuxtLink>
              <button
                @click="removeFriend(friendship.friendshipId)"
                class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all"
              >
                <Icon name="mdi:account-remove" class="inline-block mr-2" />
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Friend Requests -->
      <div v-if="activeTab === 'requests'">
        <!-- Received Requests -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Received Requests</h2>
          <div v-if="receivedRequests.length === 0" class="text-center py-8 glass-card">
            <p class="text-gray-400">No pending friend requests</p>
          </div>
          <div v-else class="grid gap-4">
            <div
              v-for="request in receivedRequests"
              :key="request.friendshipId"
              class="glass-card p-6"
            >
              <div class="flex items-center justify-between">
                <NuxtLink
                  :to="`/users/${request.from.id}`"
                  class="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div
                    class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xl font-bold"
                  >
                    {{ request.from.username[0].toUpperCase() }}
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold">{{ request.from.username }}</h3>
                    <p class="text-sm text-gray-400">{{ formatRelativeTime(request.createdAt) }}</p>
                  </div>
                </NuxtLink>
                <div class="flex gap-3">
                  <button
                    @click="acceptRequest(request.friendshipId)"
                    class="px-4 py-2 bg-green-500 rounded-lg font-semibold hover:bg-green-600 transition-all"
                  >
                    Accept
                  </button>
                  <button
                    @click="rejectRequest(request.friendshipId)"
                    class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sent Requests -->
        <div>
          <h2 class="text-2xl font-bold mb-4">Sent Requests</h2>
          <div v-if="sentRequests.length === 0" class="text-center py-8 glass-card">
            <p class="text-gray-400">No outgoing friend requests</p>
          </div>
          <div v-else class="grid gap-4">
            <div v-for="request in sentRequests" :key="request.friendshipId" class="glass-card p-6">
              <div class="flex items-center justify-between">
                <NuxtLink
                  :to="`/users/${request.to.id}`"
                  class="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div
                    class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xl font-bold"
                  >
                    {{ request.to.username[0].toUpperCase() }}
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold">{{ request.to.username }}</h3>
                    <p class="text-sm text-gray-400">
                      Sent {{ formatRelativeTime(request.createdAt) }}
                    </p>
                  </div>
                </NuxtLink>
                <button
                  @click="cancelRequest(request.friendshipId)"
                  class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-if="activeTab === 'suggestions'" class="space-y-4">
        <div v-if="loading" class="text-center py-12">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"
          ></div>
        </div>

        <div v-else-if="suggestions.length === 0" class="text-center py-12 glass-card">
          <p class="text-gray-400">No suggestions available</p>
        </div>

        <div v-else class="grid gap-4">
          <div v-for="user in suggestions" :key="user.id" class="glass-card p-6">
            <div class="flex items-center justify-between">
              <NuxtLink
                :to="`/users/${user.id}`"
                class="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xl font-bold"
                >
                  {{ user.username[0].toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold">{{ user.username }}</h3>
                  <p class="text-sm text-gray-400">
                    Last active: {{ formatRelativeTime(user.lastActive) }}
                  </p>
                </div>
              </NuxtLink>
              <button
                @click="sendFriendRequest(user.id)"
                class="px-4 py-2 bg-sky-500 rounded-lg font-semibold hover:bg-sky-600 transition-all"
              >
                <Icon name="mdi:account-plus" class="inline-block mr-2" />
                Add Friend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Friend Modal -->
    <div
      v-if="showAddFriend"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="showAddFriend = false"
    >
      <div class="glass-card p-8 max-w-md w-full m-4" @click.stop>
        <h2 class="text-2xl font-bold mb-4">Add Friend</h2>
        <input
          v-model="searchQuery"
          @input="searchUsers"
          type="text"
          placeholder="Search by username..."
          class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-sky-500 mb-4"
        />

        <div v-if="searchResults.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center font-bold"
              >
                {{ user.username[0].toUpperCase() }}
              </div>
              <span>{{ user.username }}</span>
            </div>
            <button
              @click="sendFriendRequest(user.id)"
              :disabled="user.relationshipStatus !== 'NONE'"
              :class="[
                'px-4 py-2 rounded-lg font-semibold transition-all',
                user.relationshipStatus === 'NONE'
                  ? 'bg-sky-500 hover:bg-sky-600'
                  : 'bg-gray-600 cursor-not-allowed',
              ]"
            >
              {{ getRelationshipButtonText(user.relationshipStatus) }}
            </button>
          </div>
        </div>

        <button
          @click="showAddFriend = false"
          class="mt-4 w-full px-4 py-3 bg-white/10 rounded-lg font-semibold hover:bg-white/20 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

interface FriendsResponse {
  friends: any[]
}

interface FriendRequestsResponse {
  received: any[]
  sent: any[]
}

interface SuggestionsResponse {
  suggestions: any[]
}

interface SearchResponse {
  users: any[]
}

const showAddFriend = ref(false)
const toast = useToast()
const api = useApi()
const activeTab = ref('friends')
const loading = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])

const friends = ref<any[]>([])
const receivedRequests = ref<any[]>([])
const sentRequests = ref<any[]>([])
const suggestions = ref<any[]>([])

const tabs = computed(() => [
  { id: 'friends', label: 'Friends', badge: friends.value.length || null },
  { id: 'requests', label: 'Requests', badge: receivedRequests.value.length || null },
  { id: 'suggestions', label: 'Suggestions' },
])

onMounted(async () => {
  await Promise.all([loadFriends(), loadFriendRequests(), loadSuggestions()])
})

async function loadFriends() {
  try {
    loading.value = true
    const data = await api.apiRequest<FriendsResponse>('/api/friends', {
      method: 'GET',
    })
    friends.value = data.friends
  } catch (error) {
    console.error('Failed to load friends:', error)
  } finally {
    loading.value = false
  }
}

async function loadFriendRequests() {
  try {
    const data = await api.apiRequest<FriendRequestsResponse>('/api/friends/requests', {
      method: 'GET',
    })
    receivedRequests.value = data.received
    sentRequests.value = data.sent
  } catch (error) {
    console.error('Failed to load friend requests:', error)
  }
}

async function loadSuggestions() {
  try {
    const data = await api.apiRequest<SuggestionsResponse>('/api/friends/suggestions', {
      method: 'GET',
    })
    suggestions.value = data.suggestions
  } catch (error) {
    console.error('Failed to load suggestions:', error)
  }
}

async function searchUsers() {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  try {
    const data = await api.apiRequest<SearchResponse>(
      `/api/friends/search?q=${searchQuery.value}`,
      {
        method: 'GET',
      }
    )
    searchResults.value = data.users
  } catch (error) {
    console.error('Search failed:', error)
  }
}

async function sendFriendRequest(userId: string) {
  try {
    await api.apiRequest(`/api/friends/request/${userId}`, {
      method: 'POST',
    })
    toast.success('Friend request sent successfully!')
    showAddFriend.value = false
    searchQuery.value = ''
    searchResults.value = []
    await loadFriendRequests()
  } catch (error: any) {
    toast.error(error.data?.error || 'Failed to send friend request')
  }
}

async function acceptRequest(friendshipId: string) {
  try {
    await api.apiRequest(`/api/friends/accept/${friendshipId}`, {
      method: 'POST',
    })
    toast.success('Friend request accepted! You are now friends.')
    await Promise.all([loadFriends(), loadFriendRequests()])
  } catch (error: any) {
    toast.error(error.data?.error || 'Failed to accept friend request')
  }
}

async function rejectRequest(friendshipId: string) {
  try {
    await api.apiRequest(`/api/friends/reject/${friendshipId}`, {
      method: 'POST',
    })
    toast.success('Friend request rejected')
    await loadFriendRequests()
  } catch (error: any) {
    toast.error(error.data?.error || 'Failed to reject friend request')
  }
}

async function cancelRequest(friendshipId: string) {
  try {
    await api.apiRequest(`/api/friends/${friendshipId}`, {
      method: 'DELETE',
    })
    toast.success('Friend request cancelled')
    await loadFriendRequests()
  } catch (error: any) {
    toast.error(error.data?.error || 'Failed to cancel friend request')
  }
}

async function removeFriend(friendshipId: string) {
  if (!confirm('Are you sure you want to remove this friend?')) return

  try {
    await api.apiRequest(`/api/friends/${friendshipId}`, {
      method: 'DELETE',
    })
    toast.success('Friend removed successfully')
    await loadFriends()
  } catch (error: any) {
    toast.error(error.data?.error || 'Failed to remove friend')
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

function formatRelativeTime(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function getRelationshipButtonText(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'ACCEPTED':
      return 'Friends'
    case 'BLOCKED':
      return 'Blocked'
    default:
      return 'Add'
  }
}
</script>
