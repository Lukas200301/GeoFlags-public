<script setup lang="ts">
/**
 * Admin Database Viewer
 *
 * A Prisma Studio-like interface for viewing and managing database tables
 */

definePageMeta({
  middleware: 'admin',
  layout: 'default',
})

const { apiRequest } = useApi()
const toast = useToast()

// Available tables
const tables = [
  { name: 'users', label: 'Users', icon: 'mdi:account-group', color: 'blue' },
  { name: 'game_sessions', label: 'Game Sessions', icon: 'mdi:gamepad-variant', color: 'purple' },
  { name: 'leaderboard_entries', label: 'Leaderboard', icon: 'mdi:trophy', color: 'yellow' },
  { name: 'game_modes', label: 'Game Modes', icon: 'mdi:flag', color: 'green' },
  { name: 'admin_audits', label: 'Admin Audits', icon: 'mdi:file-document', color: 'red' },
]

// State
const selectedTable = ref('users')
const tableData = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchQuery = ref('')
const selectedRecord = ref<any>(null)
const showRecordModal = ref(false)

// Fetch table data
const fetchTableData = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      table: selectedTable.value,
      page: page.value.toString(),
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
    total.value = response.total
  } catch (error: any) {
    toast.error(error.message || 'Failed to load table data')
  } finally {
    loading.value = false
  }
}

// Watch for table/page changes
watch([selectedTable, page], () => {
  fetchTableData()
})

// Watch for search with debounce
watch(searchQuery, () => {
  page.value = 1
  fetchTableData()
})

// Initial fetch
onMounted(() => {
  fetchTableData()
})

// Select table
const selectTable = (tableName: string) => {
  selectedTable.value = tableName
  page.value = 1
  searchQuery.value = ''
}

// View record details
const viewRecord = (record: any) => {
  selectedRecord.value = record
  showRecordModal.value = true
}

// Close modal
const closeModal = () => {
  showRecordModal.value = false
  selectedRecord.value = null
}

// Format value for display
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string' && value.length > 50) return value.substring(0, 47) + '...'
  return String(value)
}

// Get color classes
const getColorClasses = (color: string) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return colors[color] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

// Pagination
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const goToPage = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
}

// Get table columns
const getColumns = (data: any[]): string[] => {
  if (data.length === 0) return []
  return Object.keys(data[0])
}

const columns = computed(() => getColumns(tableData.value))

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="max-w-[1600px] mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold gradient-text mb-2">Database Viewer</h1>
      <p class="text-gray-400">Browse and inspect database tables and records</p>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <!-- Sidebar - Table List -->
      <div class="col-span-12 lg:col-span-3">
        <div class="glass-card p-4 sticky top-4">
          <h2 class="text-lg font-bold text-gray-100 mb-4">Tables</h2>
          <div class="space-y-2">
            <button
              v-for="table in tables"
              :key="table.name"
              @click="selectTable(table.name)"
              class="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
              :class="selectedTable === table.name
                ? `${getColorClasses(table.color)} border`
                : 'glass-btn hover:bg-gray-700'"
            >
              <Icon :name="table.icon" class="w-5 h-5" />
              <div class="flex-1 text-left">
                <div class="font-medium text-sm">{{ table.label }}</div>
                <div class="text-xs text-gray-500">{{ table.name }}</div>
              </div>
              <Icon
                v-if="selectedTable === table.name"
                name="mdi:chevron-right"
                class="w-5 h-5"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content - Table Data -->
      <div class="col-span-12 lg:col-span-9">
        <!-- Search and Info -->
        <div class="glass-card p-4 mb-6">
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <div class="relative">
                <Icon name="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search records..."
                  class="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-400">
                <span class="font-semibold text-gray-300">{{ total }}</span> records
              </div>
              <button
                @click="fetchTableData"
                :disabled="loading"
                class="p-2 glass-btn rounded-lg hover:scale-110 transition-transform"
              >
                <Icon
                  name="mdi:refresh"
                  class="w-5 h-5"
                  :class="{ 'animate-spin': loading }"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="glass-card">
          <!-- Loading State -->
          <div v-if="loading" class="p-12 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p class="text-gray-400">Loading table data...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="tableData.length === 0" class="p-12 text-center">
            <Icon name="mdi:database-off" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p class="text-gray-400 text-lg">No records found</p>
            <p class="text-gray-500 text-sm mt-2">This table is currently empty</p>
          </div>

          <!-- Data Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th
                    v-for="column in columns"
                    :key="column"
                    class="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                  >
                    {{ column }}
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800">
                <tr
                  v-for="(record, index) in tableData"
                  :key="index"
                  class="hover:bg-gray-800/30 transition-colors"
                >
                  <td
                    v-for="column in columns"
                    :key="column"
                    class="px-4 py-3 text-sm text-gray-300"
                  >
                    <span
                      v-if="column === 'status'"
                    >
                      <span
                        class="px-2 py-1 text-xs font-semibold rounded-full"
                        :class="{
                          'bg-green-500/20 text-green-400': record[column] === 'ACTIVE',
                          'bg-yellow-500/20 text-yellow-400': record[column] === 'SUSPENDED',
                          'bg-red-500/20 text-red-400': record[column] === 'BANNED',
                        }"
                      >
                        {{ record[column] }}
                      </span>
                    </span>
                    <span
                      v-else-if="(column.toLowerCase().includes('date') || column.toLowerCase().endsWith('at')) && column !== 'data'"
                      class="text-gray-400"
                    >
                      {{ formatDate(record[column]) }}
                    </span>
                    <span
                      v-else-if="column === 'id'"
                      class="font-mono text-xs text-gray-500"
                    >
                      {{ record[column].substring(0, 8) }}...
                    </span>
                    <span
                      v-else-if="typeof record[column] === 'boolean'"
                      :class="record[column] ? 'text-green-400' : 'text-red-400'"
                    >
                      {{ record[column] ? '✓' : '✗' }}
                    </span>
                    <span v-else>{{ formatValue(record[column]) }}</span>
                  </td>
                  <td class="px-4 py-3 text-sm text-right">
                    <button
                      @click="viewRecord(record)"
                      class="text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <Icon name="mdi:eye" class="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="border-t border-gray-800 p-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-400">
                Showing {{ (page - 1) * pageSize + 1 }} to {{ Math.min(page * pageSize, total) }} of {{ total }} records
              </p>
              <div class="flex items-center gap-2">
                <button
                  :disabled="page === 1"
                  @click="goToPage(page - 1)"
                  class="p-2 rounded-lg glass-btn transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                >
                  <Icon name="mdi:chevron-left" class="w-5 h-5" />
                </button>
                <span class="text-sm text-gray-400">Page {{ page }} of {{ totalPages }}</span>
                <button
                  :disabled="page === totalPages"
                  @click="goToPage(page + 1)"
                  class="p-2 rounded-lg glass-btn transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                >
                  <Icon name="mdi:chevron-right" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Record Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showRecordModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div class="glass-card max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-800">
            <h3 class="text-xl font-bold text-gray-100">Record Details</h3>
            <button
              @click="closeModal"
              class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Icon name="mdi:close" class="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="selectedRecord" class="space-y-4">
              <div
                v-for="(value, key) in selectedRecord"
                :key="key"
                class="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50"
              >
                <div class="text-sm font-medium text-gray-400 mb-2">{{ key }}</div>
                <div class="text-gray-100 break-all">
                  <pre v-if="typeof value === 'object'" class="text-sm bg-gray-900/50 rounded p-3 overflow-x-auto">{{ JSON.stringify(value, null, 2) }}</pre>
                  <span v-else class="text-sm">{{ value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
