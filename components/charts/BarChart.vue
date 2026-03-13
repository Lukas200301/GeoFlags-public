<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup lang="ts">
import {
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js'

// Register Chart.js components
Chart.register(BarElement, BarController, CategoryScale, LinearScale, Title, Tooltip, Legend)

interface Props {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }>
  title?: string
  yAxisLabel?: string
  horizontal?: boolean
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: props.datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor || [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: dataset.borderColor || [
          'rgb(99, 102, 241)',
          'rgb(139, 92, 246)',
          'rgb(59, 130, 246)',
          'rgb(236, 72, 153)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: dataset.borderWidth || 2,
        borderRadius: 6,
      })),
    },
    options: {
      indexAxis: props.horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: props.datasets.length > 1,
          position: 'top',
          labels: {
            color: 'rgb(209, 213, 219)',
            font: {
              size: 12,
            },
            padding: 15,
            usePointStyle: true,
          },
        },
        title: {
          display: !!props.title,
          text: props.title,
          color: 'rgb(243, 244, 246)',
          font: {
            size: 16,
            weight: 'bold',
          },
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: 'rgb(243, 244, 246)',
          bodyColor: 'rgb(209, 213, 219)',
          borderColor: 'rgba(99, 102, 241, 0.5)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
        },
      },
      scales: {
        x: {
          grid: {
            display: !props.horizontal,
            color: 'rgba(75, 85, 99, 0.2)',
          },
          ticks: {
            color: 'rgb(156, 163, 175)',
            font: {
              size: 11,
            },
          },
          border: {
            color: 'rgba(75, 85, 99, 0.5)',
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: props.horizontal,
            color: 'rgba(75, 85, 99, 0.2)',
          },
          ticks: {
            color: 'rgb(156, 163, 175)',
            font: {
              size: 11,
            },
          },
          border: {
            display: false,
          },
          title: {
            display: !!props.yAxisLabel && !props.horizontal,
            text: props.yAxisLabel,
            color: 'rgb(209, 213, 219)',
            font: {
              size: 12,
            },
          },
        },
      },
    },
  }

  chartInstance = new Chart(chartCanvas.value, config)
}

// Watch for prop changes and recreate chart
watch(
  () => [props.labels, props.datasets],
  () => {
    createChart()
  },
  { deep: true }
)

onMounted(() => {
  createChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>
