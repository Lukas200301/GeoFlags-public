<template>
  <div class="max-w-[1800px] mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold gradient-text mb-2">Database Viewer</h1>
      <p class="text-gray-400">View and explore your database tables</p>
    </div>

    <!-- Tables Grid -->
    <div
      v-if="!selectedTable && !loadingTables"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
    >
      <div
        v-for="table in tables"
        :key="table.name"
        @click="selectTable(table.name)"
        class="group relative glass-card p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 overflow-hidden"
      >
        <!-- Background gradient glow -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <!-- Content -->
        <div class="relative flex items-start gap-4">
          <div
            class="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-purple-500/50 transition-shadow duration-300"
          >
            <Icon :name="table.icon" class="w-9 h-9 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <h3
              class="text-xl font-bold text-gray-100 mb-2 group-hover:text-purple-300 transition-colors"
            >
              {{ table.label }}
            </h3>
            <div class="flex items-center gap-2 mb-2">
              <div class="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                <span class="text-sm font-semibold text-purple-300">{{ table.count }} rows</span>
              </div>
            </div>
            <div class="text-xs text-gray-500 font-mono">{{ table.name }}</div>
          </div>
          <Icon
            name="mdi:chevron-right"
            class="w-6 h-6 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0"
          />
        </div>

        <!-- Border glow on hover -->
        <div
          class="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/30 transition-colors duration-300 pointer-events-none"
        ></div>
      </div>
    </div>

    <!-- Loading Tables -->
    <div v-if="loadingTables" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div v-for="i in 6" :key="i" class="glass-card p-6">
        <div class="flex items-start gap-4 animate-pulse">
          <div class="w-16 h-16 rounded-xl bg-gray-700/50"></div>
          <div class="flex-1 space-y-3">
            <div class="h-6 bg-gray-700/50 rounded w-3/4"></div>
            <div class="h-5 bg-gray-700/50 rounded w-1/2"></div>
            <div class="h-4 bg-gray-700/50 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Data View -->
    <div v-if="selectedTable" class="glass-card overflow-hidden">
      <!-- Table Header -->
      <div
        class="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-b border-gray-700/50"
      >
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <button
              @click="selectedTable = null"
              class="p-3 hover:bg-gray-700/50 rounded-xl transition-all hover:scale-105 group"
            >
              <Icon
                name="mdi:arrow-left"
                class="w-6 h-6 text-gray-300 group-hover:text-purple-400 transition-colors"
              />
            </button>
            <div>
              <h2 class="text-3xl font-bold text-gray-100 mb-1">
                {{ tables.find((t) => t.name === selectedTable)?.label }}
              </h2>
              <div class="flex items-center gap-3">
                <p class="text-sm text-gray-400 font-mono">{{ selectedTable }}</p>
                <div class="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30">
                  <span class="text-xs font-semibold text-purple-300"
                    >{{ totalRows }} total rows</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Page Size Selector -->
            <select
              v-model="pageSize"
              @change="
                currentPage = 1;
                fetchTableData()
              "
              class="px-3 py-2 bg-gray-800/70 border border-gray-600/50 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-purple-500 transition-all"
            >
              <option :value="10">10 rows</option>
              <option :value="20">20 rows</option>
              <option :value="50">50 rows</option>
              <option :value="100">100 rows</option>
            </select>
            <button
              @click="fetchTableData"
              :disabled="loadingData"
              class="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
            >
              <Icon
                name="mdi:refresh"
                class="w-6 h-6 text-purple-400"
                :class="{ 'animate-spin': loadingData }"
              />
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="relative">
          <Icon
            name="mdi:magnify"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Search in table..."
            class="w-full pl-12 pr-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
      </div>

      <!-- Table Content -->
      <div class="relative">
        <div class="overflow-x-auto custom-scrollbar relative">
          <table class="border-collapse">
            <thead class="bg-gray-800/70 backdrop-blur-sm sticky top-0">
              <tr>
                <th
                  v-for="column in displayColumns"
                  :key="column"
                  class="px-3 py-3 text-left text-xs font-bold text-purple-300 uppercase tracking-wider border-b border-gray-700/50"
                  style="min-width: 150px; max-width: 200px"
                >
                  <div class="truncate">
                    {{ formatColumnName(column) }}
                  </div>
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-bold text-purple-300 uppercase tracking-wider border-b border-gray-700/50"
                  style="min-width: 80px"
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700/30">
              <tr
                v-for="(row, index) in tableData"
                :key="index"
                class="hover:bg-gradient-to-r hover:from-purple-900/10 hover:to-transparent transition-all duration-200 cursor-pointer"
                @click="openDetailModal(row)"
              >
                <td
                  v-for="column in displayColumns"
                  :key="column"
                  class="px-3 py-3 text-sm"
                  style="min-width: 150px; max-width: 200px"
                >
                  <div class="truncate" :title="String(formatValue(row[column]))">
                    <span :class="getCellClass(column, row[column])">
                      {{ formatValue(row[column]) }}
                    </span>
                  </div>
                </td>
                <td class="px-3 py-3 text-sm">
                  <button
                    class="p-1.5 hover:bg-purple-500/20 rounded-lg transition-all"
                    @click.stop="openDetailModal(row)"
                  >
                    <Icon name="mdi:eye" class="w-4 h-4 text-purple-400" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Loading State -->
        <div v-if="loadingData" class="p-16 text-center">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4"
          >
            <Icon name="mdi:loading" class="w-10 h-10 text-purple-500 animate-spin" />
          </div>
          <p class="text-gray-400 text-lg">Loading data...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="tableData.length === 0" class="p-16 text-center">
          <div
            class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-4"
          >
            <Icon name="mdi:database-off-outline" class="w-12 h-12 text-gray-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-300 mb-2">No data found</h3>
          <p class="text-gray-500">
            {{ searchQuery ? 'Try a different search term' : 'This table is empty' }}
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalRows > 0"
        class="p-6 bg-gradient-to-r from-gray-900/20 to-transparent border-t border-gray-700/50"
      >
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-400">
            Showing
            <span class="font-semibold text-purple-300">{{
              (currentPage - 1) * pageSize + 1
            }}</span>
            to
            <span class="font-semibold text-purple-300">{{
              Math.min(currentPage * pageSize, totalRows)
            }}</span>
            of <span class="font-semibold text-purple-300">{{ totalRows }}</span> rows
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="changePage(1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105"
              title="First page"
            >
              <Icon name="mdi:chevron-double-left" class="w-5 h-5" />
            </button>
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 flex items-center gap-2"
            >
              <Icon name="mdi:chevron-left" class="w-5 h-5" />
              <span class="hidden sm:inline">Previous</span>
            </button>
            <div class="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <span class="text-purple-300 font-semibold">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
            </div>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 flex items-center gap-2"
            >
              <span class="hidden sm:inline">Next</span>
              <Icon name="mdi:chevron-right" class="w-5 h-5" />
            </button>
            <button
              @click="changePage(totalPages)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105"
              title="Last page"
            >
              <Icon name="mdi:chevron-double-right" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="glass-card p-6 border-l-4 border-red-500 mb-6 animate-slideDown">
      <div class="flex items-start gap-4">
        <div
          class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0"
        >
          <Icon name="mdi:alert-circle" class="w-6 h-6 text-red-500" />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-red-400 mb-1">Error</h3>
          <p class="text-gray-300">{{ error }}</p>
          <button
            @click="error = null"
            class="mt-3 text-sm text-red-400 hover:text-red-300 underline transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="detailModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click="closeDetailModal"
        >
          <div
            @click.stop
            class="glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-modalIn"
          >
            <!-- Modal Header -->
            <div
              class="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-b border-gray-700/50 flex items-center justify-between"
            >
              <div>
                <h3 class="text-2xl font-bold text-gray-100">Entry Details</h3>
                <p class="text-sm text-gray-400 mt-1">Full view of selected database entry</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="copyEntryData"
                  class="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 transition-all flex items-center gap-2"
                  title="Copy as JSON"
                >
                  <Icon name="mdi:content-copy" class="w-5 h-5" />
                  <span class="hidden sm:inline">Copy JSON</span>
                </button>
                <button
                  @click="closeDetailModal"
                  class="p-2 hover:bg-gray-700/50 rounded-lg transition-all"
                >
                  <Icon name="mdi:close" class="w-6 h-6 text-gray-400 hover:text-gray-200" />
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="column in tableColumns"
                  :key="column"
                  class="glass-card p-4 hover:border-purple-500/30 transition-colors"
                >
                  <div class="flex items-start gap-3">
                    <Icon
                      :name="getColumnIcon(column)"
                      class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"
                    />
                    <div class="flex-1 min-w-0">
                      <div
                        class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                      >
                        {{ formatColumnName(column) }}
                      </div>
                      <div
                        class="text-sm break-words"
                        :class="getCellClass(column, selectedEntry?.[column])"
                      >
                        {{ formatValue(selectedEntry?.[column]) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Success Toast -->
    <Transition name="toast">
      <div v-if="showSuccessToast" class="fixed bottom-8 right-8 z-50">
        <div class="glass-card p-4 border-l-4 border-green-500 shadow-2xl animate-slideUp">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Icon name="mdi:check" class="w-5 h-5 text-green-400" />
            </div>
            <p class="text-gray-100 font-medium">Copied to clipboard!</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/**
 * Admin Database Viewer
 * Displays database tables and their data with detail modal
 */

definePageMeta({
  middleware: 'admin',
  layout: 'default',
})

const { apiRequest } = useApi()

// State
const tables = ref<Array<{ name: string; label: string; icon: string; count: number }>>([])
const loadingTables = ref(false)
const selectedTable = ref<string | null>(null)
const tableData = ref<any[]>([])
const tableColumns = ref<string[]>([])
const displayColumns = ref<string[]>([])
const loadingData = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalRows = ref(0)
const detailModalOpen = ref(false)
const selectedEntry = ref<any>(null)
const showSuccessToast = ref(false)

// Computed
const totalPages = computed(() => Math.ceil(totalRows.value / pageSize.value))

/**
 * Fetch all database tables
 */
const fetchTables = async () => {
  try {
    loadingTables.value = true
    error.value = null

    const response = await apiRequest<{ tables: any[] }>('/api/admin/database/tables', {
      requiresAuth: true,
    })

    tables.value = response.tables
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to fetch database tables'
    console.error('Fetch tables error:', err)
  } finally {
    loadingTables.value = false
  }
}

/**
 * Select a table to view
 */
const selectTable = (tableName: string) => {
  selectedTable.value = tableName
  currentPage.value = 1
  searchQuery.value = ''
  fetchTableData()
}

/**
 * Fetch table data
 */
const fetchTableData = async () => {
  if (!selectedTable.value) return

  try {
    loadingData.value = true
    error.value = null

    const params = new URLSearchParams({
      table: selectedTable.value,
      page: currentPage.value.toString(),
      limit: pageSize.value.toString(),
    })

    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }

    const response = await apiRequest<{ data: any[]; total: number }>(
      `/api/admin/database?${params.toString()}`,
      { requiresAuth: true }
    )

    tableData.value = response.data
    totalRows.value = response.total

    // Extract columns from first row
    if (response.data.length > 0) {
      tableColumns.value = Object.keys(response.data[0])
      // Limit display columns to first 5 important columns
      displayColumns.value = getDisplayColumns(tableColumns.value)
    } else {
      tableColumns.value = []
      displayColumns.value = []
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to fetch table data'
    console.error('Fetch table data error:', err)
  } finally {
    loadingData.value = false
  }
}

/**
 * Change page
 */
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchTableData()
}

/**
 * Debounced search
 */
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchTableData()
  }, 500)
}

/**
 * Open detail modal
 */
const openDetailModal = (entry: any) => {
  selectedEntry.value = entry
  detailModalOpen.value = true
  // Prevent body scroll
  document.body.style.overflow = 'hidden'
}

/**
 * Close detail modal
 */
const closeDetailModal = () => {
  detailModalOpen.value = false
  selectedEntry.value = null
  // Restore body scroll
  document.body.style.overflow = ''
}

/**
 * Copy entry data to clipboard
 */
const copyEntryData = async () => {
  if (!selectedEntry.value) return

  try {
    await navigator.clipboard.writeText(JSON.stringify(selectedEntry.value, null, 2))
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

/**
 * Get display columns (limit to most important ones)
 */
const getDisplayColumns = (columns: string[]): string[] => {
  const maxColumns = 5

  // Priority order for column types
  const priorityColumns: string[] = []
  const regularColumns: string[] = []

  columns.forEach((col) => {
    const lowerCol = col.toLowerCase()
    // Prioritize important columns
    if (
      lowerCol.includes('id') ||
      lowerCol.includes('name') ||
      lowerCol.includes('email') ||
      lowerCol.includes('title') ||
      lowerCol.includes('status') ||
      lowerCol.includes('created')
    ) {
      priorityColumns.push(col)
    } else {
      regularColumns.push(col)
    }
  })

  // Return priority columns first, then regular ones, up to maxColumns
  return [...priorityColumns, ...regularColumns].slice(0, maxColumns)
}

/**
 * Get icon for column type
 */
const getColumnIcon = (column: string): string => {
  const lowerCol = column.toLowerCase()

  if (lowerCol.includes('id')) return 'mdi:key'
  if (lowerCol.includes('email')) return 'mdi:email'
  if (lowerCol.includes('name')) return 'mdi:account'
  if (
    lowerCol.includes('date') ||
    lowerCol.includes('time') ||
    lowerCol.includes('created') ||
    lowerCol.includes('updated')
  )
    return 'mdi:calendar-clock'
  if (lowerCol.includes('status')) return 'mdi:check-circle'
  if (lowerCol.includes('role')) return 'mdi:shield-account'
  if (lowerCol.includes('count') || lowerCol.includes('number') || lowerCol.includes('amount'))
    return 'mdi:numeric'
  if (lowerCol.includes('url') || lowerCol.includes('link')) return 'mdi:link'
  if (lowerCol.includes('image') || lowerCol.includes('avatar') || lowerCol.includes('photo'))
    return 'mdi:image'
  if (lowerCol.includes('description') || lowerCol.includes('content')) return 'mdi:text'
  if (lowerCol.includes('flag') || lowerCol.includes('is')) return 'mdi:flag'
  if (lowerCol.includes('code')) return 'mdi:code-tags'

  return 'mdi:database'
}

/**
 * Format column names
 */
const formatColumnName = (column: string): string => {
  return column
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

/**
 * Get cell class based on value type
 */
const getCellClass = (column: string, value: any): string => {
  if (value === null || value === undefined) {
    return 'text-gray-500 italic'
  }
  if (typeof value === 'boolean') {
    return value ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'
  }
  if (column.toLowerCase().includes('email')) {
    return 'text-blue-400'
  }
  if (column.toLowerCase().includes('status')) {
    return 'text-purple-400 font-semibold'
  }
  if (column.toLowerCase().includes('role')) {
    return 'text-orange-400 font-semibold'
  }
  if (typeof value === 'number') {
    return 'text-cyan-400 font-mono'
  }
  return 'text-gray-300'
}

/**
 * Format cell values
 */
const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (typeof value === 'boolean') {
    return value ? '✓ True' : '✗ False'
  }
  if (
    value instanceof Date ||
    (typeof value === 'string' && !isNaN(Date.parse(value)) && value.includes('T'))
  ) {
    try {
      const date = new Date(value)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return String(value)
    }
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

// Fetch tables on mount
onMounted(() => {
  fetchTables()
})

// Close modal on Escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && detailModalOpen.value) {
      closeDetailModal()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
  })
})
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}

.animate-modalIn {
  animation: modalIn 0.3s ease-out;
}

/* Custom scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #9333ea60 #1f293740;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f293740;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #9333ea60;
  border-radius: 4px;
  transition: background 0.3s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9333ea;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
