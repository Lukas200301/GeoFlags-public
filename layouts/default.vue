<template>
  <div class="min-h-screen flex relative overflow-hidden">
    <!-- The animated gradient background is now defined globally in main.css -->

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

    <!-- Left Sidebar with Glassmorphism -->
    <aside
      class="glass-sidebar flex flex-col fixed h-screen z-50 transition-all duration-500 ease-in-out"
      :class="[
        sidebarCollapsed ? 'w-20' : 'w-64',
        !sidebarOpen && 'lg:translate-x-0 -translate-x-full',
      ]"
    >
      <!-- Logo & App Name -->
      <div class="p-6 border-b border-white/10">
        <NuxtLink
          to="/"
          class="flex items-center group"
          :class="sidebarCollapsed ? 'justify-center' : 'space-x-3'"
        >
          <img
            src="/assets/images/image.png"
            alt="GeoFlags Logo"
            :class="sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'"
            class="object-contain hover-lift transition-all duration-300"
          />
          <div v-if="!sidebarCollapsed" class="overflow-hidden">
            <h1 class="text-xl font-bold gradient-text">GeoFlags</h1>
            <p class="text-xs text-gray-300">Geography Quiz</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Collapse Toggle (Desktop Only) -->
      <button
        @click="toggleCollapse"
        class="hidden lg:flex absolute -right-3 top-20 w-6 h-6 glass-btn items-center justify-center hover:scale-110 z-10 p-0 rounded-full"
      >
        <Icon
          :key="sidebarCollapsed ? 'right' : 'left'"
          :name="sidebarCollapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'"
          class="w-4 h-4 text-gray-100 transition-transform duration-300"
        />
      </button>

      <!-- Navigation Links -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        <NuxtLink
          v-for="link in navigationLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center rounded-xl transition-all duration-300 group relative hover-lift"
          :class="[
            sidebarCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3',
            sidebarCollapsed ? 'bg-black/20 hover:bg-black/30' : '',
            isLinkActive(link.to) ? 'glass-card-primary' : '',
          ]"
        >
          <Icon
            :name="link.icon"
            class="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-all duration-300 relative z-10 group-hover:scale-110"
          />
          <span
            v-if="!sidebarCollapsed"
            class="font-medium text-gray-100 group-hover:text-blue-400 transition-all duration-300 relative z-10"
          >
            {{ link.label }}
          </span>
          <!-- Tooltip for collapsed state -->
          <div
            v-if="sidebarCollapsed"
            class="absolute left-full ml-2 px-3 py-1 glass-card text-gray-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-xl group-hover:translate-x-2"
          >
            {{ link.label }}
          </div>
        </NuxtLink>

        <!-- Expandable Play Menu -->
        <div>
          <button
            @click="togglePlayMenu"
            class="w-full flex items-center rounded-xl transition-all duration-300 group relative hover-lift"
            :class="[
              sidebarCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3',
              sidebarCollapsed ? 'bg-black/20 hover:bg-black/30' : '',
              isPlayMenuActive() ? 'glass-card-primary' : '',
            ]"
          >
            <Icon
              name="mdi:gamepad-variant"
              class="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-all duration-300 relative z-10 group-hover:scale-110"
            />
            <span
              v-if="!sidebarCollapsed"
              class="flex-1 font-medium text-gray-100 group-hover:text-blue-400 transition-all duration-300 relative z-10 text-left"
            >
              Play
            </span>
            <Icon
              v-if="!sidebarCollapsed"
              :name="playMenuExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'"
              class="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-all duration-300 relative z-10"
            />
            <!-- Tooltip for collapsed state -->
            <div
              v-if="sidebarCollapsed"
              class="absolute left-full ml-2 px-3 py-1 glass-card text-gray-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-xl group-hover:translate-x-2"
            >
              Play
            </div>
          </button>

          <!-- Play Submenu -->
          <div
            v-if="playMenuExpanded && !sidebarCollapsed"
            class="mt-1 ml-4 space-y-1 border-l-2 border-white/10 pl-2"
          >
            <NuxtLink
              v-for="sublink in playSubLinks"
              :key="sublink.to"
              :to="sublink.to"
              class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group relative hover-lift"
              :class="isLinkActive(sublink.to) ? 'glass-card-primary' : ''"
            >
              <Icon
                :name="sublink.icon"
                class="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-all duration-300 relative z-10 group-hover:scale-110"
              />
              <span
                class="font-medium text-sm text-gray-100 group-hover:text-blue-400 transition-all duration-300 relative z-10"
              >
                {{ sublink.label }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Admin Section (Only visible to admins) -->
        <div v-if="isAdmin" class="pt-4 mt-4 border-t border-white/10">
          <div
            v-if="!sidebarCollapsed"
            class="px-4 py-2 text-xs font-semibold text-red-400 uppercase tracking-wider"
          >
            Admin Panel
          </div>

          <NuxtLink
            v-for="link in adminLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center rounded-xl transition-all duration-300 group relative hover-lift"
            :class="[
              sidebarCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3',
              sidebarCollapsed ? 'bg-black/20 hover:bg-black/30' : '',
              isLinkActive(link.to) ? 'glass-card-primary' : '',
            ]"
          >
            <Icon
              :name="link.icon"
              class="w-5 h-5 text-gray-300 group-hover:text-red-400 group-hover:scale-110 transition-all duration-300 relative z-10"
            />
            <span
              v-if="!sidebarCollapsed"
              class="font-medium text-gray-100 group-hover:text-red-400 transition-all duration-300 relative z-10"
            >
              {{ link.label }}
            </span>
            <!-- Tooltip for collapsed state -->
            <div
              v-if="sidebarCollapsed"
              class="absolute left-full ml-2 px-3 py-1 glass-card text-gray-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-xl group-hover:translate-x-2"
            >
              {{ link.label }}
            </div>
          </NuxtLink>
        </div>
      </nav>

      <!-- Bottom Links (About) -->
      <div class="p-4 border-t border-white/10">
        <NuxtLink
          v-for="link in bottomLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center rounded-xl transition-all duration-300 group relative hover-lift"
          :class="[
            sidebarCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3',
            sidebarCollapsed ? 'bg-black/20 hover:bg-black/30' : '',
            isLinkActive(link.to) ? 'glass-card-primary' : '',
          ]"
        >
          <Icon
            :name="link.icon"
            class="w-5 h-5 text-gray-300 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300 relative z-10"
          />
          <span
            v-if="!sidebarCollapsed"
            class="font-medium text-gray-100 group-hover:text-blue-400 transition-all duration-300 relative z-10"
          >
            {{ link.label }}
          </span>
          <!-- Tooltip for collapsed state -->
          <div
            v-if="sidebarCollapsed"
            class="absolute left-full ml-2 px-3 py-1 glass-card text-gray-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-xl group-hover:translate-x-2"
          >
            {{ link.label }}
          </div>
        </NuxtLink>
      </div>

      <!-- User Profile Section -->
      <div class="p-4 border-t border-white/10">
        <NuxtLink
          v-if="user"
          to="/profile"
          class="mb-3 cursor-pointer hover:opacity-80 transition-opacity block"
          :class="sidebarCollapsed ? 'flex justify-center' : 'flex items-center space-x-3'"
        >
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-semibold shadow-lg hover-lift overflow-hidden"
          >
            <img
              v-if="user.avatarUrl"
              :src="getAvatarUrl(user.avatarUrl)"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ user.username.charAt(0).toUpperCase() }}</span>
          </div>
          <div v-if="!sidebarCollapsed" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-100 truncate">{{ user.username }}</p>
            <p class="text-xs text-gray-300 truncate">{{ user.email }}</p>
          </div>
        </NuxtLink>

        <button
          v-if="user"
          @click="handleLogout"
          class="btn-danger w-full flex items-center space-x-2"
          :class="sidebarCollapsed && 'justify-center px-0'"
          :disabled="loading"
        >
          <Icon name="mdi:logout" class="w-5 h-5" />
          <span v-if="!sidebarCollapsed">Logout</span>
        </button>

        <NuxtLink
          v-else
          to="/auth/login"
          class="btn-primary w-full flex items-center space-x-2"
          :class="sidebarCollapsed && 'justify-center px-0'"
        >
          <Icon name="mdi:login" class="w-5 h-5" />
          <span v-if="!sidebarCollapsed">Login</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Mobile Sidebar Toggle -->
    <button
      @click="toggleSidebar"
      class="lg:hidden fixed z-50 p-3 glass-btn rounded-xl shadow-2xl hover:scale-110 transition-all duration-300"
      :class="sidebarOpen ? 'top-4 right-4' : 'top-4 left-4'"
    >
      <Icon :name="sidebarOpen ? 'mdi:close' : 'mdi:menu'" class="w-6 h-6 text-gray-100" />
    </button>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="lg:hidden fixed inset-0 glass-overlay z-40 transition-opacity duration-300"
    ></div>

    <!-- Main Content Area -->
    <main
      class="flex-1 transition-all duration-500 ease-in-out relative z-10"
      :class="sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'"
    >
      <div class="p-6 lg:p-8">
        <slot />
      </div>
    </main>

    <!-- Toast Notification System -->
    <AdminToastSystem />

    <!-- Global Re-auth Modal -->
  </div>
</template>

<script setup lang="ts">
/**
 * Default layout with collapsible left sidebar navigation
 *
 * SECURITY:
 * - Admin links only render if user.role === 'admin' (verified server-side)
 * - Backend enforces role checks on all admin routes
 */
const { user, isAdmin, logout, loading, fetchUser } = useAuth()
const sidebarOpen = ref(true)
const { sidebarCollapsed } = useSidebar()

// State for expandable Play menu
const playMenuExpanded = ref(false)

// Navigation links
const navigationLinks = [
  { to: '/', label: 'Home', icon: 'mdi:home' },
  { to: '/learn', label: 'Learn', icon: 'mdi:book-open-page-variant' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'mdi:trophy' },
]

// Play submenu links
const playSubLinks = [
  { to: '/play/solo', label: 'Solo Play', icon: 'mdi:account' },
  { to: '/friends', label: 'Friends', icon: 'mdi:account-group' },
  { to: '/battles', label: 'Battles', icon: 'mdi:sword-cross' },
]

// Bottom links (above user profile)
const bottomLinks = [{ to: '/about', label: 'About', icon: 'mdi:information' }]

// Admin links (only visible to admins)
const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: 'mdi:view-dashboard' },
  { to: '/admin/users', label: 'Users', icon: 'mdi:account-group' },
  { to: '/admin/game-modes', label: 'Game Modes', icon: 'mdi:gamepad' },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: 'mdi:format-list-numbered' },
  { to: '/admin/stats', label: 'Statistics', icon: 'mdi:chart-bar' },
  { to: '/admin/audit-log', label: 'Audit Log', icon: 'mdi:file-document-outline' },
  { to: '/admin/database', label: 'Database', icon: 'mdi:database' },
]

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  // Save preference to localStorage
  if (import.meta.client) {
    localStorage.setItem('sidebar-collapsed', sidebarCollapsed.value.toString())
  }
}

const togglePlayMenu = () => {
  playMenuExpanded.value = !playMenuExpanded.value
}

// Check if any play submenu link is active
const isPlayMenuActive = () => {
  const currentPath = route.path
  return playSubLinks.some((link) => {
    if (link.to === currentPath) return true
    if (currentPath.startsWith(link.to + '/')) return true
    return false
  })
}

const handleLogout = async () => {
  // Just call logout - it already handles navigation internally
  await logout()
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

// Check if a link is active (including nested routes)
const isLinkActive = (linkPath: string) => {
  const currentPath = route.path

  // Exact match for home page
  if (linkPath === '/' && currentPath === '/') {
    return true
  }

  // Exact match for /admin dashboard
  if (linkPath === '/admin' && currentPath === '/admin') {
    return true
  }

  // For other routes, check if current path starts with link path
  // But prevent /admin from matching /admin/* routes
  if (linkPath !== '/' && linkPath !== '/admin' && currentPath.startsWith(linkPath)) {
    return true
  }

  // For /admin/* routes (not /admin itself), check if it starts with the link path
  if (linkPath.startsWith('/admin/') && currentPath.startsWith(linkPath)) {
    return true
  }

  return false
}

// Auto-close sidebar on mobile when navigating
const route = useRoute()
watch(
  () => route.path,
  () => {
    if (window.innerWidth < 1024) {
      sidebarOpen.value = false
    }

    // Auto-expand Play menu if on a play-related route
    if (isPlayMenuActive()) {
      playMenuExpanded.value = true
    }
  }
)

// Initialize sidebar state and fetch user
onMounted(() => {
  // Fetch user data if not already loaded
  if (!user.value) {
    fetchUser().catch(() => {
      // Silently fail if not authenticated
    })
  }

  if (window.innerWidth >= 1024) {
    sidebarOpen.value = true
    // Load collapsed preference from localStorage
    const savedCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsed !== null) {
      sidebarCollapsed.value = savedCollapsed === 'true'
    }
  } else {
    sidebarOpen.value = false
  }

  // Auto-expand Play menu if on a play-related route
  if (isPlayMenuActive()) {
    playMenuExpanded.value = true
  }
})
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
