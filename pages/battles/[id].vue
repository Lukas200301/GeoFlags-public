<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-24">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
        <p class="mt-4 text-gray-400">Loading battle...</p>
      </div>

      <!-- Battle Not Found -->
      <div v-else-if="!battle" class="text-center py-24">
        <Icon name="mdi:alert-circle" class="text-6xl text-red-500 mb-4" />
        <p class="text-xl text-gray-400">Battle not found</p>
        <NuxtLink to="/battles" class="inline-block mt-4 px-6 py-3 bg-purple-500 rounded-lg hover:bg-purple-600 transition-all">
          Back to Battles
        </NuxtLink>
      </div>

      <!-- Waiting for Opponent -->
      <div v-else-if="battle.status === 'WAITING' && !battle.opponent" class="text-center py-24">
        <div class="glass-card p-12">
          <div class="animate-pulse mb-6">
            <Icon name="mdi:clock-outline" class="text-6xl text-purple-400" />
          </div>
          <h2 class="text-3xl font-bold mb-4">Waiting for Opponent...</h2>
          <p class="text-gray-400 mb-8">The battle will start once someone joins your room</p>
          <button
            @click="cancelBattle"
            class="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all"
          >
            Cancel Room
          </button>
        </div>
      </div>

      <!-- Ready Screen -->
      <div v-else-if="!battleStarted && battle.opponent" class="text-center py-24">
        <div class="glass-card p-12">
          <h2 class="text-3xl font-bold mb-8">Get Ready!</h2>

          <!-- Players -->
          <div class="flex items-center justify-center gap-12 mb-8">
            <div class="text-center">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-3xl font-bold mb-3 mx-auto">
                {{ battle.challenger.username[0].toUpperCase() }}
              </div>
              <div class="font-semibold text-lg">{{ battle.challenger.username }}</div>
              <div v-if="challengerReady" class="text-green-400 mt-2">
                <Icon name="mdi:check-circle" class="inline-block" /> Ready!
              </div>
            </div>

            <Icon name="mdi:sword-cross" class="text-4xl text-purple-400" />

            <div class="text-center">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center text-3xl font-bold mb-3 mx-auto">
                {{ battle.opponent.username[0].toUpperCase() }}
              </div>
              <div class="font-semibold text-lg">{{ battle.opponent.username }}</div>
              <div v-if="opponentReady" class="text-green-400 mt-2">
                <Icon name="mdi:check-circle" class="inline-block" /> Ready!
              </div>
            </div>
          </div>

          <div class="mb-8">
            <div class="text-lg text-gray-300 mb-2">Game Mode: <span class="text-purple-400 font-bold">{{ getModeName(battle.mode) }}</span></div>
            <div class="text-lg text-gray-300">Questions: <span class="text-purple-400 font-bold">{{ battle.totalRounds }}</span></div>
          </div>

          <button
            v-if="!isReady"
            @click="markReady"
            class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold text-xl hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            I'm Ready!
          </button>
          <div v-else class="text-green-400 text-xl font-bold">
            <Icon name="mdi:check-circle" class="inline-block mr-2" />
            Waiting for opponent...
          </div>
        </div>
      </div>

      <!-- Battle In Progress -->
      <div v-else-if="battleStarted && !battleCompleted">
        <!-- Score Header -->
        <div class="glass-card p-6 mb-6">
          <div class="flex items-center justify-between">
            <!-- Your Score -->
            <div class="text-center flex-1">
              <div class="text-sm text-gray-400 mb-1">You</div>
              <div class="text-3xl font-bold text-sky-400">{{ myScore }}</div>
              <div class="text-xs text-gray-500">{{ currentUsername }}</div>
            </div>

            <!-- Progress -->
            <div class="text-center px-8">
              <div class="text-sm text-gray-400 mb-2">Progress</div>
              <div class="text-2xl font-bold text-purple-400">
                {{ currentQuestionIndex + 1 }} / {{ battle.totalRounds }}
              </div>
            </div>

            <!-- Opponent Score -->
            <div class="text-center flex-1">
              <div class="text-sm text-gray-400 mb-1">Opponent</div>
              <div class="text-3xl font-bold text-pink-400">{{ opponentScore }}</div>
              <div class="text-xs text-gray-500">{{ opponentUsername }}</div>
              <div v-if="opponentAnswered" class="text-green-400 text-sm mt-1">
                <Icon name="mdi:check" class="inline-block" /> Answered
              </div>
            </div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="glass-card p-8 mb-6">
          <div v-if="currentQuestion">
            <!-- Timer -->
            <div class="flex items-center justify-center gap-4 mb-6">
              <Icon name="mdi:timer-outline" class="text-2xl text-purple-400" />
              <div class="text-2xl font-bold">{{ timeRemaining }}s</div>
            </div>

            <!-- Flag Question -->
            <div v-if="currentQuestion.type === 'flag'" class="text-center mb-8">
              <img 
                :src="`${$config.public.apiBase}/api/flags/${currentQuestion.countryCode.toLowerCase()}`" 
                :alt="currentQuestion.countryCode"
                class="w-64 h-auto mx-auto mb-6 rounded-lg shadow-lg"
              />
              <h3 class="text-2xl font-bold mb-2">{{ currentQuestion.question }}</h3>
            </div>

            <!-- Text Question -->
            <div v-else class="text-center mb-8">
              <h3 class="text-2xl font-bold mb-4 whitespace-pre-line">{{ currentQuestion.question }}</h3>
            </div>

            <!-- Answer Options -->
            <div class="grid grid-cols-2 gap-4">
              <button
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                @click="submitAnswer(option)"
                :disabled="answered"
                :class="[
                  'p-6 rounded-lg font-semibold text-lg transition-all duration-300',
                  answered && option === selectedAnswer && option === currentQuestion.correctAnswer
                    ? 'bg-green-500 ring-4 ring-green-400'
                    : answered && option === selectedAnswer
                    ? 'bg-red-500 ring-4 ring-red-400'
                    : answered && option === currentQuestion.correctAnswer
                    ? 'bg-green-500/50'
                    : answered
                    ? 'bg-white/5 opacity-50'
                    : 'bg-white/10 hover:bg-white/20 hover:scale-105'
                ]"
              >
                {{ option }}
              </button>
            </div>

            <!-- Answer Feedback -->
            <div v-if="answered" class="mt-6 text-center">
              <div v-if="lastAnswerCorrect" class="text-green-400 text-xl font-bold">
                <Icon name="mdi:check-circle" class="inline-block mr-2" />
                Correct! +{{ lastPoints }} points
              </div>
              <div v-else class="text-red-400 text-xl font-bold">
                <Icon name="mdi:close-circle" class="inline-block mr-2" />
                Incorrect! The answer was: {{ currentQuestion.correctAnswer }}
              </div>
            </div>
          </div>
        </div>

        <!-- Forfeit Button -->
        <div class="text-center mt-6">
          <button
            @click="showSurrenderConfirm = true"
            class="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          >
            <Icon name="mdi:flag-variant" class="inline-block mr-2" />
            Surrender
          </button>
        </div>
      </div>

      <!-- Battle Complete -->
      <div v-else-if="battleCompleted" class="text-center py-12">
        <div class="glass-card p-12">
          <!-- Winner Announcement -->
          <div v-if="isWinner" class="mb-8">
            <div class="text-6xl mb-4">🏆</div>
            <h2 class="text-4xl font-bold text-yellow-400 mb-2">Victory!</h2>
            <p class="text-xl text-gray-300">You won the battle!</p>
          </div>
          <div v-else-if="isTie" class="mb-8">
            <div class="text-6xl mb-4">🤝</div>
            <h2 class="text-4xl font-bold text-blue-400 mb-2">It's a Tie!</h2>
            <p class="text-xl text-gray-300">Great match!</p>
          </div>
          <div v-else class="mb-8">
            <div class="text-6xl mb-4">😔</div>
            <h2 class="text-4xl font-bold text-gray-400 mb-2">Defeat</h2>
            <p class="text-xl text-gray-300">Better luck next time!</p>
          </div>

          <!-- Final Scores -->
          <div class="flex items-center justify-center gap-12 mb-8">
            <div class="text-center">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-3xl font-bold mb-3 mx-auto relative">
                {{ battle.challenger.username[0].toUpperCase() }}
                <div v-if="battle.winnerId === battle.challengerId" class="absolute -top-2 -right-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Icon name="mdi:crown" class="text-2xl" />
                </div>
              </div>
              <div class="font-semibold text-lg">{{ battle.challenger.username }}</div>
              <div class="text-3xl font-bold text-sky-400 mt-2">{{ challengerFinalScore }}</div>
            </div>

            <Icon name="mdi:sword-cross" class="text-4xl text-gray-500" />

            <div class="text-center">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center text-3xl font-bold mb-3 mx-auto relative">
                {{ battle.opponent.username[0].toUpperCase() }}
                <div v-if="battle.winnerId === battle.opponentId" class="absolute -top-2 -right-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Icon name="mdi:crown" class="text-2xl" />
                </div>
              </div>
              <div class="font-semibold text-lg">{{ battle.opponent.username }}</div>
              <div class="text-3xl font-bold text-pink-400 mt-2">{{ opponentFinalScore }}</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 justify-center">
            <NuxtLink
              to="/battles"
              class="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              Back to Battles
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Surrender Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showSurrenderConfirm"
          class="fixed inset-0 md:left-64 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          @click="showSurrenderConfirm = false"
        >
          <div
            class="glass-card p-8 max-w-md w-full"
            @click.stop
          >
            <h3 class="text-2xl font-bold mb-4 text-center">Surrender Battle?</h3>
            <p class="text-gray-300 text-center mb-6">
              Are you sure you want to surrender? Your opponent will automatically win the battle.
            </p>
            <div class="flex gap-4">
              <button
                @click="showSurrenderConfirm = false"
                class="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                @click="confirmSurrender"
                class="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-all"
              >
                Yes, Surrender
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface BattleAnswerResponse {
  isCorrect: boolean
  points: number
  totalScore: number
}

interface BattleDetailsResponse {
  battle: any
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { getCsrfToken } = useApi()

const route = useRoute()
const battleId = route.params.id as string
const { user } = useAuth()
const currentUsername = computed(() => user.value?.username)
const { socket, connected, connect, disconnect } = useSocket()

const loading = ref(true)
const battle = ref<any>(null)
const battleStarted = ref(false)
const battleCompleted = ref(false)
const isReady = ref(false)
const challengerReady = ref(false)
const opponentReady = ref(false)

const questions = ref<any[]>([])
const currentQuestionIndex = ref(0)
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const answered = ref(false)
const selectedAnswer = ref<string | null>(null)
const lastAnswerCorrect = ref(false)
const lastPoints = ref(0)

const myScore = ref(0)
const opponentScore = ref(0)
const opponentAnswered = ref(false)

const showSurrenderConfirm = ref(false)

const timeRemaining = ref(30)
let questionTimer: any = null
let questionStartTime = 0

const isWinner = computed(() => battle.value?.winnerId === user.value?.id)
const isTie = computed(() => battle.value?.winnerId === null && battleCompleted.value)
const challengerFinalScore = ref(0)
const opponentFinalScore = ref(0)

// Computed properties for cleaner username logic
const opponentUsername = computed(() => {
  if (!battle.value || !user.value) return ''
  
  // If I'm the challenger, the opponent is the opponent user
  if (user.value.id === battle.value.challengerId) {
    return battle.value.opponent?.username || 'Opponent'
  }
  
  // If I'm the opponent, the challenger is my opponent
  if (user.value.id === battle.value.opponentId) {
    return battle.value.challenger?.username || 'Opponent'
  }
  
  return 'Opponent'
})

// Load battle details
onMounted(async () => {
  // Connect to socket first
  connect()

  await loadBattle()

  // Wait for socket connection before setting up listeners
  let attempts = 0
  const waitForSocket = () => {
    attempts++

    if (socket.value && connected.value) {
      setupSocketListeners()
    } else if (attempts < 50) {
      setTimeout(waitForSocket, 100)
    }
  }
  waitForSocket()
})

onUnmounted(() => {
  if (questionTimer) clearInterval(questionTimer)

  // Leave battle room
  if (socket.value && connected.value) {
    socket.value.emit('battle:leave', battleId)
  }

  // Disconnect socket when leaving the page
  disconnect()
})

async function loadBattle() {
  try {
    const data = await $fetch<BattleDetailsResponse>(`${apiBase}/api/battles/${battleId}`, {
      credentials: 'include'
    })
    battle.value = data.battle

    // Load ready states from participants
    if (battle.value.participants && battle.value.participants.length > 0) {
      const challengerParticipant = battle.value.participants.find((p: any) => p.userId === battle.value.challengerId)
      const opponentParticipant = battle.value.participants.find((p: any) => p.userId === battle.value.opponentId)

      challengerReady.value = challengerParticipant?.isReady || false
      opponentReady.value = opponentParticipant?.isReady || false

      // Check if current user is ready
      const myParticipant = battle.value.participants.find((p: any) => p.userId === user.value?.id)
      if (myParticipant?.isReady) {
        isReady.value = true
      }
    }

    if (battle.value.status === 'IN_PROGRESS') {
      questions.value = battle.value.questions
      battleStarted.value = true
      startQuestionTimer()
    }

    if (battle.value.status === 'COMPLETED') {
      battleCompleted.value = true
      challengerFinalScore.value = battle.value.participants.find((p: any) => p.userId === battle.value.challengerId)?.score || 0
      opponentFinalScore.value = battle.value.participants.find((p: any) => p.userId === battle.value.opponentId)?.score || 0
    }
  } catch (error) {
    console.error('Failed to load battle:', error)
  } finally {
    loading.value = false
  }
}

function setupSocketListeners() {
  if (!socket.value) {
    return
  }

  // Get the actual socket instance (unwrap readonly)
  const socketInstance = socket.value

  // Join battle room FIRST (before setting up listeners)
  socketInstance.emit('battle:join', battleId)

  // Remove any existing listeners to prevent duplicates
  socketInstance.off('battle:opponent:joined')
  socketInstance.off('battle:opponent:ready')
  socketInstance.off('battle:start')
  socketInstance.off('battle:opponent:answered')
  socketInstance.off('battle:complete')

  // Listen for opponent joining
  socketInstance.on('battle:opponent:joined', () => {
    // Reload battle to get updated opponent info
    loadBattle()
  })

  // Listen for opponent ready
  socketInstance.on('battle:opponent:ready', (data: any) => {
    // Update the correct ready state based on who sent the event
    if (data.userId === battle.value?.challengerId) {
      challengerReady.value = true
    } else if (data.userId === battle.value?.opponentId) {
      opponentReady.value = true
    }
  })

  // Listen for battle start
  socketInstance.on('battle:start', (data: any) => {
    questions.value = data.questions
    battleStarted.value = true
    startQuestionTimer()
  })

  // Listen for opponent answering
  socketInstance.on('battle:opponent:answered', (data: any) => {
    opponentAnswered.value = true
    if (data.totalScore !== undefined) {
      opponentScore.value = data.totalScore
    }
  })

  // Listen for battle complete
  socketInstance.on('battle:complete', (data: any) => {
    battleCompleted.value = true
    battle.value.winnerId = data.winnerId
    challengerFinalScore.value = data.participants.find((p: any) => p.userId === battle.value.challengerId)?.score || 0
    opponentFinalScore.value = data.participants.find((p: any) => p.userId === battle.value.opponentId)?.score || 0
  })

  // Listen for opponent forfeit
  socketInstance.on('battle:opponent:forfeited', (data: any) => {
    battleCompleted.value = true
    battle.value.winnerId = data.winnerId
    // Update scores from participants if available
    if (data.participants && data.participants.length > 0) {
      challengerFinalScore.value = data.participants.find((p: any) => p.userId === battle.value.challengerId)?.score || 0
      opponentFinalScore.value = data.participants.find((p: any) => p.userId === battle.value.opponentId)?.score || 0
    } else {
      // Reload battle to get final state
      loadBattle()
    }
  })
}

async function markReady() {
  try {
    const csrfToken = await getCsrfToken()
    await $fetch(`${apiBase}/api/battles/${battleId}/ready`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })
    isReady.value = true

    // Emit socket event
    if (socket.value && connected.value) {
      socket.value.emit('battle:ready', { battleId })
    }
  } catch (error) {
    alert('Failed to mark as ready')
  }
}

async function submitAnswer(answer: string) {
  if (answered.value) return

  const timeSpent = Date.now() - questionStartTime
  selectedAnswer.value = answer
  answered.value = true

  if (questionTimer) {
    clearInterval(questionTimer)
  }

  // Submit answer to server
  try {
    const csrfToken = await getCsrfToken()
    const response = await $fetch<BattleAnswerResponse>(`${apiBase}/api/battles/${battleId}/answer`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken
      },
      body: {
        questionIndex: currentQuestionIndex.value,
        answer,
        timeSpent
      }
    })

    lastAnswerCorrect.value = response.isCorrect
    lastPoints.value = response.points
    myScore.value = response.totalScore

    // Emit socket event
    if (socket.value && connected.value) {
      socket.value.emit('battle:answer:submit', {
        battleId,
        questionIndex: currentQuestionIndex.value,
        answer,
        isCorrect: response.isCorrect,
        points: response.points,
        totalScore: response.totalScore
      })
    }

    // Move to next question after 3 seconds
    setTimeout(() => {
      nextQuestion()
    }, 3000)
  } catch (error) {
    console.error('Failed to submit answer:', error)
  }
}

function nextQuestion() {
  if (currentQuestionIndex.value < battle.value.totalRounds - 1) {
    currentQuestionIndex.value++
    answered.value = false
    selectedAnswer.value = null
    opponentAnswered.value = false
    startQuestionTimer()
  }
}

function startQuestionTimer() {
  timeRemaining.value = 30
  questionStartTime = Date.now()

  questionTimer = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      clearInterval(questionTimer)
      if (!answered.value) {
        submitAnswer('') // Submit empty answer on timeout
      }
    }
  }, 1000)
}

async function confirmSurrender() {
  showSurrenderConfirm.value = false
  
  try {
    // Determine winner (the other player)
    const winnerId = battle.value.challengerId === user.value?.id 
      ? battle.value.opponentId 
      : battle.value.challengerId

    const csrfToken = await getCsrfToken()
    const response = await $fetch<any>(`${apiBase}/api/battles/${battleId}/forfeit`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })

    // Emit socket event with participant data
    if (socket.value && connected.value) {
      socket.value.emit('battle:forfeit', { 
        battleId, 
        winnerId,
        participants: response.participants
      })
    }

    navigateTo('/battles')
  } catch (error) {
    alert('Failed to surrender battle')
  }
}

// Cancel battle during waiting phase (no confirmation needed)
async function cancelBattle() {
  try {
    const csrfToken = await getCsrfToken()
    await $fetch(`${apiBase}/api/battles/${battleId}/forfeit`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })
    navigateTo('/battles')
  } catch (error) {
    alert('Failed to cancel room')
  }
}

function getModeName(modeId: string) {
  // Remove BATTLE_ prefix and format the string
  return modeId
    .replace(/^BATTLE_/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

</script>
