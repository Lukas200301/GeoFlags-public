<template>
  <Teleport to="body">
    <div
      v-if="isOpen && country"
      class="fixed inset-0 z-50 flex items-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-500"
      :class="sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'"
      @click.self="close"
    >
      <div
        class="bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl mx-auto"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :visible="{ opacity: 1, scale: 1 }"
      >
        <!-- Header with Close Button -->
        <div
          class="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4 flex items-center justify-between"
        >
          <h2 class="text-2xl font-bold text-gray-100">{{ country.name }}</h2>
          <button @click="close" class="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Icon name="mdi:close" class="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto max-h-[calc(90vh-80px)]">
          <!-- Flag and Header Info -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <!-- Flag Image -->
            <div class="relative h-64 bg-gray-800/50 overflow-hidden">
              <img
                :src="country.flag"
                :alt="`Flag of ${country.name}`"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-40"
              ></div>
            </div>

            <!-- Header Info -->
            <div class="p-6 flex flex-col justify-center bg-gray-800/30">
              <div class="mb-4">
                <p class="text-sm text-gray-500 uppercase tracking-wider mb-2">
                  {{ country.region }}
                </p>
                <p class="text-lg text-gray-400">{{ country.officialName }}</p>
              </div>

              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="px-3 py-1 bg-primary-900/30 border border-primary-800/50 rounded-full text-sm text-primary-400 font-medium"
                >
                  {{ country.code }}
                </span>
                <span
                  class="px-3 py-1 bg-primary-900/30 border border-primary-800/50 rounded-full text-sm text-primary-400 font-medium"
                >
                  {{ country.cca3 }}
                </span>
                <span
                  v-if="country.cioc"
                  class="px-3 py-1 bg-secondary-900/30 border border-secondary-800/50 rounded-full text-sm text-secondary-400 font-medium"
                >
                  {{ country.cioc }}
                </span>
              </div>

              <div v-if="country.capital" class="flex items-center space-x-3 text-gray-300">
                <Icon name="mdi:city" class="w-6 h-6 text-primary-400" />
                <div>
                  <p class="text-xs text-gray-500">Capital</p>
                  <p class="font-semibold">{{ country.capital }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Key Statistics -->
          <div class="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-800/50">
            <!-- Area -->
            <div class="bg-gray-800/30 rounded-xl p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Icon name="mdi:map" class="w-5 h-5 text-secondary-400" />
                <p class="text-xs text-gray-500">Area</p>
              </div>
              <p class="text-xl font-bold text-gray-100">{{ formatArea(country.area) }}</p>
            </div>

            <!-- Region -->
            <div class="bg-gray-800/30 rounded-xl p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Icon name="mdi:earth" class="w-5 h-5 text-primary-400" />
                <p class="text-xs text-gray-500">Region</p>
              </div>
              <p class="text-lg font-bold text-gray-100">{{ country.region }}</p>
              <p v-if="country.subregion" class="text-xs text-gray-500 mt-1">
                {{ country.subregion }}
              </p>
            </div>

            <!-- Demonym -->
            <div v-if="country.demonym" class="bg-gray-800/30 rounded-xl p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Icon name="mdi:account" class="w-5 h-5 text-secondary-400" />
                <p class="text-xs text-gray-500">Demonym</p>
              </div>
              <p class="text-lg font-bold text-gray-100">{{ country.demonym }}</p>
            </div>
          </div>

          <!-- Detailed Information Grid -->
          <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Languages -->
            <div v-if="country.languages" class="bg-gray-800/30 rounded-xl p-4">
              <div class="flex items-center space-x-2 mb-3">
                <Icon name="mdi:translate" class="w-5 h-5 text-primary-400" />
                <h3 class="text-sm font-bold text-gray-100">Languages</h3>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(lang, code) in country.languages"
                  :key="code"
                  class="px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-xs text-gray-300"
                >
                  {{ lang }}
                </span>
              </div>
            </div>

            <!-- Currencies -->
            <div v-if="country.currencies" class="bg-gray-800/30 rounded-xl p-4">
              <div class="flex items-center space-x-2 mb-3">
                <Icon name="mdi:cash" class="w-5 h-5 text-secondary-400" />
                <h3 class="text-sm font-bold text-gray-100">Currencies</h3>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(currency, code) in country.currencies"
                  :key="code"
                  class="flex items-center justify-between p-2 bg-gray-700/50 border border-gray-600 rounded text-xs"
                >
                  <span class="text-gray-300">{{ currency.name }}</span>
                  <span class="text-gray-400 font-mono">{{ currency.symbol }}</span>
                </div>
              </div>
            </div>

            <!-- Coordinates -->
            <div v-if="country.latlng" class="bg-gray-800/30 rounded-xl p-4">
              <div class="flex items-center space-x-2 mb-3">
                <Icon name="mdi:crosshairs-gps" class="w-5 h-5 text-primary-400" />
                <h3 class="text-sm font-bold text-gray-100">Coordinates</h3>
              </div>
              <div class="space-y-1 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-gray-500">Latitude</span>
                  <span class="text-gray-300 font-mono">{{ country.latlng[0] }}°</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-500">Longitude</span>
                  <span class="text-gray-300 font-mono">{{ country.latlng[1] }}°</span>
                </div>
              </div>
            </div>

            <!-- Timezones -->
            <div
              v-if="country.timezones && country.timezones.length > 0"
              class="bg-gray-800/30 rounded-xl p-4"
            >
              <div class="flex items-center space-x-2 mb-3">
                <Icon name="mdi:clock-outline" class="w-5 h-5 text-secondary-400" />
                <h3 class="text-sm font-bold text-gray-100">Timezones</h3>
              </div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(timezone, index) in country.timezones"
                  :key="index"
                  class="px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-xs text-gray-300 font-mono"
                >
                  {{ timezone }}
                </span>
              </div>
            </div>
          </div>

          <!-- View Full Details Link -->
          <div class="px-6 pb-6">
            <NuxtLink
              :to="`/learn/country/${country.code}`"
              class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-all duration-300 shadow-lg"
              @click="close"
            >
              <Icon name="mdi:information" class="w-5 h-5" />
              <span>View Full Details</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Country } from '~/composables/useCountries'

const { sidebarCollapsed } = useSidebar()

const props = defineProps<{
  country: Country | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { formatArea } = useCountries()

const close = () => {
  emit('close')
}

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      close()
    }
  }
  window.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})

// Prevent body scroll when modal is open
watch(
  () => props.isOpen,
  (isOpen) => {
    if (process.client) {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
)
</script>
