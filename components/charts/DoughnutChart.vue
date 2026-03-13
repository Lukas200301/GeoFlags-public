<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup lang="ts">
import {
  Chart,
  ArcElement,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js'

// Register Chart.js components
Chart.register(ArcElement, DoughnutController, Title, Tooltip, Legend)

interface Props {
  labels: string[]
  data: number[]
  title?: string
  backgroundColor?: string[]
  borderColor?: string[]
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const defaultBackgroundColors = [
  'rgba(99, 102, 241, 0.8)',
  'rgba(139, 92, 246, 0.8)',
  'rgba(59, 130, 246, 0.8)',
  'rgba(236, 72, 153, 0.8)',
  'rgba(34, 197, 94, 0.8)',
  'rgba(251, 146, 60, 0.8)',
  'rgba(14, 165, 233, 0.8)',
  'rgba(168, 85, 247, 0.8)',
]

const defaultBorderColors = [
  'rgb(99, 102, 241)',
  'rgb(139, 92, 246)',
  'rgb(59, 130, 246)',
  'rgb(236, 72, 153)',
  'rgb(34, 197, 94)',
  'rgb(251, 146, 60)',
  'rgb(14, 165, 233)',
  'rgb(168, 85, 247)',
]

const createChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const config: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: props.labels,
      datasets: [
        {
          data: props.data,
          backgroundColor: props.backgroundColor || defaultBackgroundColors,
          borderColor: props.borderColor || defaultBorderColors,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            color: 'rgb(209, 213, 219)',
            font: {
              size: 12,
            },
            padding: 15,
            usePointStyle: true,
            generateLabels: (chart) => {
              const data = chart.data
              if (data.labels && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i] as number
                  const total = (data.datasets[0].data as number[]).reduce((a, b) => a + b, 0)
                  const percentage = Math.round((value / total) * 100)
                  return {
                    text: `${label}: ${percentage}%`,
                    fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                    fontColor: 'rgb(209, 213, 219)',
                    hidden: false,
                    index: i,
                  }
                })
              }
              return []
            },
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
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.parsed as number
              const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0)
              const percentage = Math.round((value / total) * 100)
              return `${label}: ${value} (${percentage}%)`
            },
          },
        },
      },
      cutout: '65%',
    },
  }

  chartInstance = new Chart(chartCanvas.value, config)
}

// Watch for prop changes and recreate chart
watch(
  () => [props.labels, props.data],
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
