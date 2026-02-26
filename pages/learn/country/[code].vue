<template>
  <div class="max-w-6xl mx-auto">
    <!-- Back Button -->
    <NuxtLink
      to="/learn"
      class="inline-flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors mb-6 group"
      v-motion
      :initial="{ opacity: 0, x: -20 }"
      :visible="{ opacity: 1, x: 0 }"
    >
      <Icon name="mdi:arrow-left" class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span>Back to Overview</span>
    </NuxtLink>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-20"
    >
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-400">Loading country data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-900/20 border border-red-800/50 rounded-2xl p-8 text-center"
      v-motion
      :initial="{ opacity: 0, scale: 0.9 }"
      :visible="{ opacity: 1, scale: 1 }"
    >
      <Icon name="mdi:alert-circle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-red-400 mb-2">Country Not Found</h2>
      <p class="text-gray-400 mb-6">The country with code "{{ route.params.code }}" could not be found.</p>
      <NuxtLink
        to="/learn"
        class="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-all duration-300 shadow-lg"
      >
        <Icon name="mdi:arrow-left" class="w-5 h-5" />
        <span>Back to Overview</span>
      </NuxtLink>
    </div>

    <!-- Country Details -->
    <div v-else-if="country" class="space-y-10">
      <!-- SECTION 1: Header & Identity Block (Prominent Banner) -->
      <div
        class="relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-900/80 backdrop-blur-2xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible="{ opacity: 1, y: 0 }"
        :delay="100"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-transparent to-secondary-600/5"></div>

        <div class="relative grid grid-cols-1 lg:grid-cols-[3fr,2fr] gap-0">
          <!-- Flag Visual -->
          <div class="relative h-80 lg:h-[32rem] bg-gray-800/30 flex items-center justify-center p-6 lg:p-12 overflow-hidden">
            <img
              :src="country.flag"
              :alt="`Flag of ${country.name}`"
              class="w-full h-full object-contain drop-shadow-2xl"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent pointer-events-none"></div>
          </div>

          <!-- Identity Info -->
          <div class="p-10 lg:p-12 flex flex-col justify-center space-y-6">
            <div>
              <p class="text-sm font-bold text-primary-400 uppercase tracking-widest mb-3">{{ country.region }}</p>
              <h1 class="text-5xl lg:text-6xl font-black text-white leading-[1.25] mb-4" style="text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                {{ country.name }}
              </h1>
              <p class="text-xl text-gray-300 font-medium leading-relaxed">{{ country.officialName }}</p>
            </div>

            <!-- Capital City -->
            <div v-if="country.capital" class="flex items-center space-x-4 p-4 bg-gray-800/40 rounded-xl border border-gray-700/40">
              <div class="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Icon name="mdi:city" class="w-7 h-7 text-primary-400" />
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Capital City</p>
                <p class="text-lg font-bold text-gray-100">{{ country.capital }}</p>
              </div>
            </div>

            <!-- ISO Codes -->
            <div class="flex flex-wrap gap-2.5">
              <span class="px-4 py-2 bg-primary-500/15 border border-primary-600/40 rounded-xl text-sm text-primary-300 font-bold uppercase tracking-wide">
                {{ country.code }}
              </span>
              <span class="px-4 py-2 bg-primary-500/15 border border-primary-600/40 rounded-xl text-sm text-primary-300 font-bold uppercase tracking-wide">
                {{ country.cca3 }}
              </span>
              <span v-if="country.cioc" class="px-4 py-2 bg-secondary-500/15 border border-secondary-600/40 rounded-xl text-sm text-secondary-300 font-bold uppercase tracking-wide">
                {{ country.cioc }}
              </span>
              <span v-if="country.idd && country.idd.root" class="px-4 py-2 bg-blue-500/15 border border-blue-600/40 rounded-xl text-sm text-blue-300 font-mono font-bold">
                {{ country.idd.root }}{{ country.idd.suffixes && country.idd.suffixes[0] ? country.idd.suffixes[0] : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: Key Statistics Strip (Horizontal Emphasis) -->
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-6"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible="{ opacity: 1, y: 0 }"
        :delay="200"
      >
        <!-- Area -->
        <div class="group relative bg-gradient-to-br from-blue-900/50 to-blue-950/70 backdrop-blur-xl border-2 border-blue-700/50 rounded-2xl p-8 hover:border-blue-500/70 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
          <div class="flex items-center justify-center mb-6">
            <div class="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <Icon name="mdi:map" class="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <p class="text-center text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">Total Area</p>
          <p class="text-center text-5xl font-black bg-gradient-to-br from-white via-blue-50 to-blue-100 bg-clip-text text-transparent">{{ formatArea(country.area) }}</p>
        </div>

        <!-- Population -->
        <div v-if="restCountryData?.population" class="group relative bg-gradient-to-br from-emerald-900/50 to-emerald-950/70 backdrop-blur-xl border-2 border-emerald-700/50 rounded-2xl p-8 hover:border-emerald-500/70 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300">
          <div class="flex items-center justify-center mb-6">
            <div class="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
              <Icon name="mdi:account-group" class="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <p class="text-center text-xs font-bold text-emerald-300 uppercase tracking-widest mb-3">Population</p>
          <p class="text-center text-5xl font-black bg-gradient-to-br from-white via-emerald-50 to-emerald-100 bg-clip-text text-transparent">{{ formatPopulation(restCountryData.population) }}</p>
        </div>

        <!-- Region/Continent -->
        <div class="group relative bg-gradient-to-br from-purple-900/50 to-purple-950/70 backdrop-blur-xl border-2 border-purple-700/50 rounded-2xl p-8 hover:border-purple-500/70 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
          <div class="flex items-center justify-center mb-6">
            <div class="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
              <Icon name="mdi:earth" class="w-10 h-10 text-purple-400" />
            </div>
          </div>
          <p class="text-center text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">Region</p>
          <p class="text-center text-4xl font-black bg-gradient-to-br from-white via-purple-50 to-purple-100 bg-clip-text text-transparent leading-tight">{{ country.region }}</p>
          <p v-if="country.subregion" class="text-center text-sm text-purple-300/80 mt-2 font-semibold">{{ country.subregion }}</p>
        </div>
      </div>

      <!-- SECTION 3: Status & Identity Grid (Binary & Text Facts) -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible="{ opacity: 1, y: 0 }"
        :delay="300"
      >
        <!-- Demonym -->
        <div v-if="country.demonym" class="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/60 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-3">
            <Icon name="mdi:account" class="w-6 h-6 text-gray-400" />
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Demonym</p>
          </div>
          <p class="text-2xl font-bold text-gray-100">{{ country.demonym }}</p>
        </div>

        <!-- UN Membership -->
        <div class="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/60 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-3">
            <Icon name="mdi:earth" class="w-6 h-6 text-gray-400" />
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">UN Member</p>
          </div>
          <div class="flex items-center space-x-2">
            <Icon v-if="country.unMember" name="mdi:check-circle" class="w-7 h-7 text-green-400" />
            <Icon v-else name="mdi:close-circle" class="w-7 h-7 text-red-400" />
            <p class="text-2xl font-bold text-gray-100">{{ country.unMember ? 'Yes' : 'No' }}</p>
          </div>
          <p v-if="country.unRegionalGroup" class="text-xs text-gray-400 mt-2">{{ country.unRegionalGroup }}</p>
        </div>

        <!-- Independence Status -->
        <div class="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/60 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-3">
            <Icon name="mdi:flag" class="w-6 h-6 text-gray-400" />
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Independent</p>
          </div>
          <div class="flex items-center space-x-2">
            <Icon v-if="country.independent" name="mdi:check-circle" class="w-7 h-7 text-green-400" />
            <Icon v-else name="mdi:close-circle" class="w-7 h-7 text-gray-400" />
            <p class="text-2xl font-bold text-gray-100">{{ country.independent ? 'Yes' : 'No' }}</p>
          </div>
        </div>

        <!-- Landlocked Status -->
        <div class="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/60 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-3">
            <Icon name="mdi:water-off" class="w-6 h-6 text-gray-400" />
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Landlocked</p>
          </div>
          <div class="flex items-center space-x-2">
            <Icon v-if="country.landlocked" name="mdi:check-circle" class="w-7 h-7 text-yellow-400" />
            <Icon v-else name="mdi:close-circle" class="w-7 h-7 text-blue-400" />
            <p class="text-2xl font-bold text-gray-100">{{ country.landlocked ? 'Yes' : 'No' }}</p>
          </div>
        </div>

        <!-- Driving Side -->
        <div v-if="restCountryData?.carSide" class="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/60 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-3">
            <Icon name="mdi:car" class="w-6 h-6 text-gray-400" />
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Driving Side</p>
          </div>
          <p class="text-2xl font-bold text-gray-100 capitalize">{{ formatCarSide(restCountryData.carSide) }}</p>
        </div>

        <!-- Alternative Names -->
        <div v-if="country.altSpellings && country.altSpellings.length > 1" class="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/60 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-3">
            <Icon name="mdi:alphabetical-variant" class="w-6 h-6 text-gray-400" />
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Also Known As</p>
          </div>
          <p class="text-sm text-gray-300 font-medium">{{ country.altSpellings.slice(0, 3).join(', ') }}</p>
        </div>
      </div>

      <!-- SECTION 4: Technical Details Block (Paired Columns) -->
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible="{ opacity: 1, y: 0 }"
        :delay="400"
      >
        <!-- Coordinates -->
        <div v-if="country.latlng" class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-7 hover:border-gray-600/50 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-5">
            <Icon name="mdi:crosshairs-gps" class="w-7 h-7 text-gray-400" />
            <h2 class="text-lg font-bold text-gray-200">Coordinates</h2>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Latitude</p>
              <p class="text-2xl font-mono font-bold text-gray-100">{{ country.latlng[0] }}°</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Longitude</p>
              <p class="text-2xl font-mono font-bold text-gray-100">{{ country.latlng[1] }}°</p>
            </div>
          </div>
        </div>

        <!-- Timezones -->
        <div v-if="country.timezones && country.timezones.length > 0" class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-7 hover:border-gray-600/50 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-5">
            <Icon name="mdi:clock-outline" class="w-7 h-7 text-gray-400" />
            <h2 class="text-lg font-bold text-gray-200">Timezones</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(timezone, index) in country.timezones"
              :key="index"
              class="px-3 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-xs text-gray-300 font-mono"
            >
              {{ timezone }}
            </span>
          </div>
        </div>

        <!-- Languages -->
        <div v-if="country.languages" class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-7 hover:border-gray-600/50 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-5">
            <Icon name="mdi:translate" class="w-7 h-7 text-gray-400" />
            <h2 class="text-lg font-bold text-gray-200">Languages</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(lang, code) in country.languages"
              :key="code"
              class="px-3 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-sm text-gray-300 font-medium"
            >
              {{ lang }}
            </span>
          </div>
        </div>

        <!-- Currencies -->
        <div v-if="country.currencies" class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-7 hover:border-gray-600/50 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-5">
            <Icon name="mdi:cash" class="w-7 h-7 text-gray-400" />
            <h2 class="text-lg font-bold text-gray-200">Currencies</h2>
          </div>
          <div class="space-y-2">
            <div
              v-for="(currency, code) in country.currencies"
              :key="code"
              class="flex items-center justify-between"
            >
              <span class="text-gray-300 font-medium">{{ currency.name }}</span>
              <span class="text-gray-100 font-mono font-bold text-lg">{{ currency.symbol }}</span>
            </div>
          </div>
        </div>

        <!-- Domain Extensions -->
        <div v-if="country.tld && country.tld.length > 0" class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-7 hover:border-gray-600/50 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-5">
            <Icon name="mdi:web" class="w-7 h-7 text-gray-400" />
            <h2 class="text-lg font-bold text-gray-200">Domain Extensions</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(domain, index) in country.tld"
              :key="index"
              class="px-3 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-sm text-gray-300 font-mono font-bold"
            >
              {{ domain }}
            </span>
          </div>
        </div>
      </div>

      <!-- SECTION 5: Context & Visual Footer -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible="{ opacity: 1, y: 0 }"
        :delay="500"
      >
        <!-- Coat of Arms -->
        <div v-if="restCountryData?.coatOfArms" class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8 hover:border-gray-600/50 transition-all duration-300">
          <div class="flex items-center space-x-3 mb-6">
            <Icon name="mdi:shield" class="w-7 h-7 text-gray-400" />
            <h2 class="text-lg font-bold text-gray-200">National Emblem</h2>
          </div>
          <div class="flex items-center justify-center p-6 bg-gray-700/20 rounded-xl">
            <img
              :src="restCountryData.coatOfArms"
              :alt="`Coat of Arms of ${country.name}`"
              class="max-h-56 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        <!-- Neighboring Countries (Map-style Grid) -->
        <div
          v-if="country.neighbors && country.neighbors.length > 0"
          :class="[
            'bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8 hover:border-gray-600/50 transition-all duration-300',
            restCountryData?.coatOfArms ? 'lg:col-span-2' : 'lg:col-span-3'
          ]"
        >
          <div class="flex items-center space-x-3 mb-6">
            <Icon name="mdi:map-marker-multiple" class="w-7 h-7 text-primary-400" />
            <h2 class="text-lg font-bold text-gray-200">Bordering Countries</h2>
            <span class="ml-auto text-sm text-gray-500 font-semibold">{{ country.neighbors.length }}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <NuxtLink
              v-for="neighborCode in country.neighbors"
              :key="neighborCode"
              :to="`/learn/country/${neighborCode}`"
              class="group relative overflow-hidden rounded-xl border-2 border-gray-700/60 hover:border-primary-500/80 transition-all duration-300 aspect-[4/3] hover:scale-105"
            >
              <!-- Flag Background -->
              <div class="absolute inset-0">
                <img
                  :src="getNeighborFlag(neighborCode)"
                  :alt="`Flag of ${getCountryName(neighborCode)}`"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-transparent"></div>
              </div>

              <!-- Country Name -->
              <div class="relative h-full flex flex-col justify-end p-3.5">
                <p class="text-sm font-bold text-white group-hover:text-primary-400 transition-colors drop-shadow-lg leading-tight">
                  {{ getCountryName(neighborCode) }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Country detail page showing comprehensive information about a specific country
 */
import type { Country } from '~/composables/useCountries'
import type { RestCountryData } from '~/composables/useRestCountries'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const { getCountryByCode, formatArea, getCountryName } = useCountries()
const { fetchCountryData, formatPopulation, formatCarSide } = useRestCountries()
const config = useRuntimeConfig()

// State
const country = ref<Country | null>(null)
const restCountryData = ref<RestCountryData | null>(null)
const loading = ref(true)
const error = ref(false)

// Helper to get neighbor flag URL
// Note: neighbor codes are now CCA2 format (already converted in useCountries)
const getNeighborFlag = (cca2Code: string): string => {
  const apiBase = config.public.apiBase
  return `${apiBase}/api/flags/${cca2Code.toLowerCase()}`
}

// Load country data
onMounted(async () => {
  const code = route.params.code as string
  const countryData = getCountryByCode(code)

  if (countryData) {
    country.value = countryData
    error.value = false

    // Fetch additional REST Countries data
    const extraData = await fetchCountryData(code)
    if (extraData) {
      restCountryData.value = extraData
      // Update timezones from REST Countries data
      if (country.value) {
        country.value.timezones = extraData.timezones
      }
    }
  } else {
    error.value = true
  }

  loading.value = false
})

// Watch for route changes (when clicking on neighboring countries)
watch(
  () => route.params.code,
  async (newCode) => {
    if (newCode) {
      loading.value = true
      const countryData = getCountryByCode(newCode as string)

      if (countryData) {
        country.value = countryData
        error.value = false

        // Fetch additional REST Countries data
        const extraData = await fetchCountryData(newCode as string)
        if (extraData) {
          restCountryData.value = extraData
          // Update timezones from REST Countries data
          if (country.value) {
            country.value.timezones = extraData.timezones
          }
        }
      } else {
        error.value = true
      }

      loading.value = false
      // Scroll to top when changing countries
      if (process.client) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }
)

// Set page title
useHead({
  title: computed(() => (country.value ? `${country.value.name} - Learn` : 'Country Not Found')),
})
</script>
