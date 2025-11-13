<template>
  <div>
    <div class="video-background">
      <video autoplay muted loop playsinline>
        <source src="/assets/videos/globe.mp4" type="video/mp4">
      </video>
      <div class="video-overlay"></div>
    </div>

    <NuxtLayout>
      <div class="min-h-screen flex items-center justify-center px-4">
        <div class="max-w-2xl w-full text-center">
          <div class="card p-8 md:p-12">
            <!-- Error Icon -->
            <div class="flex justify-center mb-6">
              <div class="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
                <Icon
                  :name="is404 ? 'mdi:map-marker-question' : 'mdi:alert-circle'"
                  class="w-16 h-16 text-red-500"
                />
              </div>
            </div>

            <!-- Error Code -->
            <h1 class="text-6xl md:text-8xl font-bold text-gray-100 mb-4">
              {{ error?.statusCode || '404' }}
            </h1>

            <!-- Error Message -->
            <h2 class="text-2xl md:text-3xl font-bold text-gray-200 mb-4">
              {{ errorTitle }}
            </h2>

            <p class="text-gray-400 text-lg mb-8">
              {{ errorMessage }}
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                @click="handleError"
                class="btn-primary inline-flex items-center justify-center"
              >
                <Icon name="mdi:home" class="w-5 h-5 mr-2" />
                Back to Home
              </button>

              <button
                v-if="!is404"
                @click="retry"
                class="btn-secondary inline-flex items-center justify-center"
              >
                <Icon name="mdi:refresh" class="w-5 h-5 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
/**
 * Global Error Page
 *
 * Handles all errors including 404s and server errors
 * Provides navigation back to main pages
 */

interface ErrorProps {
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}

const props = defineProps<ErrorProps>()

const is404 = computed(() => props.error?.statusCode === 404)

const errorTitle = computed(() => {
  if (is404.value) {
    return 'Page Not Found'
  }
  return props.error?.statusMessage || 'Something Went Wrong'
})

const errorMessage = computed(() => {
  if (is404.value) {
    return "The page you're looking for doesn't exist. It might have been moved or deleted."
  }
  return props.error?.message || 'An unexpected error occurred. Please try again or return to the home page.'
})

const handleError = () => {
  clearError({ redirect: '/' })
}

const retry = () => {
  clearError()
}
</script>
