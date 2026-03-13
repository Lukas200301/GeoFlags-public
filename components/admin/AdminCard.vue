<template>
  <div class="admin-card group hover-lift animate-fade-in-up">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-300 mb-1">{{ title }}</p>
        <p class="text-3xl font-bold gradient-text">
          {{ animatedValue }}
        </p>
        <p v-if="subtitle" class="text-sm text-gray-400 mt-1">{{ subtitle }}</p>
      </div>

      <!-- Icon -->
      <div
        v-if="icon"
        class="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        :class="iconBgColor || iconBgClass"
      >
        <Icon :name="icon" class="w-6 h-6" :class="iconColorClass" />
      </div>
    </div>

    <!-- Trend Indicator -->
    <div v-if="trend" class="flex items-center gap-2 text-sm">
      <div class="flex items-center gap-1 px-2 py-1 rounded-md glass-badge" :class="trendClasses">
        <Icon
          :name="trend.direction === 'up' ? 'mdi:trending-up' : 'mdi:trending-down'"
          class="w-4 h-4"
        />
        <span class="font-medium">{{ trend.value }}</span>
      </div>
      <span class="text-gray-300">{{ trend.label || 'vs last period' }}</span>
    </div>

    <!-- Sparkline (optional) -->
    <div v-if="sparklineData && sparklineData.length > 0" class="mt-3">
      <svg class="w-full h-12" viewBox="0 0 100 30" preserveAspectRatio="none">
        <polyline
          :points="sparklinePoints"
          fill="none"
          :stroke="sparklineColor"
          stroke-width="2"
          class="transition-all duration-500"
        />
      </svg>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="absolute inset-0 glass-overlay rounded-xl flex items-center justify-center"
    >
      <Icon name="mdi:loading" class="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number | string
  icon?: string
  iconColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | string
  iconBgColor?: string
  trend?: {
    direction: 'up' | 'down'
    value: string | number
    label?: string
  }
  sparklineData?: number[]
  loading?: boolean
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  loading: false,
})

// Animated counter for numeric values
const animatedValue = ref(props.value)

watch(
  () => props.value,
  (newValue) => {
    if (typeof newValue === 'number' && typeof animatedValue.value === 'number') {
      const start = animatedValue.value
      const end = newValue
      const duration = 1000 // ms
      const startTime = Date.now()

      const animate = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        animatedValue.value = Math.round(start + (end - start) * easeOutQuart)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    } else {
      animatedValue.value = newValue
    }
  },
  { immediate: true }
)

// Icon styling
const iconBgClass = computed(() => {
  // If iconBgColor is provided, return empty string (will use prop directly)
  if (props.iconBgColor) return ''

  const colors: Record<string, string> = {
    primary: 'bg-primary-500/20 group-hover:bg-primary-500/30',
    success: 'bg-green-500/20 group-hover:bg-green-500/30',
    warning: 'bg-yellow-500/20 group-hover:bg-yellow-500/30',
    danger: 'bg-red-500/20 group-hover:bg-red-500/30',
    info: 'bg-blue-500/20 group-hover:bg-blue-500/30',
  }
  return colors[props.iconColor] || ''
})

const iconColorClass = computed(() => {
  // If it's a custom class (starts with 'text-'), use it directly
  if (props.iconColor.startsWith('text-')) {
    return props.iconColor
  }

  // Otherwise use predefined colors
  const colors: Record<string, string> = {
    primary: 'text-primary-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-blue-400',
  }
  return colors[props.iconColor] || 'text-primary-400'
})

// Trend styling
const trendClasses = computed(() => {
  if (!props.trend) return ''
  return props.trend.direction === 'up'
    ? 'bg-green-500/20 text-green-400'
    : 'bg-red-500/20 text-red-400'
})

// Sparkline
const sparklinePoints = computed(() => {
  if (!props.sparklineData || props.sparklineData.length === 0) return ''

  const data = props.sparklineData
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 30 - ((value - min) / range) * 30
      return `${x},${y}`
    })
    .join(' ')
})

const sparklineColor = computed(() => {
  const colors: Record<string, string> = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  }
  return colors[props.iconColor] || '#3b82f6'
})
</script>
