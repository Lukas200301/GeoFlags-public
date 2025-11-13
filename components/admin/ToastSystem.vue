<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toastClasses(toast.type)"
        role="alert"
        :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
      >
        <div class="flex items-start gap-3">
          <Icon :name="getIcon(toast.type)" class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ toast.message }}</p>
          </div>
          <button
            @click="remove(toast.id)"
            class="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close notification"
          >
            <Icon name="mdi:close" class="w-4 h-4" />
          </button>
        </div>

        <!-- Action Button (e.g., Undo) -->
        <div v-if="toast.action" class="mt-3 pt-3 border-t border-current/20">
          <button
            @click="handleAction(toast)"
            class="text-sm font-medium hover:underline"
          >
            {{ toast.action.label }}
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()

const toastClasses = (type: string) => {
  const baseClasses = 'backdrop-blur-xl border shadow-lg'
  const typeClasses = {
    success: 'bg-green-500/90 border-green-400/50 text-white',
    error: 'bg-red-500/90 border-red-400/50 text-white',
    warning: 'bg-yellow-500/90 border-yellow-400/50 text-white',
    info: 'bg-blue-500/90 border-blue-400/50 text-white',
  }
  return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`
}

const getIcon = (type: string) => {
  const icons = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    warning: 'mdi:alert',
    info: 'mdi:information',
  }
  return icons[type as keyof typeof icons] || icons.info
}

const handleAction = (toast: any) => {
  if (toast.action?.callback) {
    toast.action.callback()
    remove(toast.id)
  }
}
</script>

<style scoped>
.toast {
  @apply p-4 rounded-lg;
  @apply transform transition-all duration-300;
  min-width: 300px;
  max-width: 400px;
}

/* Toast enter/leave animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
