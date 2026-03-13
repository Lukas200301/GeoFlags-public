<template>
  <div class="max-w-md mx-auto mt-20 text-center">
    <!-- Loading State -->
    <div v-if="loading" class="p-8 glass-card">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"
      ></div>
      <p class="text-gray-300 text-lg">Verifying your email address...</p>
    </div>

    <!-- Success State -->
    <div v-else-if="success" class="p-10 glass-card border border-green-500/50 bg-green-900/20">
      <Icon name="mdi:check-circle" class="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h2 class="text-3xl font-bold text-green-400 mb-4">Email Verified!</h2>
      <p class="text-green-300 mb-8 text-lg">{{ message }}</p>
      <NuxtLink to="/profile" class="btn-primary w-full inline-block">Go to Profile</NuxtLink>
    </div>

    <!-- Error State -->
    <div v-else class="p-10 glass-card border border-red-500/50 bg-red-900/20">
      <Icon name="mdi:close-circle" class="w-20 h-20 text-red-500 mx-auto mb-6" />
      <h2 class="text-3xl font-bold text-red-400 mb-4">Verification Failed</h2>
      <p class="text-red-300 mb-8 text-lg">{{ message }}</p>
      <NuxtLink to="/auth/login" class="btn-primary w-full inline-block">Back to Login</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const loading = ref(true)
const success = ref(false)
const message = ref('')

definePageMeta({
  layout: 'default',
})

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    loading.value = false
    success.value = false
    message.value = 'No verification token provided. Please use the link sent to your email.'
    return
  }

  try {
    const { apiRequest } = useApi()
    const { fetchUser } = useAuth()
    const res: any = await apiRequest('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    })

    // Refresh the user session so the frontend knows they're verified
    await fetchUser()
    success.value = true
    message.value = res.message || 'Email verified successfully!'
  } catch (err: any) {
    success.value = false
    message.value = err.data?.message || err.message || 'Invalid or expired token.'
  } finally {
    loading.value = false
  }
})
</script>
