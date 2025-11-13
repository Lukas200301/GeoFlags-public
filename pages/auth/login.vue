<template>
  <div>
    <div class="bg-gray-900 rounded-2xl shadow-2xl p-8">
      <h2 class="text-2xl font-bold text-gray-100 mb-6">Login to GeoFlags</h2>

      <!-- Error Message -->
      <div
        v-if="authError"
        class="mb-4 p-4 bg-red-900/20 border border-red-200 rounded-lg flex items-center space-x-2"
      >
        <Icon name="mdi:alert-circle" class="w-5 h-5 text-red-600" />
        <span class="text-sm text-red-700">{{ authError }}</span>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="emailOrUsername" class="block text-sm font-medium text-gray-300 mb-2">
            Email or Username
          </label>
          <input
            id="emailOrUsername"
            v-model="credentials.emailOrUsername"
            type="text"
            required
            class="input-field"
            placeholder="you@example.com or username"
            :disabled="authLoading"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
            :disabled="authLoading"
          />
        </div>

        <button type="submit" class="w-full btn-primary" :disabled="authLoading">
          <span v-if="authLoading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>

      <!-- Register Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-400">
          Don't have an account?
          <NuxtLink to="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
            Register here
          </NuxtLink>
        </p>
      </div>
    </div>

    <!-- Back to Home -->
    <div class="text-center mt-6">
      <NuxtLink to="/" class="text-white hover:text-white/80 text-sm font-medium">
        ← Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Login page
 *
 * SECURITY:
 * - Uses HttpOnly, Secure cookies (set by backend)
 * - CSRF protection via useAuth composable
 * - Guest middleware prevents access when authenticated
 */
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { login, error: authError, loading: authLoading } = useAuth()
const route = useRoute()
const router = useRouter()

const credentials = reactive({
  emailOrUsername: '',
  password: '',
})

const handleLogin = async () => {
  const success = await login(credentials)

  if (success) {
    // Redirect to intended page or home
    const redirect = (route.query.redirect as string) || '/'
    await router.push(redirect)
  }
}
</script>
