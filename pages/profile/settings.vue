<template>
  <div class="max-w-3xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <NuxtLink to="/profile" class="inline-flex items-center text-primary-400 hover:text-primary-300 mb-4 transition-colors">
        <Icon name="mdi:arrow-left" class="w-5 h-5 mr-2" />
        Back to Profile
      </NuxtLink>
      <h1 class="text-4xl font-bold gradient-text mb-2">Account Settings</h1>
      <p class="text-gray-400">Manage your account information and preferences</p>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="glass-card bg-green-900/20 border border-green-500/50 p-4 mb-6">
      <div class="flex items-center gap-3">
        <Icon name="mdi:check-circle" class="w-6 h-6 text-green-400" />
        <p class="text-green-400">{{ successMessage }}</p>
      </div>
    </div>

    <div v-if="errorMessage" class="glass-card bg-red-900/20 border border-red-500/50 p-4 mb-6">
      <div class="flex items-center gap-3">
        <Icon name="mdi:alert-circle" class="w-6 h-6 text-red-400" />
        <p class="text-red-400">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Profile Information -->
    <div class="glass-card p-6 mb-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Icon name="mdi:account-edit" class="w-5 h-5 text-blue-400" />
        </div>
        <h2 class="text-2xl font-semibold gradient-text">Profile Information</h2>
      </div>

      <form @submit.prevent="updateProfile" class="space-y-4">
        <!-- Username -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <input
            id="username"
            v-model="profileForm.username"
            type="text"
            class="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Enter your username"
            minlength="3"
            maxlength="20"
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="profileForm.email"
            type="email"
            class="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Enter your email"
          />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="updatingProfile"
            class="glass-btn px-6 py-2.5 rounded-xl hover-lift flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="!updatingProfile" name="mdi:content-save" class="w-5 h-5" />
            <Icon v-else name="mdi:loading" class="w-5 h-5 animate-spin" />
            <span v-if="updatingProfile">Updating...</span>
            <span v-else>Update Profile</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Avatar -->
    <div class="glass-card p-6 mb-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Icon name="mdi:image-edit" class="w-5 h-5 text-purple-400" />
        </div>
        <h2 class="text-2xl font-semibold gradient-text">Profile Picture</h2>
      </div>

      <div class="flex flex-col md:flex-row items-center gap-6">
        <!-- Current Avatar -->
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl overflow-hidden">
          <img v-if="avatarPreview || user?.avatarUrl" :src="avatarPreview || getAvatarUrl(user?.avatarUrl)" alt="Avatar" class="w-full h-full object-cover">
          <span v-else>{{ user?.username?.charAt(0).toUpperCase() || '?' }}</span>
        </div>

        <!-- Avatar Upload -->
        <div class="flex-grow w-full">
          <label for="avatarUpload" class="block text-sm font-medium text-gray-300 mb-2">
            Upload new avatar
          </label>
          <div class="flex gap-2">
            <input
              id="avatarUpload"
              type="file"
              @change="onFileChange"
              accept=".jpg, .jpeg"
              class="hidden"
            />
            <button
              @click="triggerFileInput"
              class="glass-btn px-6 py-2.5 rounded-xl hover-lift flex items-center gap-2"
            >
              <Icon name="mdi:paperclip" class="w-5 h-5" />
              <span>Choose File</span>
            </button>
            <button
              @click="updateAvatar"
              :disabled="updatingAvatar || !selectedFile"
              class="glass-btn px-6 py-2.5 rounded-xl hover-lift flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon v-if="!updatingAvatar" name="mdi:upload" class="w-5 h-5" />
              <Icon v-else name="mdi:loading" class="w-5 h-5 animate-spin" />
              <span v-if="updatingAvatar">Uploading...</span>
              <span v-else>Upload</span>
            </button>
          </div>
          <p v-if="selectedFile" class="text-sm text-gray-400 mt-2">Selected file: {{ selectedFile.name }}</p>
          <p v-else class="text-xs text-gray-500 mt-1">
            Only .jpg and .jpeg files are allowed (max 2MB).
          </p>
        </div>
      </div>
    </div>

    <!-- Change Password -->
    <div class="glass-card p-6 mb-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <Icon name="mdi:lock-reset" class="w-5 h-5 text-green-400" />
        </div>
        <h2 class="text-2xl font-semibold gradient-text">Change Password</h2>
      </div>

      <form @submit.prevent="changePassword" class="space-y-4">
        <!-- Current Password -->
        <div>
          <label for="currentPassword" class="block text-sm font-medium text-gray-300 mb-2">
            Current Password
          </label>
          <input
            id="currentPassword"
            v-model="passwordForm.currentPassword"
            type="password"
            class="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
            placeholder="Enter your current password"
            minlength="8"
          />
        </div>

        <!-- New Password -->
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <input
            id="newPassword"
            v-model="passwordForm.newPassword"
            type="password"
            class="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
            placeholder="Enter your new password"
            minlength="8"
          />
        </div>

        <!-- Confirm New Password -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            v-model="passwordForm.confirmPassword"
            type="password"
            class="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
            placeholder="Confirm your new password"
            minlength="8"
          />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="changingPassword"
            class="glass-btn px-6 py-2.5 rounded-xl hover-lift flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="!changingPassword" name="mdi:key-change" class="w-5 h-5" />
            <Icon v-else name="mdi:loading" class="w-5 h-5 animate-spin" />
            <span v-if="changingPassword">Changing...</span>
            <span v-else>Change Password</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Danger Zone -->
    <div class="glass-card p-6 border border-red-500/30 bg-red-900/10">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Icon name="mdi:alert-octagon" class="w-5 h-5 text-red-400" />
        </div>
        <h2 class="text-2xl font-semibold text-red-400">Danger Zone</h2>
      </div>
      <p class="text-gray-400 mb-4">
        Once you delete your account, there is no going back. Please be certain.
      </p>
      <button
        @click="showDeleteModal = true"
        class="glass-btn-danger px-6 py-2.5 rounded-xl hover-lift flex items-center gap-2"
      >
        <Icon name="mdi:delete-forever" class="w-5 h-5" />
        Delete Account
      </button>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="showDeleteModal = false"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showDeleteModal"
              class="glass-card max-w-md w-full p-6 border border-red-500/30 bg-red-900/10"
            >
              <!-- Modal Header -->
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Icon name="mdi:alert-octagon" class="w-6 h-6 text-red-400" />
                </div>
                <h3 class="text-2xl font-bold text-red-400">Delete Account</h3>
              </div>

              <!-- Warning Message -->
              <div class="bg-red-950/50 border border-red-500/30 rounded-xl p-4 mb-4">
                <p class="text-red-300 font-semibold mb-2">⚠️ This action cannot be undone!</p>
                <p class="text-gray-300 text-sm">
                  Deleting your account will permanently remove:
                </p>
                <ul class="text-gray-400 text-sm mt-2 space-y-1 ml-4 list-disc">
                  <li>All your game sessions</li>
                  <li>All your leaderboard entries</li>
                  <li>Your profile and settings</li>
                  <li>All associated data</li>
                </ul>
              </div>

              <!-- Password Confirmation -->
              <form @submit.prevent="deleteAccount" class="space-y-4">
                <div>
                  <label for="deletePassword" class="block text-sm font-medium text-gray-300 mb-2">
                    Enter your password to confirm
                  </label>
                  <input
                    id="deletePassword"
                    v-model="deletePassword"
                    type="password"
                    class="w-full px-4 py-2.5 bg-black/30 border border-red-500/30 rounded-xl text-gray-100 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    placeholder="Enter your password"
                    required
                    minlength="8"
                  />
                </div>

                <!-- Error Message -->
                <div v-if="deleteError" class="bg-red-950/50 border border-red-500/30 rounded-xl p-3">
                  <p class="text-red-400 text-sm">{{ deleteError }}</p>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    @click="cancelDelete"
                    :disabled="deletingAccount"
                    class="glass-btn px-6 py-2.5 rounded-xl hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="deletingAccount || !deletePassword"
                    class="glass-btn-danger px-6 py-2.5 rounded-xl hover-lift flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon v-if="!deletingAccount" name="mdi:delete-forever" class="w-5 h-5" />
                    <Icon v-else name="mdi:loading" class="w-5 h-5 animate-spin" />
                    <span v-if="deletingAccount">Deleting...</span>
                    <span v-else>Permanently Delete Account</span>
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { user, fetchUser } = useAuth()
const { apiRequest } = useApi()

const profileForm = ref({
  username: '',
  email: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const selectedFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const updatingProfile = ref(false)
const updatingAvatar = ref(false)
const changingPassword = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Delete account state
const showDeleteModal = ref(false)
const deletePassword = ref('')
const deletingAccount = ref(false)
const deleteError = ref('')

// Initialize form with user data
watchEffect(() => {
  if (user.value) {
    profileForm.value.username = user.value.username
    profileForm.value.email = user.value.email
    
  }
})

// Clear messages after 5 seconds
const showMessage = (message: string, type: 'success' | 'error') => {
  if (type === 'success') {
    successMessage.value = message
    errorMessage.value = ''
  } else {
    errorMessage.value = message
    successMessage.value = ''
  }

  setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 5000)
}

// Update profile
const updateProfile = async () => {
  try {
    updatingProfile.value = true
    errorMessage.value = ''

    await apiRequest('/api/profile', {
      method: 'PATCH',
      body: {
        username: profileForm.value.username,
        email: profileForm.value.email,
      },
    })

    await fetchUser()
    showMessage('Profile updated successfully!', 'success')
  } catch (err: any) {
    showMessage(err.message || 'Failed to update profile', 'error')
  } finally {
    updatingProfile.value = false
  }
}

// Trigger file input
const triggerFileInput = () => {
  document.getElementById('avatarUpload')?.click()
}

// Handle file selection
const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    // Validate file type and size
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      showMessage('Only .jpg and .jpeg files are allowed', 'error')
      return
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      showMessage('File size must be less than 2MB', 'error')
      return
    }
    selectedFile.value = file

    // Create a preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Update avatar
const updateAvatar = async () => {
  if (!selectedFile.value) return

  try {
    updatingAvatar.value = true
    errorMessage.value = ''

    const formData = new FormData()
    formData.append('avatar', selectedFile.value)

    // Get CSRF token
    const csrfToken = await useApi().getCsrfToken()

    const config = useRuntimeConfig()

    // Use $fetch directly for file upload to avoid header issues
    await $fetch(`${config.public.apiBase}/api/profile/avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    })

    await fetchUser()
    showMessage('Avatar updated successfully!', 'success')
    selectedFile.value = null
    avatarPreview.value = null
  } catch (err: any) {
    console.error('Avatar upload error:', err)
    showMessage(err.data?.message || err.message || 'Failed to upload avatar', 'error')
  } finally {
    updatingAvatar.value = false
  }
}

// Change password
const changePassword = async () => {
  try {
    changingPassword.value = true
    errorMessage.value = ''

    // Validate passwords match
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      showMessage('New passwords do not match', 'error')
      return
    }

    await apiRequest('/api/profile/password', {
      method: 'PATCH',
      body: {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      },
    })

    // Clear form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    showMessage('Password changed successfully! Please log in again.', 'success')

    // Redirect to login after 2 seconds
    setTimeout(() => {
      navigateTo('/auth/login')
    }, 2000)
  } catch (err: any) {
    showMessage(err.message || 'Failed to change password', 'error')
  } finally {
    changingPassword.value = false
  }
}

// Get avatar URL
const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  if (!avatarUrl) return ''
  // If avatar is already a full URL, return it
  if (avatarUrl.startsWith('http')) return avatarUrl
  // Otherwise, prepend the API base URL
  const config = useRuntimeConfig()
  return `${config.public.apiBase}${avatarUrl}`
}

// Cancel delete
const cancelDelete = () => {
  showDeleteModal.value = false
  deletePassword.value = ''
  deleteError.value = ''
}

// Delete account
const deleteAccount = async () => {
  try {
    deletingAccount.value = true
    deleteError.value = ''

    await apiRequest('/api/profile', {
      method: 'DELETE',
      body: {
        password: deletePassword.value,
      },
    })

    // Account deleted successfully
    showMessage('Account deleted successfully. Redirecting...', 'success')

    // Redirect to home after 2 seconds
    setTimeout(() => {
      navigateTo('/')
    }, 2000)
  } catch (err: any) {
    deleteError.value = err.data?.message || 'Failed to delete account'
  } finally {
    deletingAccount.value = false
  }
}
</script>
