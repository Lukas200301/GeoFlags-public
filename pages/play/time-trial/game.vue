<template>
  <div class="max-w-4xl mx-auto">
    <!-- Timer Bar -->
    <div class="mb-6">
      <div class="glass-card p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <Icon name="mdi:timer" class="w-6 h-6 text-primary-400" />
            <span
              class="text-2xl font-bold"
              :class="timeLeft <= 10 ? 'text-red-400' : 'text-gray-100'"
            >
              {{ timeLeft }}s
            </span>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-sm text-gray-400">Score</div>
              <div class="text-2xl font-bold text-primary-400">{{ score }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-400">Streak</div>
              <div class="text-2xl font-bold text-amber-400">{{ streak }}</div>
            </div>
            <button @click="showQuitDialog = true" class="btn-secondary px-3 py-2 text-sm">
              <Icon name="mdi:close" class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            class="h-full transition-all duration-1000 ease-linear rounded-full"
            :class="
              timeLeft <= 10 ? 'bg-red-500' : 'bg-gradient-to-r from-primary-500 to-primary-600'
            "
            :style="{ width: `${(timeLeft / 60) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Flag Display -->
    <div class="card p-8 mb-6">
      <div class="text-center mb-6">
        <p class="text-gray-400 text-lg mb-4">What country is this flag from?</p>
        <div class="relative inline-block">
          <img
            :src="currentFlag?.flagUrl"
            :alt="`Flag of ${currentFlag?.name}`"
            class="w-full max-w-md h-auto rounded-lg shadow-2xl border-4 border-gray-700"
            :class="{ 'animate-pulse-slow': timeLeft <= 10 }"
          />
        </div>
      </div>

      <!-- Answer Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          v-for="option in options"
          :key="option.code"
          @click="handleAnswer(option.code)"
          :disabled="isAnswering"
          class="btn-option p-4 text-left rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
          :class="getButtonClass(option.code)"
        >
          <span class="text-lg font-medium">{{ option.name }}</span>
        </button>
      </div>
    </div>

    <!-- Feedback Toast -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showFeedback"
          class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl"
          :class="lastAnswerCorrect ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'"
        >
          <div class="flex items-center gap-3">
            <Icon
              :name="lastAnswerCorrect ? 'mdi:check-circle' : 'mdi:close-circle'"
              class="w-6 h-6"
            />
            <span class="font-semibold text-lg">
              {{ lastAnswerCorrect ? 'Correct! +1' : 'Wrong! -5s' }}
            </span>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Quit Confirmation Dialog -->
    <div
      v-if="showQuitDialog"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <div class="card max-w-md w-full p-6">
        <h3 class="text-2xl font-bold text-gray-100 mb-4">Quit Game?</h3>
        <p class="text-gray-300 mb-6">
          Are you sure you want to quit? Your current progress (Score:
          <strong class="text-primary-400">{{ score }}</strong
          >, Time: <strong class="text-amber-400">{{ timeLeft }}s</strong>) will be lost.
        </p>
        <div class="flex gap-4">
          <button @click="showQuitDialog = false" class="btn-secondary flex-1">
            Continue Playing
          </button>
          <button @click="confirmQuit" class="btn-primary flex-1 bg-red-600 hover:bg-red-500">
            Quit Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Time Trial Game Mode
 * 60 seconds to guess as many flags as possible
 * Correct = +1 point
 * Incorrect = -5 seconds penalty
 */
definePageMeta({
  layout: 'default',
  middleware: 'can-play',
})

const router = useRouter()
const { getAllCountries } = useCountries()

interface Country {
  code: string
  name: string
  flagUrl: string
}

const timeLeft = ref(60)
const score = ref(0)
const streak = ref(0)
const currentFlag = ref<Country | null>(null)
const options = ref<Country[]>([])
const usedFlags = ref<Set<string>>(new Set())
const allCountries = ref<Country[]>([])
const isAnswering = ref(false)
const showFeedback = ref(false)
const lastAnswerCorrect = ref(false)
const timerInterval = ref<NodeJS.Timeout | null>(null)
const gameStartTime = ref<number>(0)
const showQuitDialog = ref(false)

// Get button styling
const getButtonClass = (_code: string) => {
  return 'bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-primary-500'
}

// Load countries
const loadCountries = async () => {
  try {
    const countries = getAllCountries()
    allCountries.value = countries.map((c) => ({
      code: c.code,
      name: c.name,
      flagUrl: c.flag,
    }))
    nextQuestion()
    startTimer()
  } catch (error) {
    console.error('Failed to load countries:', error)
    router.push('/play')
  }
}

// Start timer
const startTimer = () => {
  gameStartTime.value = Date.now()
  timerInterval.value = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 1000)
}

// Generate next question
const nextQuestion = () => {
  const availableCountries = allCountries.value.filter((c) => !usedFlags.value.has(c.code))

  // Reset used flags if all have been shown
  if (availableCountries.length < 4) {
    usedFlags.value.clear()
    nextQuestion()
    return
  }

  // Pick random correct answer
  const correctIndex = Math.floor(Math.random() * availableCountries.length)
  const correct = availableCountries[correctIndex]
  currentFlag.value = correct
  usedFlags.value.add(correct.code)

  // Pick 3 random wrong answers
  const wrongOptions = availableCountries
    .filter((c) => c.code !== correct.code)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  // Shuffle all options
  options.value = [correct, ...wrongOptions].sort(() => Math.random() - 0.5)
}

// Handle answer
const handleAnswer = async (selectedCode: string) => {
  if (isAnswering.value) return

  isAnswering.value = true
  const isCorrect = selectedCode === currentFlag.value?.code

  // Show feedback
  lastAnswerCorrect.value = isCorrect
  showFeedback.value = true
  setTimeout(() => {
    showFeedback.value = false
  }, 800)

  if (isCorrect) {
    score.value++
    streak.value++
  } else {
    // Penalty: -5 seconds
    timeLeft.value = Math.max(0, timeLeft.value - 5)
    streak.value = 0
    if (timeLeft.value === 0) {
      endGame()
      return
    }
  }

  // Small delay before next question
  await new Promise((resolve) => setTimeout(resolve, 600))

  nextQuestion()
  isAnswering.value = false
}

// End game
const endGame = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }

  // Calculate time elapsed
  const timeElapsed = 60 - timeLeft.value

  // Navigate to results with score
  router.push({
    path: '/play/time-trial/results',
    query: {
      score: score.value.toString(),
      timeElapsed: timeElapsed.toString(),
    },
  })
}

// Handle quit game
const confirmQuit = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  showQuitDialog.value = false
  router.push('/play/time-trial')
}

// Cleanup on unmount
onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})

// Initialize game
onMounted(() => {
  loadCountries()
})
</script>

<style scoped>
.btn-option {
  @apply transition-all duration-200;
}

.animate-pulse-slow {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
