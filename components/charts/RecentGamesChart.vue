<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup lang="ts">
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler, type ChartConfiguration } from 'chart.js'

// Register Chart.js components
Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler)

interface Game {
  gameNumber: number
  score: number
  mode: string
  date: string
}

interface Props {
  games: Game[]
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const formatGameMode = (mode: string) => {
  const modeNames: Record<string, string> = {
    FLAGS: 'Flags',
    CAPITALS: 'Capitals',
    MAPS: 'Maps',
    MIXED: 'Mixed',
    GUESS_FLAG: 'Guess the Flag',
    TIME_TRIAL: 'Time Trial',
    FIND_CAPITAL: 'Find the Capital',
    HIGHER_LOWER: 'Higher/Lower',
  }
  return modeNames[mode] || mode.replace(/_/g, ' ')
}

const createChart = () => {
  if (!chartCanvas.value || !props.games || props.games.length === 0) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Prepare labels (dates) and data
  const labels = props.games.map(game => {
    const date = new Date(game.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  })

  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Score',
          data: props.games.map(game => game.score),
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: 'rgb(243, 244, 246)',
          bodyColor: 'rgb(209, 213, 219)',
          borderColor: 'rgba(139, 92, 246, 0.5)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (context) => {
              const index = context[0].dataIndex
              const game = props.games[index]
              const date = new Date(game.date)
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            },
            label: (context) => {
              const index = context.dataIndex
              const game = props.games[index]
              return [
                `Mode: ${formatGameMode(game.mode)}`,
                `Score: ${game.score}`,
                `Game #${game.gameNumber}`
              ]
            },
          },
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
              size: 10,
            },
            maxRotation: 45,
            minRotation: 45,
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
            display: true,
            text: 'Score',
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
watch(() => props.games, () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>
