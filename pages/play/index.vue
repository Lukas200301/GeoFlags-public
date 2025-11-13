<template>
  <div></div>
</template>

<script setup lang="ts">
/**
 * Redirect to Solo Play page
 * This redirect maintains backward compatibility with old /play links
 */
definePageMeta({
  layout: 'default',
})

// Redirect to /play/solo
navigateTo('/play/solo', { replace: true })
</script>
