<template>
  <AdminModal
    :model-value="isOpen"
    title="Confirm Your Identity"
    :show-footer="false"
    @close="handleCancel"
  >
    <div class="space-y-4">
      <p class="text-sm text-gray-400">
        This action requires re-authentication. Please enter your password to continue.
      </p>

      <!-- Password Input -->
      <div>
        <label for="reauth-password" class="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          id="reauth-password"
          ref="passwordInput"
          v-model="password"
          type="password"
          class="input-field w-full"
          placeholder="Enter your password"
          :disabled="loading"
          @keyup.enter="handleConfirm"
        />
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-400">{{ error }}</p>
      </div>

      <!-- Action Info -->
      <div v-if="actionDescription" class="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
        <p class="text-sm text-gray-300">{{ actionDescription }}</p>
      </div>

      <!-- Footer Actions -->
      <div class="flex gap-3 justify-end mt-6">
        <button
          @click="handleCancel"
          class="btn-secondary"
          :disabled="loading"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          class="btn-primary"
          :disabled="loading || !password"
        >
          <Icon v-if="loading" name="mdi:loading" class="w-5 h-5 animate-spin" />
          <Icon v-else name="mdi:shield-check" class="w-5 h-5" />
          <span>{{ loading ? 'Verifying...' : 'Confirm' }}</span>
        </button>
      </div>
    </div>
  </AdminModal>
</template>

<script setup lang="ts">
interface Props {
  open?: boolean
  actionDescription?: string
}

interface Emits {
  (e: 'confirm', success: boolean): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})
const emit = defineEmits<Emits>()

const { reauth } = useAdmin()
const toast = useToast()

const password = ref('')
const loading = ref(false)
const error = ref('')
const passwordInput = ref<HTMLInputElement>()
const isOpen = ref(props.open)
let resolveCallback: ((value: boolean) => void) | null = null

// Auto-focus password input when modal opens
watch(() => isOpen.value, (isOpenValue) => {
  if (isOpenValue) {
    password.value = ''
    error.value = ''
    nextTick(() => {
      passwordInput.value?.focus()
    })
  }
})

// Listen for global reauth requests
onMounted(() => {
  window.addEventListener('admin:reauth-required', handleReauthRequest as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('admin:reauth-required', handleReauthRequest as EventListener)
})

const handleReauthRequest = (event: CustomEvent) => {
  resolveCallback = event.detail.resolve
  isOpen.value = true
}

const handleConfirm = async () => {
  if (!password.value) {
    error.value = 'Password is required'
    return
  }

  try {
    loading.value = true
    error.value = ''

    const success = await reauth(password.value)

    if (success) {
      toast.success('Identity confirmed')
      emit('confirm', true)
      if (resolveCallback) {
        resolveCallback(true)
        resolveCallback = null
      }
      password.value = ''
      isOpen.value = false
    } else {
      error.value = 'Invalid password. Please try again.'
      emit('confirm', false)
    }
  } catch (err: any) {
    error.value = err.message || 'Re-authentication failed'
    emit('confirm', false)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  password.value = ''
  error.value = ''
  if (resolveCallback) {
    resolveCallback(false)
    resolveCallback = null
  }
  isOpen.value = false
  emit('cancel')
}

// Watch prop changes
watch(() => props.open, (value) => {
  isOpen.value = value
})
</script>
