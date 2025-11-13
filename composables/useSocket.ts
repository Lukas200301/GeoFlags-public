import { io, Socket } from 'socket.io-client'
import type { LeaderboardEntry, AdminStats } from '~/types'

/**
 * Socket.io client composable for realtime updates
 *
 * SECURITY NOTES:
 * - Connection authenticated with session cookie
 * - Events validated on backend before processing
 * - Auto-reconnect with exponential backoff
 */
export const useSocket = () => {
  const config = useRuntimeConfig()
  const wsUrl = config.public.wsUrl
  const { isAuthenticated, user } = useAuth()

  // Socket instance state
  const socket = useState<Socket | null>('socket:instance', () => null)
  const connected = useState<boolean>('socket:connected', () => false)

  // Realtime data states
  const liveLeaderboard = useState<LeaderboardEntry[]>('socket:leaderboard', () => [])
  const liveStats = useState<AdminStats | null>('socket:stats', () => null)

  /**
   * Initialize socket connection
   * SECURITY: Only connects if user is authenticated
   */
  const connect = () => {
    if (!isAuthenticated.value) {
      return
    }

    if (socket.value) {
      // If socket exists but is disconnected, reconnect it
      if (!socket.value.connected) {
        socket.value.connect()
      }
      return
    }

    const socketInstance = io(wsUrl, {
      withCredentials: true, // Send cookies with connection (includes HttpOnly accessToken)
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Connection events
    socketInstance.on('connect', () => {
      connected.value = true

      // Emit user online status
      if (user.value) {
        socketInstance.emit('user:online', user.value.id)
      }
    })

    socketInstance.on('disconnect', () => {
      connected.value = false
    })

    socketInstance.on('connect_error', () => {
      connected.value = false
    })

    // Leaderboard updates
    socketInstance.on('leaderboard:update', (data: LeaderboardEntry[]) => {
      liveLeaderboard.value = data
    })

    // Stats updates (admin only)
    socketInstance.on('stats:update', (data: AdminStats) => {
      liveStats.value = data
    })

    socket.value = socketInstance
  }

  /**
   * Disconnect socket
   */
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  /**
   * Emit game start event
   */
  const emitGameStart = (mode: string, difficulty: string) => {
    if (socket.value && connected.value) {
      socket.value.emit('game:start', { mode, difficulty })
    }
  }

  /**
   * Emit game end event
   */
  const emitGameEnd = (data: {
    mode: string
    difficulty: string
    score: number
    questions: number
    correctAnswers: number
    timeTaken: number
  }) => {
    if (socket.value && connected.value) {
      socket.value.emit('game:end', data)
    }
  }

  /**
   * Subscribe to user status updates
   */
  const onUserStatus = (callback: (data: { userId: string; online: boolean }) => void) => {
    if (socket.value) {
      socket.value.on('user:status', callback)
    }
  }

  return {
    socket, // Remove readonly() - socket needs to be mutable for emit/on/off
    connected: readonly(connected),
    liveLeaderboard: readonly(liveLeaderboard),
    liveStats: readonly(liveStats),
    connect,
    disconnect,
    emitGameStart,
    emitGameEnd,
    onUserStatus,
  }
}
