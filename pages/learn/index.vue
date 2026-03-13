<template>
  <div class="max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-100 mb-2">Learn About Countries</h1>
      <p class="text-gray-400">Explore detailed information about countries around the world</p>
    </div>

    <!-- View Toggle -->
    <div class="flex justify-center mb-6">
      <div
        class="inline-flex bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-1 shadow-lg"
      >
        <button
          @click="viewMode = 'list'"
          :class="[
            'px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2',
            viewMode === 'list'
              ? 'bg-primary-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300',
          ]"
        >
          <Icon name="mdi:flag" class="w-5 h-5" />
          <span>Flag List</span>
        </button>
        <button
          @click="viewMode = 'globe'"
          :class="[
            'px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2',
            viewMode === 'globe'
              ? 'bg-primary-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300',
          ]"
        >
          <Icon name="mdi:earth" class="w-5 h-5" />
          <span>Interactive Globe</span>
        </button>
      </div>
    </div>

    <!-- Globe View -->
    <div v-if="viewMode === 'globe'" class="mb-8">
      <div class="h-[700px]">
        <ClientOnly>
          <InteractiveGlobe :countries="allCountries" @country-click="handleCountryClick" />
          <template #fallback>
            <div
              class="flex items-center justify-center h-full bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl"
            >
              <div class="text-center">
                <div
                  class="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                ></div>
                <p class="text-gray-400">Loading globe...</p>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- List View -->
    <div v-else>
      <!-- Search and Filters -->
      <div
        class="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 mb-8 shadow-2xl"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="lg:col-span-2">
            <label for="search" class="block text-sm font-medium text-gray-300 mb-2">
              Search Countries
            </label>
            <div class="relative">
              <Icon
                name="mdi:magnify"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by name..."
                class="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Region Filter -->
          <div>
            <label for="region" class="block text-sm font-medium text-gray-300 mb-2">
              Region
            </label>
            <select
              id="region"
              v-model="selectedRegion"
              class="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="">All Regions</option>
              <option v-for="region in regions" :key="region" :value="region">
                {{ region }}
              </option>
            </select>
          </div>

          <!-- Sort -->
          <div>
            <label for="sort" class="block text-sm font-medium text-gray-300 mb-2"> Sort By </label>
            <select
              id="sort"
              v-model="sortBy"
              class="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="area-desc">Area (Large to Small)</option>
              <option value="area-asc">Area (Small to Large)</option>
            </select>
          </div>
        </div>

        <!-- Results Count -->
        <div class="mt-4 pt-4 border-t border-gray-800/50">
          <p class="text-sm text-gray-400">
            Showing
            <span class="font-semibold text-primary-400">{{ filteredCountries.length }}</span> of
            <span class="font-semibold text-primary-400">{{ allCountries.length }}</span> countries
          </p>
        </div>
      </div>

      <!-- Countries Grid -->
      <div
        v-if="filteredCountries.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <NuxtLink
          v-for="country in filteredCountries"
          :key="country.code"
          :to="`/learn/country/${country.code}`"
          class="group bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-900/20 hover:-translate-y-1"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          :delay="200"
        >
          <!-- Flag Image -->
          <div class="relative h-40 bg-gray-800/50 overflow-hidden">
            <img
              :src="country.flag"
              :alt="`Flag of ${country.name}`"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"
            ></div>
          </div>

          <!-- Country Info -->
          <div class="p-4">
            <h3
              class="text-lg font-bold text-gray-100 mb-1 group-hover:text-primary-400 transition-colors"
            >
              {{ country.name }}
            </h3>
            <p class="text-sm text-gray-400 mb-3">{{ country.region }}</p>

            <div class="space-y-1.5">
              <div v-if="country.capital" class="flex items-center text-xs text-gray-500">
                <Icon name="mdi:city" class="w-4 h-4 mr-2 text-gray-600" />
                <span>{{ country.capital }}</span>
              </div>
              <div class="flex items-center text-xs text-gray-500">
                <Icon name="mdi:map" class="w-4 h-4 mr-2 text-gray-600" />
                <span>{{ formatArea(country.area) }}</span>
              </div>
            </div>
          </div>

          <!-- Hover Indicator -->
          <div
            class="h-1 bg-gradient-to-r from-primary-600 to-secondary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          ></div>
        </NuxtLink>
      </div>

      <!-- No Results -->
      <div
        v-else
        class="text-center py-16 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl"
      >
        <Icon name="mdi:earth-off" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-400 mb-2">No countries found</h3>
        <p class="text-gray-500">Try adjusting your search or filters</p>
      </div>
    </div>

    <!-- Country Modal -->
    <CountryModal :country="selectedCountry" :is-open="showModal" @close="closeModal" />
  </div>
</template>

<script setup lang="ts">
/**
 * Countries overview page with search, filter, and sort functionality
 */
import type { Country } from '~/composables/useCountries'

definePageMeta({
  layout: 'default',
})

const { getAllCountries, getRegions, formatArea } = useCountries()

// View mode
const viewMode = ref<'list' | 'globe'>('list')

// Data
const allCountries = ref<Country[]>([])
const regions = ref<string[]>([])

// Filters
const searchQuery = ref('')
const selectedRegion = ref('')
const sortBy = ref('name-asc')

// Modal
const selectedCountry = ref<Country | null>(null)
const showModal = ref(false)

// Load countries on mount
onMounted(() => {
  allCountries.value = getAllCountries()
  regions.value = getRegions()
})

// Computed filtered and sorted countries
const filteredCountries = computed(() => {
  let countries = [...allCountries.value]

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    countries = countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.officialName.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query)
    )
  }

  // Filter by region
  if (selectedRegion.value) {
    countries = countries.filter((country) => country.region === selectedRegion.value)
  }

  // Sort
  const [sortField, sortOrder] = sortBy.value.split('-')
  countries.sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    if (sortField === 'name') {
      aValue = a.name.toLowerCase()
      bValue = b.name.toLowerCase()
    } else if (sortField === 'area') {
      aValue = a.area
      bValue = b.area
    } else {
      return 0
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return countries
})

// Handle country click from globe
const handleCountryClick = (country: Country) => {
  selectedCountry.value = country
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  selectedCountry.value = null
}
</script>
