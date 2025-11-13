<template>
  <div class="video-background">
    <video autoplay muted loop playsinline>
      <source src="/assets/videos/globe.mp4" type="video/mp4">
    </video>
    <div class="video-overlay"></div>
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
/**
 * Root app component
 *
 * Note: User authentication is handled by middleware (auth.ts)
 * No need to fetch user here to prevent duplicate requests
 */

// Preload system settings on app start
const { fetchSystemSettings } = useSystemSettings()

onMounted(() => {
  // Fetch system settings early to avoid delays in middleware
  fetchSystemSettings()
})
</script>
