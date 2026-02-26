<template>
  <div class="relative w-full h-full min-h-[600px] bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl">
    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/80">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-400">Loading interactive map...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/80">
      <div class="text-center max-w-md mx-auto px-4">
        <Icon name="mdi:earth-off" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p class="text-red-400 font-semibold mb-2">Failed to load map</p>
        <p class="text-gray-400 text-sm mb-4">{{ errorMessage }}</p>
        <button
          @click="retryLoad"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full" :class="{ 'opacity-0': loading || error }"></div>

    <!-- Controls -->
    <div v-if="!loading && !error" class="absolute top-4 right-4 flex flex-col gap-2 z-20">
      <button
        @click="resetView"
        class="p-3 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-700 transition-all shadow-lg group"
        title="Reset View"
      >
        <Icon name="mdi:restore" class="w-5 h-5 text-gray-300 group-hover:text-primary-400 transition-colors" />
      </button>
    </div>

    <!-- Info Panel -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="hoveredCountry && !loading && !error" class="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-sm bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl z-20">
        <div class="flex items-center gap-3 mb-2">
          <img
            :src="hoveredCountry.flag"
            :alt="`Flag of ${hoveredCountry.name}`"
            class="w-16 h-10 object-cover rounded border border-gray-600 shadow-md"
          />
          <div class="flex-1">
            <p class="font-bold text-gray-100">{{ hoveredCountry.name }}</p>
            <p class="text-xs text-gray-400">{{ hoveredCountry.region }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <Icon name="mdi:information" class="w-4 h-4" />
          <span>Click to view details</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Country } from '~/composables/useCountries'

const props = defineProps<{
  countries: Country[]
}>()

const emit = defineEmits<{
  countryClick: [country: Country]
}>()

const mapContainer = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const hoveredCountry = ref<Country | null>(null)

let map: maplibregl.Map | null = null
let countryByName: Map<string, Country> | null = null

const initMap = async () => {
  if (!mapContainer.value) return

  try {
    loading.value = true
    error.value = false
    errorMessage.value = ''

    // Build country lookup map
    countryByName = new Map()
    props.countries.forEach(country => {
      if (country.name) countryByName!.set(country.name.toLowerCase(), country)
    })

    const config = useRuntimeConfig()
    const apiBaseUrl = config.public.apiBase || 'http://localhost:3001'

    // Initialize map with satellite imagery and globe projection
    map = new maplibregl.Map({
      container: mapContainer.value,
      style: {
        version: 8,
        sources: {
          'basemap': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '© Esri'
          },
          'basemap-labels': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256
          },
          'countries': {
            type: 'geojson',
            data: `${apiBaseUrl}/api/map`,
            promoteId: 'ISO_A2' // Uses ISO_A2 property as the feature.id for setFeatureState
          }
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap',
            minzoom: 0,
            maxzoom: 22
          },
          {
            id: 'basemap-labels-layer',
            type: 'raster',
            source: 'basemap-labels',
            minzoom: 0,
            maxzoom: 22
          },
          {
            id: 'countries-fill',
            type: 'fill',
            source: 'countries',
            paint: {
              'fill-color': 'rgba(34, 211, 238, 0.2)', // Cyan glow
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.6,
                0.0
              ]
            }
          },
          {
            id: 'countries-outline',
            type: 'line',
            source: 'countries',
            paint: {
              'line-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                'rgba(34, 211, 238, 1)',   // Bright cyan on hover
                'rgba(34, 211, 238, 0.4)'  // Dim cyan normally
              ],
              'line-width': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                2.5,
                1.5
              ],
              'line-opacity': 0.8
            }
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

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

    let hoveredFeatureId: string | number | null = null

    // Mouse move handler for hover effect
    map.on('mousemove', 'countries-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const featureId = e.features[0].id;
        
        // Only attempt to set state if the feature actually has an ID
        if (featureId !== undefined && featureId !== null) {
          if (hoveredFeatureId !== null && hoveredFeatureId !== featureId) {
            map!.setFeatureState(
              { source: 'countries', id: hoveredFeatureId },
              { hover: false }
            )
          }
          
          hoveredFeatureId = featureId
          map!.setFeatureState(
            { source: 'countries', id: hoveredFeatureId },
            { hover: true }
          )
        }

        const featProps = e.features[0].properties;
        const countryCode = featProps?.ISO_A2;
        const countryName = featProps?.NAME || featProps?.ADMIN;
        
        let country = null;
        if (countryCode) {
           country = props.countries.find((c: any) => c.code === countryCode);
        }
        if (!country && countryName) {
           country = countryByName!.get(countryName?.toLowerCase());
        }
        hoveredCountry.value = country || null
        
        map!.getCanvas().style.cursor = country ? 'pointer' : 'default'
      }
    })

    map.on('mouseleave', 'countries-fill', () => {
      if (hoveredFeatureId !== null) {
        map!.setFeatureState(
          { source: 'countries', id: hoveredFeatureId },
          { hover: false }
        )
      }
      hoveredFeatureId = null
      hoveredCountry.value = null
      map!.getCanvas().style.cursor = ''
    })

    // Click handler
    map.on('click', 'countries-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const featProps = e.features[0].properties;
        const countryCode = featProps?.ISO_A2;
        const countryName = featProps?.NAME || featProps?.ADMIN;
        
        let country = null;
        if (countryCode) {
           country = props.countries.find((c: any) => c.code === countryCode);
        }
        if (!country && countryName) {
           country = countryByName!.get(countryName?.toLowerCase());
        }
        
        if (country) {
          emit('countryClick', country)
        }
      }
    })

    map.on('load', () => {
      loading.value = false
    })
  } catch (err: any) {
    console.error('Error loading map:', err)
    error.value = true
    errorMessage.value = err.message || 'An unexpected error occurred while loading the map.'
    loading.value = false
  }
}

onMounted(() => {
  initMap()

  // Handle window resize
  const handleResize = () => {
    if (map) {
      map.resize()
    }
  }
  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (map) {
      map.remove()
    }
  })
})

const resetView = () => {
  if (map) {
    map.flyTo({ center: [0, 20], zoom: 1.2, pitch: 0, bearing: 0 })
  }
}

const retryLoad = () => {
  initMap()
}
</script>

