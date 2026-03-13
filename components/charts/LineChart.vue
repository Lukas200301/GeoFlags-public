<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup lang="ts">
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration,
} from 'chart.js'

// Register Chart.js components
Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
    tension?: number
  }>
  title?: string
  yAxisLabel?: string
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

  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: props.datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.borderColor || 'rgb(99, 102, 241)',
        backgroundColor: dataset.backgroundColor || 'rgba(99, 102, 241, 0.1)',
        fill: dataset.fill !== undefined ? dataset.fill : true,
        tension: dataset.tension !== undefined ? dataset.tension : 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
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
          mode: 'index',
          intersect: false,
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
            display: false,
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
            display: !!props.yAxisLabel,
            text: props.yAxisLabel,
            color: 'rgb(209, 213, 219)',
            font: {
              size: 12,
            },
          },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
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
