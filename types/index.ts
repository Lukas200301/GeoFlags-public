/**
 * User role types
 * SECURITY: Role is always verified server-side before granting access
 */
export type UserRole = 'USER' | 'ADMIN'

/**
 * User interface
 */
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  avatarUrl?: string
  role: UserRole
  emailVerified?: boolean
  status?: 'ACTIVE' | 'BANNED' | 'SUSPENDED'
  bannedUntil?: string
  banReason?: string
  lastActive?: string
  createdAt: string
  updatedAt: string
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  user: User
  message?: string
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  emailOrUsername: string
  password: string
}

/**
 * Registration data
 */
export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

/**
 * Game mode types
 */
export type GameMode = 'flags' | 'capitals' | 'maps' | 'mixed' | 'guess-the-flag'

/**
 * Game difficulty
 */
export type GameDifficulty = 'easy' | 'medium' | 'hard'

/**
 * Game mode configuration
 */
export interface GameModeConfig {
  id: GameMode
  name: string
  description: string
  icon: string
  enabled: boolean
}

/**
 * Game session
 */
export interface GameSession {
  id: string
  mode: GameMode
  difficulty: GameDifficulty
  userId: string
  score: number
  questions: number
  correctAnswers: number
  startedAt: string
  completedAt?: string
}

/**
 * Score submission
 */
export interface ScoreSubmission {
  mode: GameMode
  difficulty: GameDifficulty
  score: number
  questions: number
  correctAnswers: number
  timeTaken: number
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  id: string
  user: {
    id: string
    username: string
    avatarUrl?: string
  }
  mode: GameMode
  difficulty: GameDifficulty
  score: number
  rank: number
  createdAt: string
}

/**
 * Leaderboard filters
 */
export interface LeaderboardFilters {
  mode?: GameMode
  difficulty?: GameDifficulty
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time'
  limit?: number
}

/**
 * Admin statistics
 */
export interface AdminStats {
  totalUsers: number
  totalGames: number
  activeUsers: number
  averageScore: number
  topMode: GameMode
}

/**
 * Admin user management
 */
export interface AdminUser extends User {
  avatarUrl?: string
  gamesPlayed: number
  totalScore: number
  lastLogin?: string
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED'
}

/**
 * API Error response
 */
export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

/**
 * CSRF Token response
 */
export interface CsrfTokenResponse {
  csrfToken: string
}

/**
 * Socket.io events
 */
export interface SocketEvents {
  // Client to server
  'user:online': (userId: string) => void
  'game:start': (data: { mode: GameMode; difficulty: GameDifficulty }) => void
  'game:end': (data: ScoreSubmission) => void

  // Server to client
  'leaderboard:update': (data: LeaderboardEntry[]) => void
  'stats:update': (data: AdminStats) => void
  'user:status': (data: { userId: string; online: boolean }) => void
}

/**
 * User profile statistics
 */
export interface UserStats {
  totalGames: number
  totalScore: number
  averageScore: number
  highScores: Record<string, number>
  gamesPerMode: Record<string, number>
  averageScoresByMode: Record<string, number>
  performanceOverTime: Array<{
    date: string
    averageScore: number
    gamesPlayed: number
  }>
  recentGames: Array<{
    gameNumber: number
    score: number
    mode: string
    date: string
  }>
  activityByDayOfWeek: Array<{
    day: string
    gamesPlayed: number
    averageScore: number
  }>
  averageAccuracy: number | null
  currentStreak: number
  longestStreak: number
  favorites: {
    count: number
  }
  learnMode: {
    countriesViewed: number
    totalViews: number
    masterred: number
  }
}

/**
 * Favorite country
 */
export interface FavoriteCountry {
  id: string
  countryCode: string
  countryName: string
  addedAt: string
}

/**
 * Country progress
 */
export interface CountryProgress {
  id: string
  countryCode: string
  viewCount: number
  lastViewed: string
  mastered: boolean
}

/**
 * Guess the Flag game types
 */
export interface GuessTheFlagOption {
  id: string
  name: string
}

export interface GuessTheFlagGameState {
  sessionId: string
  flagToken: string
  flagImage: string
  options: GuessTheFlagOption[]
  score: number
  totalCountries?: number
}

export interface GuessTheFlagAnswerResponse {
  correct: boolean
  gameOver: boolean
  finalScore?: number
  correctAnswer?: string
  correctAnswerName?: string
  perfectGame?: boolean
  message?: string
  score?: number
  nextFlag?: {
    flagToken: string
    flagImage: string
    options: GuessTheFlagOption[]
  }
  progress?: {
    current: number
    total: number
  }
}
