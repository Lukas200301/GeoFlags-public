<template>
  <div class="max-w-5xl mx-auto">
    <!-- Loading State -->
    <div v-if="!gameState" class="card p-12 text-center">
      <Icon name="mdi:loading" class="w-16 h-16 text-rose-500 mx-auto mb-4 animate-spin" />
      <p class="text-gray-300">Loading game...</p>
    </div>

    <!-- Game Screen -->
    <div v-else class="space-y-6">
      <!-- Score Header -->
      <div
        class="card p-6"
        v-motion
        :initial="{ opacity: 0, y: -20 }"
        :visible="{ opacity: 1, y: 0 }"
      >
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="bg-rose-500/20 rounded-xl p-3">
              <Icon name="mdi:trophy" class="w-8 h-8 text-rose-500" />
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

      <!-- Outline Display -->
      <div
        class="card p-8 md:p-12"
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :visible="{ opacity: 1, scale: 1, transition: { delay: 100 } }"
      >
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold text-gray-100 mb-6">Which country is this?</h2>

          <!-- SVG Outline -->
          <div class="relative inline-block w-full max-w-lg mx-auto">
            <div
              class="outline-container relative overflow-hidden rounded-xl shadow-2xl border-4 border-gray-700 bg-gray-900 p-6"
              style="aspect-ratio: 4/3"
            >
              <svg
                v-if="svgViewBox"
                :viewBox="svgViewBox"
                class="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  v-for="(d, i) in svgPaths"
                  :key="i"
                  :d="d"
                  fill="rgba(244, 63, 94, 0.25)"
                  stroke="rgba(244, 63, 94, 0.9)"
                  :stroke-width="strokeWidth"
                  stroke-linejoin="miter"
                  stroke-linecap="square"
                  vector-effect="non-scaling-stroke"
                />
              </svg>

              <!-- Feedback Overlay -->
              <transition name="feedback">
                <div
                  v-if="showFeedback"
                  class="absolute inset-0 flex items-center justify-center rounded-xl"
                  :class="isCorrect ? 'bg-green-500/90' : 'bg-red-500/90'"
                >
                  <Icon
                    :name="isCorrect ? 'mdi:check-circle' : 'mdi:close-circle'"
                    class="w-24 h-24 text-white animate-bounce"
                  />
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Options -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <button
            v-for="(option, index) in gameState.options"
            :key="option.id"
            @click="handleAnswer(option.id)"
            :disabled="loading || showFeedback"
            class="option-button"
            :class="{
              'option-selected': selectedAnswer === option.id,
              'option-correct': showFeedback && isCorrect && selectedAnswer === option.id,
              'option-wrong': showFeedback && !isCorrect && selectedAnswer === option.id,
            }"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :visible="{ opacity: 1, x: 0, transition: { delay: 200 + index * 50 } }"
          >
            <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
            <span class="option-text">{{ option.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quit Confirmation Dialog -->
    <div
      v-if="showQuitDialog"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <div class="card max-w-md w-full p-6">
        <h3 class="text-2xl font-bold text-gray-100 mb-4">Quit Game?</h3>
        <p class="text-gray-300 mb-6">
          Are you sure you want to quit? Your current score of
          <strong class="text-rose-400">{{ gameState?.score || 0 }}</strong> will be lost.
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
definePageMeta({
  layout: 'default',
  middleware: 'can-play',
})

const router = useRouter()
const {
  gameState,
  loading,
  selectedAnswer,
  showFeedback,
  isCorrect,
  gameOver,
  submitAnswer,
  resetGame,
} = useSilhouette()

const showQuitDialog = ref(false)

// Parse GeoJSON into SVG paths
const svgPaths = computed(() => {
  if (!gameState.value?.outline) return []
  return geoJsonToSvgPaths(gameState.value.outline)
})

const svgViewBox = computed(() => {
  if (!gameState.value?.outline) return null
  return computeViewBox(gameState.value.outline)
})

// With vector-effect="non-scaling-stroke", this is in screen pixels
const strokeWidth = 2

/**
 * Convert GeoJSON coordinates to SVG path data
 */
function geoJsonToSvgPaths(geojson: any): string[] {
  const paths: string[] = []

  const processCoordinates = (coords: number[][]) => {
    if (coords.length === 0) return ''
    return coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0]},${-c[1]}`).join(' ') + 'Z'
  }

  const processGeometry = (geometry: any) => {
    if (!geometry) return
    if (geometry.type === 'Polygon') {
      for (const ring of geometry.coordinates) {
        const d = processCoordinates(ring)
        if (d) paths.push(d)
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          const d = processCoordinates(ring)
          if (d) paths.push(d)
        }
      }
    }
  }

  if (geojson.type === 'FeatureCollection') {
    for (const feature of geojson.features || []) {
      processGeometry(feature.geometry)
    }
  } else if (geojson.type === 'Feature') {
    processGeometry(geojson.geometry)
  } else {
    processGeometry(geojson)
  }

  return paths
}

/**
 * Compute a viewBox that fits all the GeoJSON coordinates
 */
function computeViewBox(geojson: any): string {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  const gatherCoords = (coords: number[][]) => {
    for (const c of coords) {
      if (c[0] < minX) minX = c[0]
      if (-c[1] < minY) minY = -c[1]
      if (c[0] > maxX) maxX = c[0]
      if (-c[1] > maxY) maxY = -c[1]
    }
  }

  const processGeometry = (geometry: any) => {
    if (!geometry) return
    if (geometry.type === 'Polygon') {
      for (const ring of geometry.coordinates) gatherCoords(ring)
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) gatherCoords(ring)
      }
    }
  }

  if (geojson.type === 'FeatureCollection') {
    for (const feature of geojson.features || []) processGeometry(feature.geometry)
  } else if (geojson.type === 'Feature') {
    processGeometry(geojson.geometry)
  } else {
    processGeometry(geojson)
  }

  const padX = (maxX - minX) * 0.1
  const padY = (maxY - minY) * 0.1

  return `${minX - padX} ${minY - padY} ${maxX - minX + padX * 2} ${maxY - minY + padY * 2}`
}

// Watch for game over
watch(gameOver, (isOver) => {
  if (isOver) {
    setTimeout(() => {
      router.push('/play/silhouette/results')
    }, 1500)
  }
})

const handleAnswer = async (answerId: string) => {
  if (loading.value || showFeedback.value) return
  try {
    await submitAnswer(answerId)
  } catch (error: any) {
    console.error('Answer error:', error)
  }
}

const confirmQuit = () => {
  resetGame()
  showQuitDialog.value = false
  router.push('/play/silhouette')
}

onMounted(() => {
  if (!gameState.value) {
    router.push('/play/silhouette')
  }
})
</script>

<style scoped>
.outline-container {
  user-select: none;
  -webkit-user-select: none;
}

.option-button {
  @apply relative flex items-center gap-4 p-4 rounded-xl border-2 border-gray-700;
  @apply bg-gray-800 hover:bg-gray-700 hover:border-rose-500;
  @apply transition-all duration-200 text-left;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.option-button:hover:not(:disabled) {
  @apply transform scale-[1.02] shadow-lg;
}

.option-button:active:not(:disabled) {
  @apply transform scale-[0.98];
}

.option-letter {
  @apply flex items-center justify-center w-10 h-10 rounded-lg;
  @apply bg-rose-500/20 text-rose-400 font-bold text-lg;
  @apply flex-shrink-0;
}

.option-text {
  @apply text-gray-100 font-medium text-lg;
}

.option-selected {
  @apply border-rose-500 bg-rose-500/10;
}

.option-correct {
  @apply border-green-500 bg-green-500/10;
}

.option-correct .option-letter {
  @apply bg-green-500/30 text-green-400;
}

.option-wrong {
  @apply border-red-500 bg-red-500/10;
}

.option-wrong .option-letter {
  @apply bg-red-500/30 text-red-400;
}

.feedback-enter-active,
.feedback-leave-active {
  transition: opacity 0.3s ease;
}

.feedback-enter-from,
.feedback-leave-to {
  opacity: 0;
}

::selection {
  background: transparent;
}
</style>
