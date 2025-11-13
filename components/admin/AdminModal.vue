<script setup lang="ts">
/**
 * Reusable Admin Modal Component
 */

interface Props {
  modelValue: boolean
  title: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  danger?: boolean
  showConfirm?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loading: false,
  danger: false,
  showConfirm: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const close = () => {
  if (!props.loading) {
    emit('update:modelValue', false)
    emit('cancel')
  }
}

const confirm = () => {
  if (!props.loading) {
    emit('confirm')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-700">
            <h3 class="text-xl font-bold text-gray-100">{{ title }}</h3>
          </div>

          <!-- Content -->
          <div class="px-6 py-4">
            <slot />
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
            <button
              @click="close"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ cancelText }}
            </button>
            <button
              v-if="showConfirm"
              @click="confirm"
              :disabled="loading"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700',
              ]"
            >
              <span v-if="loading" class="inline-block animate-spin mr-2">⏳</span>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
