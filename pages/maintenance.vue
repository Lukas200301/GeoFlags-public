<template>
  <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl animate-pulse" style="animation-duration: 4s;"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full filter blur-3xl animate-pulse" style="animation-duration: 6s; animation-delay: -2s;"></div>
    </div>

    <div class="relative z-10 max-w-lg w-full text-center">
      <!-- Logo -->
      <div class="mb-8">
        <img src="/assets/images/image.png" alt="GeoFlags Logo" class="w-20 h-20 mx-auto mb-4 opacity-80" />
      </div>

      <!-- Main Card -->
      <div class="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-amber-500/20 shadow-2xl p-8 md:p-12">
        <!-- Maintenance Icon -->
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Icon name="mdi:wrench" class="w-10 h-10 text-amber-400 animate-bounce" style="animation-duration: 2s;" />
        </div>

        <!-- Title -->
        <h1 class="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
          Under Maintenance
        </h1>

        <!-- Message -->
        <p v-if="maintenanceMessage" class="text-gray-300 text-lg mb-6 leading-relaxed">
          {{ maintenanceMessage }}
        </p>
        <p v-else class="text-gray-300 text-lg mb-6 leading-relaxed">
          We're currently performing scheduled maintenance to improve your experience.
          We'll be back shortly!
        </p>

        <!-- Status indicator -->
        <div class="flex items-center justify-center gap-3 mb-8 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div class="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
          <span class="text-amber-300 text-sm font-medium">Maintenance in progress</span>
        </div>

        <!-- Login link for admins -->
        <div class="pt-4 border-t border-gray-800">
          <p class="text-gray-500 text-sm mb-3">Are you an administrator?</p>
          <NuxtLink
            to="/auth/login"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium transition-all duration-300 hover:scale-105"
          >
            <Icon name="mdi:login" class="w-5 h-5" />
            Sign In
          </NuxtLink>
        </div>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-gray-500 text-sm">
        Thank you for your patience 🌍
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Maintenance Page
 *
 * Displayed when the site is in maintenance mode.
 * Admins are auto-redirected away from this page.
 */
definePageMeta({
  layout: 'auth',
})

const { maintenanceMode, maintenanceMessage, fetchSystemSettings } = useSystemSettings()
const { isAdmin, isAuthenticated } = useAuth()

// If an admin somehow lands here, redirect them away
onMounted(async () => {
  await fetchSystemSettings(true)

  if (!maintenanceMode.value || (isAuthenticated.value && isAdmin.value)) {
    await navigateTo('/')
  }
})
</script>
