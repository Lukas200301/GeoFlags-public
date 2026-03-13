<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-950 px-4">
    <div class="max-w-md w-full text-center">
      <!-- Icon -->
      <div class="mb-8">
        <div
          class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 mb-4"
        >
          <Icon name="mdi:shield-lock" class="w-12 h-12 text-red-500" />
        </div>
        <h1 class="text-4xl font-bold text-gray-100 mb-2">Access Denied</h1>
        <p class="text-gray-400">You don't have permission to access this area</p>
      </div>

      <!-- Message Card -->
      <div class="card p-6 mb-8 text-left">
        <h2 class="text-lg font-semibold text-gray-100 mb-3">Administrator Access Required</h2>
        <p class="text-gray-400 mb-4">
          The admin dashboard is restricted to users with administrator privileges. If you believe
          you should have access, please contact your system administrator.
        </p>

        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Current Status:</h3>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <Icon name="mdi:account" class="w-4 h-4 text-gray-500" />
              <span class="text-gray-400"
                >Logged in as:
                <span class="text-gray-100">{{ user?.username || 'Guest' }}</span></span
              >
            </div>
            <div class="flex items-center gap-2">
              <Icon name="mdi:shield" class="w-4 h-4 text-gray-500" />
              <span class="text-gray-400"
                >Role: <span class="text-gray-100">{{ user?.role || 'User' }}</span></span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink to="/" class="btn-primary">
          <Icon name="mdi:home" class="w-5 h-5" />
          <span>Go to Homepage</span>
        </NuxtLink>

        <button @click="handleLogout" class="btn-secondary" :disabled="loading">
          <Icon name="mdi:logout" class="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      <!-- Help Text -->
      <p class="mt-8 text-sm text-gray-500">
        If you need admin access, please contact your system administrator.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout, loading } = useAuth()

const handleLogout = async () => {
  await logout()
  navigateTo('/auth/login')
}
</script>

<style scoped>
.card {
  @apply bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl;
}
</style>
