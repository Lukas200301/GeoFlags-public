<template>
  <div class="home-page">
    <div class="page-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <client-only>
            <h1
              v-motion
              :initial="{ opacity: 0, y: 50 }"
              :enter="{ opacity: 1, y: 0 }"
              :delay="200"
              class="text-5xl md:text-7xl font-bold mb-6"
            >
              Welcome to
              <span class="gradient-text">GeoFlags</span>
            </h1>
            <p
              v-motion
              :initial="{ opacity: 0, y: 50 }"
              :enter="{ opacity: 1, y: 0 }"
              :delay="400"
              class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Master world geography through engaging quizzes and challenges. Learn about countries,
              flags, and more while competing with players worldwide!
            </p>
            <div
              v-motion
              :initial="{ opacity: 0, y: 50 }"
              :enter="{ opacity: 1, y: 0 }"
              :delay="600"
              class="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <NuxtLink
                to="/play"
                class="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2 group"
              >
                <Icon
                  name="mdi:play-circle"
                  class="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                />
                <span>Play Now</span>
              </NuxtLink>
              <NuxtLink
                to="/leaderboard"
                class="btn-secondary text-lg px-8 py-4 inline-flex items-center space-x-2 group"
              >
                <Icon
                  name="mdi:trophy"
                  class="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
                />
                <span>View Leaderboard</span>
              </NuxtLink>
            </div>
          </client-only>
        </div>
      </section>

      <div class="max-w-6xl mx-auto px-4">
        <client-only>
          <!-- Community Stats -->
          <div v-motion-fade-visible class="glass-card-dark p-8 text-center mb-16">
            <h2 class="text-3xl font-bold gradient-text mb-8">Community Stats</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div v-for="stat in stats" :key="stat.label" class="text-center group">
                <div
                  class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  :class="stat.gradient"
                >
                  <Icon :name="stat.icon" class="w-8 h-8 text-white" />
                </div>
                <div
                  class="text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform duration-300"
                >
                  {{ stat.value }}
                </div>
                <div class="text-sm text-gray-300">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </client-only>

        <client-only>
          <!-- Features Grid -->
          <div v-motion-fade-visible class="text-center mb-16">
            <h2 class="text-3xl font-bold gradient-text mb-12">Why GeoFlags?</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div
                v-for="(feature, index) in features"
                :key="feature.title"
                v-motion-fade-visible
                :delay="200 * index"
                class="glass-card p-6 text-center group cursor-pointer hover-lift"
              >
                <div
                  class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:rotate-12 transition-all duration-300 shadow-lg"
                >
                  <Icon
                    :name="feature.icon"
                    class="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3
                  class="text-xl font-bold text-gray-100 mb-2 group-hover:text-blue-400 transition-colors duration-300"
                >
                  {{ feature.title }}
                </h3>
                <p class="text-gray-300 text-sm">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </client-only>

        <client-only>
          <!-- How It Works -->
          <div v-motion-fade-visible class="text-center mb-16">
            <h2 class="text-3xl font-bold gradient-text mb-8">How It Works</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div v-for="(step, index) in steps" :key="step.title" class="text-center group">
                <div
                  class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg"
                >
                  {{ index + 1 }}
                </div>
                <h3
                  class="text-lg font-bold text-gray-100 mb-2 group-hover:text-cyan-400 transition-colors duration-300"
                >
                  {{ step.title }}
                </h3>
                <p class="text-gray-300">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </client-only>

        <client-only>
          <!-- Call to Action -->
          <div v-motion-fade-visible class="glass-card-dark p-12 text-center mb-16">
            <h2 class="text-4xl font-bold gradient-text mb-4">Ready to Test Your Knowledge?</h2>
            <p class="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of players worldwide and start your geography journey today!
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NuxtLink
                v-if="!user"
                to="/auth/register"
                class="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2 group"
              >
                <Icon
                  name="mdi:account-plus"
                  class="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
                />
                <span>Sign Up Free</span>
              </NuxtLink>
              <NuxtLink
                to="/play"
                class="btn-secondary text-lg px-8 py-4 inline-flex items-center space-x-2 group"
              >
                <Icon
                  name="mdi:play-circle"
                  class="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                />
                <span>Start Playing</span>
              </NuxtLink>
            </div>
          </div>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()

interface Stats {
  totalUsers: number
  totalGames: number
  gameModes: number
  totalCountries: number
}

const statsData = ref<Stats>({
  totalUsers: 0,
  totalGames: 0,
  gameModes: 0,
  totalCountries: 250,
})

const stats = computed(() => [
  {
    label: 'Total Players',
    value: statsData.value.totalUsers.toLocaleString(),
    icon: 'mdi:account-group',
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  },
  {
    label: 'Games Completed',
    value: statsData.value.totalGames.toLocaleString(),
    icon: 'mdi:gamepad-variant',
    gradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
  },
  {
    label: 'Game Modes',
    value: statsData.value.gameModes.toString(),
    icon: 'mdi:format-list-bulleted',
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  {
    label: 'Countries',
    value: statsData.value.totalCountries.toString(),
    icon: 'mdi:earth',
    gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
  },
])

const features = [
  {
    title: 'Multiple Game Modes',
    description: 'Challenge yourself with various quiz formats and difficulty levels',
    icon: 'mdi:gamepad-variant',
  },
  {
    title: 'Global Leaderboard',
    description: 'Compete with players worldwide and climb the rankings',
    icon: 'mdi:trophy',
  },
  {
    title: 'Track Your Progress',
    description: 'Monitor your performance and watch your skills improve',
    icon: 'mdi:chart-line',
  },
]

const steps = [
  {
    title: 'Choose Your Challenge',
    description: 'Pick from different game modes that match your learning style',
  },
  {
    title: 'Test Your Knowledge',
    description: 'Answer questions and learn fascinating facts along the way',
  },
  {
    title: 'Compete & Improve',
    description: 'Earn points, track progress, and rise through the ranks',
  },
]

// Fetch public stats
const fetchPublicStats = async () => {
  try {
    const data = await $fetch('/api/users/stats/public')
    statsData.value = data
  } catch (error) {
    console.error('Failed to fetch public stats:', error)
    // Use default values on error
    statsData.value = {
      totalUsers: 0,
      totalGames: 0,
      gameModes: 4,
      totalCountries: 250,
    }
  }
}

onMounted(() => {
  fetchPublicStats()
})
</script>

<style scoped>
.home-page {
  position: relative;
}

.page-content {
  position: relative;
  z-index: 1;
  color: white;
}

.hero-section {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero-content {
  padding: 2rem;
}

.gradient-text {
  background: -webkit-linear-gradient(45deg, #3b82f6, #8b5cf6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  transition:
    background-color 0.3s,
    transform 0.3s;
}

.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  transition:
    background-color 0.3s,
    color 0.3s,
    transform 0.3s;
}

.btn-secondary:hover {
  background-color: #3b82f6;
  color: white;
  transform: translateY(-2px);
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.glass-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2);
}

.glass-card-dark {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hover-lift {
  transition: transform 0.3s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-5px);
}
</style>
