<template>
  <div class="max-w-5xl mx-auto">
    <!-- Loading State -->
    <div v-if="!gameState" class="card p-12 text-center">
      <Icon name="mdi:loading" class="w-16 h-16 text-sky-500 mx-auto mb-4 animate-spin" />
      <p class="text-gray-300">Loading game...</p>
    </div>

    <!-- Game Screen -->
    <div v-else class="space-y-6">
      <!-- Score Header -->
      <div class="card p-6" v-motion :initial="{ opacity: 0, y: -20 }" :visible="{ opacity: 1, y: 0 }">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="bg-sky-500/20 rounded-xl p-3">
              <Icon name="mdi:trophy" class="w-8 h-8 text-sky-500" />
            </div>
            <div>
              <p class="text-sm text-gray-400">Current Score</p>
              <p class="text-3xl font-bold text-gray-100">{{ gameState.score }}</p>
            </div>
          </div>
          <button
            @click="showQuitDialog = true"
            class="btn-secondary px-4 py-2 text-sm"
            :disabled="loading"
          >
            <Icon name="mdi:close" class="w-5 h-5" />
            <span>Quit</span>
          </button>
        </div>
      </div>

      <!-- Country Info -->
      <div
        class="card p-8"
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :visible="{ opacity: 1, scale: 1, transition: { delay: 100 } }"
      >
        <div class="flex items-center justify-center gap-6 mb-6">
          <img
            :src="gameState.flagImage"
            :alt="`${gameState.countryName} flag`"
            class="w-24 h-16 object-cover rounded-lg shadow-lg border-2 border-gray-700"
          />
          <div>
            <h2 class="text-3xl font-bold text-gray-100">{{ gameState.countryName }}</h2>
            <p class="text-gray-400">Click on the capital city location</p>
          </div>
        </div>

        <!-- Map Container -->
        <div class="relative h-[500px]">
          <ClientOnly>
            <div
              ref="mapContainer"
              class="w-full h-full bg-gray-900 border-4 border-gray-700 rounded-xl"
            ></div>
            <template #fallback>
              <div class="w-full h-full bg-gray-900 border-4 border-gray-700 rounded-xl flex items-center justify-center">
                <div class="text-center">
                  <Icon name="mdi:loading" class="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                  <p class="text-gray-400">Loading map...</p>
                </div>
              </div>
            </template>
          </ClientOnly>

          <!-- Feedback Overlay -->
          <transition name="feedback">
            <div
              v-if="showFeedback"
              class="absolute inset-0 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm z-50"
            >
              <div class="text-center max-w-md px-6">
                <Icon
                  :name="isCorrect ? 'mdi:check-circle' : 'mdi:close-circle'"
                  :class="[
                    'w-24 h-24 mx-auto mb-4',
                    isCorrect ? 'text-green-400' : 'text-red-400'
                  ]"
                />
                <h3 class="text-3xl font-bold text-white mb-2">
                  {{ isCorrect ? 'Correct!' : 'Wrong!' }}
                </h3>
                <p class="text-xl text-gray-300 mb-1">
                  {{ gameState?.capitalName }}, {{ gameState?.countryName }}
                </p>
                <p class="text-lg mb-6" :class="isCorrect ? 'text-green-400' : 'text-red-400'">
                  You were {{ lastDistance.toLocaleString() }} km away
                </p>
                <button
                  v-if="isCorrect"
                  @click="continueToNext"
                  class="btn-primary px-8 py-3 text-lg"
                >
                  <Icon name="mdi:arrow-right" class="w-6 h-6" />
                  <span>Next Country</span>
                </button>
                <button
                  v-else
                  @click="handleGameOver"
                  class="btn-secondary px-8 py-3 text-lg"
                >
                  <Icon name="mdi:flag-checkered" class="w-6 h-6" />
                  <span>View Results</span>
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Instructions -->
        <div class="mt-4 text-center text-gray-400 text-sm">
          <Icon name="mdi:information" class="w-4 h-4 inline mr-1" />
          Click anywhere on the map to place your guess. Get within 250km of the capital!
        </div>
      </div>
    </div>

    <!-- Quit Confirmation Dialog -->
    <div v-if="showQuitDialog" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="card max-w-md w-full p-6">
        <h3 class="text-2xl font-bold text-gray-100 mb-4">Quit Game?</h3>
        <p class="text-gray-300 mb-6">
          Are you sure you want to quit? Your current score of <strong class="text-sky-400">{{ gameState?.score || 0 }}</strong> will be lost.
        </p>
        <div class="flex gap-4">
          <button @click="showQuitDialog = false" class="btn-secondary flex-1">
            Continue Playing
          </button>
          <button @click="confirmQuit" class="btn-primary flex-1 bg-red-600 hover:bg-red-500">
            Quit Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Find the Capital - Game Screen
 * Main gameplay screen with interactive map
 */
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

definePageMeta({
  layout: 'default',
  middleware: 'can-play',
})

const router = useRouter()
const {
  gameState,
  loading,
  showFeedback,
  isCorrect,
  lastDistance,
  submitAnswer,
  continueGame,
  resetGame,
} = useFindTheCapital()

const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null
let clickMarker: maplibregl.Marker | null = null
let capitalMarker: maplibregl.Marker | null = null
const showQuitDialog = ref(false)

/**
 * Handle map click
 */
const handleMapClick = async (e: maplibregl.MapMouseEvent) => {
  if (loading.value || showFeedback.value || !gameState.value) return

  const { lng, lat } = e.lngLat

  // Place user's guess marker
  if (clickMarker) {
    clickMarker.remove()
  }
  clickMarker = new maplibregl.Marker({ color: '#0ea5e9' })
    .setLngLat([lng, lat])
    .addTo(map!)

  // Submit answer
  await submitAnswer(lat, lng)

  // Show capital location
  if (capitalMarker) {
    capitalMarker.remove()
  }
  capitalMarker = new maplibregl.Marker({ color: '#22c55e' })
    .setLngLat([gameState.value.capitalLng, gameState.value.capitalLat])
    .addTo(map!)
}

/**
 * Continue to next country
 */
const continueToNext = async () => {
  // Remove markers
  if (clickMarker) clickMarker.remove()
  if (capitalMarker) capitalMarker.remove()
  clickMarker = null
  capitalMarker = null
  
  // Load next country
  await continueGame()
}

/**
 * Handle game over
 */
const handleGameOver = () => {
  router.push('/play/find-capital/results')
}

/**
 * Handle quit game
 */
const confirmQuit = () => {
  if (map) {
    map.remove()
    map = null
  }
  resetGame()
  showQuitDialog.value = false
  router.push('/play/find-capital')
}

/**
 * Initialize map
 */
const initMap = async () => {
  if (!mapContainer.value) {
    console.error('Map container not available')
    return
  }

  try {
    console.log('Initializing map...')

    map = new maplibregl.Map({
      container: mapContainer.value,
      style: {
        version: 8,
        sources: {
          'satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '© Esri'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite',
            minzoom: 0,
            maxzoom: 22
          }
        ],
        projection: {
          type: 'globe'
        }
      },
      center: [0, 20],
      zoom: 1.2,
      pitch: 0,
      bearing: 0
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    
    map.on('click', handleMapClick)

    map.on('load', () => {
      console.log('Map loaded successfully')
    })

    map.on('error', (e) => {
      console.error('Map error:', e)
    })
  } catch (error) {
    console.error('Failed to initialize map:', error)
  }
}

// Redirect if no active game, then init map
onMounted(() => {
  if (!gameState.value) {
    router.push('/play/find-capital')
  } else {
    // Wait for ClientOnly to render the container
    nextTick(() => {
      setTimeout(() => {
        if (mapContainer.value) {
          initMap()
        } else {
          console.error('Map container still not available after waiting')
        }
      }, 100)
    })
  }
})

// Cleanup
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
/* Feedback Animation */
.feedback-enter-active,
.feedback-leave-active {
  transition: opacity 0.3s ease;
}

.feedback-enter-from,
.feedback-leave-to {
  opacity: 0;
}
</style>
