<template>
  <div class="card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-950 border-b border-gray-800">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase"
            >
              {{ column.label }}
            </th>
            <th
              v-if="hasActions"
              class="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="(row, index) in paginatedData" :key="index" class="hover:bg-gray-950 transition-colors">
            <td v-for="column in columns" :key="column.key" class="px-6 py-4">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
            <td v-if="hasActions" class="px-6 py-4 text-right">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="data.length === 0" class="p-12 text-center">
      <Icon name="mdi:database-off" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-400">{{ emptyMessage }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && data.length > 0" class="px-6 py-4 border-t border-gray-800">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-400">
          Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ data.length }} entries
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-700 rounded hover:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div class="flex gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              class="px-3 py-1 rounded font-medium transition-colors"
              :class="[
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-700 hover:bg-gray-950'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border border-gray-700 rounded hover:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Admin table component
 * Reusable table with slots for custom cell rendering and pagination
 */
interface Column {
  key: string
  label: string
}

interface Props {
  columns: Column[]
  data: any[]
  emptyMessage?: string
  showPagination?: boolean
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: 'No data available',
  showPagination: false,
  itemsPerPage: 10,
})

const slots = useSlots()
const hasActions = computed(() => !!slots.actions)

// Pagination
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(props.data.length / props.itemsPerPage))

const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + props.itemsPerPage, props.data.length))

const paginatedData = computed(() => {
  if (!props.showPagination) return props.data
  return props.data.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Reset to first page when data changes
watch(() => props.data.length, () => {
  currentPage.value = 1
})
</script>

