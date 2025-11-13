<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-6 my-8">
    <div class="text-center">
      <div class="text-4xl font-bold text-primary-600 mb-2">{{ score }}</div>
      <div class="text-sm text-gray-400">Total Score</div>
    </div>

    <div class="text-center">
      <div class="text-4xl font-bold text-green-600 mb-2">{{ correctAnswers }}</div>
      <div class="text-sm text-gray-400">Correct Answers</div>
    </div>

    <div class="text-center">
      <div class="text-4xl font-bold text-gray-400 mb-2">{{ totalQuestions }}</div>
      <div class="text-sm text-gray-400">Total Questions</div>
    </div>

    <div class="text-center">
      <div class="text-4xl font-bold text-blue-600 mb-2">{{ accuracy }}%</div>
      <div class="text-sm text-gray-400">Accuracy</div>
    </div>
  </div>

  <!-- Performance Badge -->
  <div class="flex justify-center mb-6">
    <div
      class="px-6 py-3 rounded-full font-bold text-white"
      :class="{
        'bg-gradient-to-r from-yellow-400 to-yellow-600': performance === 'Excellent',
        'bg-gradient-to-r from-green-400 to-green-600': performance === 'Great',
        'bg-gradient-to-r from-blue-400 to-blue-600': performance === 'Good',
        'bg-gradient-to-r from-gray-400 to-gray-600': performance === 'Keep Practicing',
      }"
    >
      {{ performance }}
    </div>
  </div>

  <!-- Time Taken -->
  <div v-if="timeTaken" class="text-center text-gray-400">
    <Icon name="mdi:clock-outline" class="w-5 h-5 inline mr-1" />
    Time: {{ formatTime(timeTaken) }}
  </div>
</template>

<script setup lang="ts">
/**
 * Score display component
 * Shows game results with statistics
 */
interface Props {
  score: number
  correctAnswers: number
  totalQuestions: number
  timeTaken?: number
}

const props = defineProps<Props>()

const accuracy = computed(() => {
  if (props.totalQuestions === 0) return 0
  return Math.round((props.correctAnswers / props.totalQuestions) * 100)
})

const performance = computed(() => {
  const acc = accuracy.value
  if (acc >= 90) return 'Excellent'
  if (acc >= 70) return 'Great'
  if (acc >= 50) return 'Good'
  return 'Keep Practicing'
})

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>
