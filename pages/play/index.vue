<script setup lang="ts">
/**
 * Redirect to Solo Play page
 * This redirect maintains backward compatibility with old /play links
 */
definePageMeta({
  layout: 'default',
})

// Immediate server-side redirect to /play/solo
await navigateTo('/play/solo', { replace: true, redirectCode: 301 })
</script>

<template>
  <!-- Template not rendered due to immediate redirect -->
  <div></div>
</template>
