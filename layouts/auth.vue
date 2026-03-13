<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Video Background (same as default layout) -->
    <div class="video-background">
      <video autoplay muted loop playsinline>
        <source src="/assets/videos/globe.mp4" type="video/mp4" />
      </video>
      <div class="video-overlay"></div>
    </div>

    <!-- Floating gradient orbs for depth -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-float"
        style="animation-duration: 20s"
      ></div>
      <div
        class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-float"
        style="animation-duration: 25s; animation-delay: -5s"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/15 rounded-full filter blur-3xl animate-float"
        style="animation-duration: 30s; animation-delay: -10s"
      ></div>
    </div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center space-x-3 group">
          <img
            src="/assets/images/image.png"
            alt="GeoFlags Logo"
            class="w-16 h-16 object-cover group-hover:scale-110 transition-transform"
          />
          <div class="text-left">
            <h1 class="text-3xl font-bold text-gray-100">GeoFlags</h1>
            <p class="text-sm text-gray-400">Geography Quiz</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Content -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Authentication layout
 * Simple centered layout for login/register pages
 */
</script>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -50px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.animate-float {
  animation: float 20s ease-in-out infinite;
}
</style>
