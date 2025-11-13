<template>
  <div>
    <div class="bg-gray-900 rounded-2xl shadow-2xl p-8">
      <h2 class="text-2xl font-bold text-gray-100 mb-6">Create Account</h2>

      <!-- Error Message -->
      <div
        v-if="authError"
        class="mb-4 p-4 bg-red-900/20 border border-red-200 rounded-lg flex items-center space-x-2"
      >
        <Icon name="mdi:alert-circle" class="w-5 h-5 text-red-600" />
        <span class="text-sm text-red-700">{{ authError }}</span>
      </div>

      <!-- Validation Error -->
      <div
        v-if="validationError"
        class="mb-4 p-4 bg-yellow-900/20 border border-yellow-200 rounded-lg flex items-center space-x-2"
      >
        <Icon name="mdi:alert" class="w-5 h-5 text-yellow-600" />
        <span class="text-sm text-yellow-700">{{ validationError }}</span>
      </div>

      <!-- Register Form -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            minlength="3"
            class="input-field"
            placeholder="johndoe"
            :disabled="authLoading"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            class="input-field"
            placeholder="you@example.com"
            :disabled="authLoading"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            minlength="8"
            class="input-field"
            placeholder="••••••••"
            :disabled="authLoading"
          />
          <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
            :disabled="authLoading"
          />
        </div>

        <!-- Terms & Privacy Acceptance -->
        <div class="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <input
            id="acceptTerms"
            v-model="formData.acceptTerms"
            type="checkbox"
            required
            class="mt-1 w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
            :disabled="authLoading"
          />
          <label for="acceptTerms" class="text-sm text-gray-300">
            I agree to the
            <NuxtLink
              to="/legal/terms"
              target="_blank"
              class="text-primary-400 hover:text-primary-300 underline"
            >
              Terms of Service
            </NuxtLink>
            and
            <NuxtLink
              to="/legal/privacy"
              target="_blank"
              class="text-primary-400 hover:text-primary-300 underline"
            >
              Privacy Policy
            </NuxtLink>
          </label>
        </div>

        <button type="submit" class="w-full btn-primary" :disabled="authLoading || !formData.acceptTerms">
          <span v-if="authLoading">Creating account...</span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <!-- Login Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-400">
          Already have an account?
          <NuxtLink to="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
            Login here
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
 * Register page
 *
 * SECURITY:
 * - Uses HttpOnly, Secure cookies (set by backend)
 * - CSRF protection via useAuth composable
 * - Guest middleware prevents access when authenticated
 * - Client-side password validation
 */
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { register, error: authError, loading: authLoading } = useAuth()
const router = useRouter()

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

const validationError = ref<string | null>(null)

const handleRegister = async () => {
  validationError.value = null

  // Validate terms acceptance
  if (!formData.acceptTerms) {
    validationError.value = 'You must accept the Terms of Service and Privacy Policy'
    return
  }

  // Validate passwords match
  if (formData.password !== formData.confirmPassword) {
    validationError.value = 'Passwords do not match'
    return
  }

  // Validate password length
  if (formData.password.length < 8) {
    validationError.value = 'Password must be at least 8 characters'
    return
  }

  const success = await register(formData)

  if (success) {
    // Redirect to home after successful registration
    await router.push('/')
  }
}
</script>
