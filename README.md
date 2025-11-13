<div align="center">

# 🌍 GeoFlags Frontend

**An immersive, interactive geography quiz platform**

Test your knowledge of world flags, capitals, countries, and geography through engaging game modes and compete with players worldwide!

[![Built with Nuxt](https://img.shields.io/badge/Nuxt-3.15.0-00DC82?style=flat&logo=nuxt.js)](https://nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.15-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Game Modes](#-game-modes) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🎮 **Multiple Game Modes**
- **🚩 Guess the Flag** - Identify countries by their national flags
- **🏙️ Find the Capital** - Match countries with their capital cities
- **📊 Higher or Lower** - Guess country statistics (population, area, GDP)
- **⏱️ Time Trial** - Race against the clock in fast-paced challenges
- **🎯 Solo Challenges** - Practice modes for skill improvement
- **⚔️ Battle Mode** - Real-time PvP geography duels
- **📖 Learn Mode** - Explore detailed country information with interactive maps

### 🌐 **Interactive Visualizations**
- **3D Globe** - Beautiful interactive globe using Globe.gl and Three.js
- **Country Maps** - Detailed maps powered by MapLibre GL
- **Statistics Charts** - Visual analytics with Chart.js
- **Country Details** - Comprehensive data from REST Countries API

### 🏆 **Competitive Features**
- **Global Leaderboards** - Compete with players worldwide in each game mode
- **Real-time Updates** - Live leaderboard changes via Socket.io
- **Friends System** - Add friends and track their progress
- **User Profiles** - Detailed statistics, achievements, and game history
- **Battle System** - Challenge friends in head-to-head matches

### 👥 **Social & Community**
- **Friends Management** - Add, remove, and view friend profiles
- **Battle Invitations** - Challenge friends or random opponents
- **Live Battles** - Real-time multiplayer with instant feedback
- **Leaderboard Rankings** - See where you stand globally

### 🔐 **Security & Authentication**
- **JWT Authentication** - Secure token-based auth with HttpOnly cookies
- **CSRF Protection** - All mutating requests protected with CSRF tokens
- **Role-based Access** - User and Admin roles with middleware protection
- **Re-authentication** - Sensitive operations require password confirmation
- **Secure Headers** - XSS, clickjacking, and MIME-type sniffing protection

### 👨‍💼 **Admin Panel**
- **Dashboard** - Real-time statistics and platform analytics
- **User Management** - View, edit, suspend, and manage users
- **Game Configuration** - Enable/disable game modes and adjust settings
- **Leaderboard Control** - Manage leaderboard entries and detect anomalies
- **Audit Logs** - Track all administrative actions

### 🎨 **Modern UI/UX**
- **Responsive Design** - Seamless experience on desktop, tablet, and mobile
- **Dark Mode** - Eye-friendly dark theme (coming soon)
- **Smooth Animations** - Page transitions powered by @vueuse/motion
- **Modern Icons** - Beautiful icons from Material Design Icons
- **Accessible** - WCAG compliant design patterns

---

## 🛠️ Tech Stack

### **Core Framework**
- **[Nuxt 3](https://nuxt.com)** - Vue.js meta-framework with SSR/SSG
- **[Vue 3](https://vuejs.org)** - Progressive JavaScript framework
- **[TypeScript](https://www.typescriptlang.org)** - Typed superset of JavaScript

### **Styling & UI**
- **[Tailwind CSS 3](https://tailwindcss.com)** - Utility-first CSS framework
- **[@nuxt/icon](https://nuxt.com/modules/icon)** - Icon management with 200k+ icons
- **[@vueuse/motion](https://motion.vueuse.org)** - Smooth animations and transitions

### **Data Visualization**
- **[Globe.gl](https://globe.gl)** - Interactive 3D globe with Three.js
- **[MapLibre GL](https://maplibre.org)** - Open-source maps library
- **[Chart.js 4](https://www.chartjs.org)** - Flexible charting library
- **[Three.js](https://threejs.org)** - 3D graphics library

### **Real-time & State**
- **[Socket.io Client](https://socket.io)** - Real-time bidirectional communication
- **[@vueuse/core](https://vueuse.org)** - Essential Vue composition utilities
- **Nuxt State** - Built-in reactive state management

### **Data Sources**
- **[World Countries](https://www.npmjs.com/package/world-countries)** - Comprehensive country data
- **REST Countries API** - Additional country information and flags

### **Development Tools**
- **ESLint** - JavaScript/TypeScript linter
- **Prettier** - Opinionated code formatter
- **Vue TSC** - TypeScript type checking for Vue

---

## 🎮 Game Modes

### 🚩 Guess the Flag
Test your knowledge of world flags! Each round shows you a flag, and you must identify which country it belongs to.

**Features:**
- Multiple difficulty levels
- Timed or untimed modes
- Streak tracking
- Detailed feedback with country information

### 🏙️ Find the Capital
Match countries with their capital cities in this educational and challenging game mode.

**Features:**
- World coverage with 190+ countries
- Progressive difficulty
- Learn mode with hints
- Geography insights for each answer

### 📊 Higher or Lower
Guess whether a country has a higher or lower value for various statistics like population, area, or GDP.

**Features:**
- Multiple stat categories
- Educational facts
- Streak-based scoring
- Compare countries side-by-side

### ⏱️ Time Trial
Race against the clock to answer as many questions as possible before time runs out!

**Features:**
- Rapid-fire questions
- Bonus points for speed
- Global time-based leaderboard
- Various time limits (30s, 60s, 120s)

### 🎯 Solo Challenges
Practice mode for learning and improving your geography skills without the pressure of competition.

**Features:**
- No time limits
- Detailed explanations
- Progress tracking
- Unlimited retries

### ⚔️ Battle Mode
Challenge other players in real-time head-to-head geography battles!

**Features:**
- Real-time multiplayer
- Friend or random matchmaking
- Live scoring
- Best of 3/5/7 rounds
- Battle history and statistics

### 📖 Learn Mode
Explore the world through an educational lens with detailed country profiles and interactive maps.

**Features:**
- 250+ country profiles
- Interactive 3D globe
- Detailed statistics (population, area, languages, currencies)
- Maps and geographic information
- Neighboring countries
- Historical facts and trivia

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - v24.11.1 or higher ([Download](https://nodejs.org))
- **npm** or **yarn** - Package manager
- **Git** - Version control

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Lukas200301/GeoFlags.git
cd GeoFlags
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Backend API URL
NUXT_PUBLIC_API_BASE=http://localhost:3001

# WebSocket URL for real-time features
NUXT_PUBLIC_WS_URL=http://localhost:3001
```

4. **Start the development server**

```bash
# Frontend only
npm run dev

# Frontend + Backend concurrently
npm run dev:all
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### 📋 Detailed Setup Guide

For comprehensive setup instructions including backend configuration, database setup, and troubleshooting, see **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)**.

---

## 📁 Project Structure

```
geoflags/
├── assets/                  # Static assets
│   ├── css/                 # Global styles
│   │   └── main.css         # Tailwind imports & custom CSS
│   ├── images/              # Image assets
│   └── fonts/               # Custom fonts
├── backend/                 # Backend API (separate README)
├── components/              # Vue components
│   ├── GameCard.vue         # Game mode card component
│   ├── GameHeader.vue       # In-game header with progress
│   ├── ScoreDisplay.vue     # Score display component
│   ├── InteractiveGlobe.vue # 3D globe component
│   ├── CountryModal.vue     # Country detail modal
│   ├── AdminTable.vue       # Reusable admin table
│   ├── admin/               # Admin-specific components
│   └── charts/              # Chart components
├── composables/             # Vue composables (hooks)
│   ├── useAuth.ts           # Authentication logic
│   ├── useApi.ts            # API client wrapper
│   ├── useSocket.ts         # Socket.io client
│   ├── useCountries.ts      # Country data management
│   ├── useAdmin.ts          # Admin operations
│   ├── useToast.ts          # Toast notifications
│   └── useSystemSettings.ts # App-wide settings
├── layouts/                 # Nuxt layouts
│   ├── default.vue          # Main layout with navigation
│   └── auth.vue             # Authentication pages layout
├── middleware/              # Route middleware
│   ├── auth.ts              # Authentication check
│   ├── admin.ts             # Admin role verification
│   └── guest.ts             # Guest-only routes
├── pages/                   # File-based routing
│   ├── index.vue            # Landing page
│   ├── about.vue            # About page
│   ├── leaderboard.vue      # Global leaderboard
│   ├── auth/                # Authentication pages
│   │   ├── login.vue        # Login page
│   │   └── register.vue     # Registration page
│   ├── play/                # Game modes
│   │   ├── index.vue        # Game mode selection
│   │   ├── guess-the-flag/  # Flag quiz
│   │   ├── find-capital/    # Capital quiz
│   │   ├── higher-lower/    # Higher/lower game
│   │   ├── time-trial/      # Time-based challenges
│   │   └── solo/            # Practice mode
│   ├── battles/             # PvP battle system
│   │   ├── index.vue        # Battle lobby
│   │   └── [id].vue         # Active battle room
│   ├── friends/             # Friends management
│   │   └── index.vue        # Friends list
│   ├── learn/               # Educational content
│   │   ├── index.vue        # Country explorer
│   │   └── country/[id].vue # Country details
│   ├── profile/             # User profiles
│   │   └── [id].vue         # User profile page
│   ├── admin/               # Admin panel
│   │   ├── index.vue        # Dashboard
│   │   ├── users.vue        # User management
│   │   ├── game-modes.vue   # Game configuration
│   │   ├── leaderboard.vue  # Leaderboard management
│   │   └── stats.vue        # Analytics
│   └── legal/               # Legal pages
│       ├── privacy.vue      # Privacy policy
│       └── terms.vue        # Terms of service
├── plugins/                 # Nuxt plugins
│   └── socket.client.ts     # Socket.io initialization
├── public/                  # Public static files
│   ├── favicon.png          # Favicon
│   └── images/              # Public images
├── server/                  # Server-side code (API routes)
├── types/                   # TypeScript type definitions
│   └── index.ts             # Global types
├── .env.example             # Environment variables template
├── app.vue                  # Root Vue component
├── error.vue                # Error page component
├── nuxt.config.ts           # Nuxt configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

---

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Start both frontend and backend concurrently
npm run dev:all

# Build for production
npm run build

# Preview production build locally
npm run preview

# Preview both frontend and backend
npm run preview:all

# Generate static site (SSG)
npm run generate

# Code quality
npm run lint              # Lint code with ESLint
npm run lint:fix          # Auto-fix linting issues
npm run format            # Format code with Prettier
```

### Code Quality

This project maintains high code quality standards:

- **ESLint** - Enforces consistent code patterns and catches errors
- **Prettier** - Ensures consistent code formatting
- **TypeScript Strict Mode** - Type safety throughout the application
- **Vue TSC** - Type checking for Vue components

**Pre-commit checklist:**
```bash
npm run lint:fix    # Fix linting issues
npm run format      # Format all files
npm run build       # Ensure production build works
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the project structure

3. **Test thoroughly** in development mode

4. **Lint and format**
   ```bash
   npm run lint:fix
   npm run format
   ```

5. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add new game mode"
   ```

6. **Push and create a pull request**

---

## 🔐 Security

GeoFlags implements comprehensive security measures including JWT authentication, CSRF protection, role-based access control, and more.

**📖 For detailed security documentation, see [SECURITY.md](./SECURITY.md)**

Key security features:
- ✅ HttpOnly Secure cookies for session management
- ✅ CSRF protection for all mutating requests
- ✅ Role-based access control with server-side verification
- ✅ Type-safe API with TypeScript
- ✅ XSS protection and secure headers

---

## 🌐 Backend Integration

This frontend requires the GeoFlags backend API. See the [Backend README](./backend/README.md) for setup instructions.

### Required Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Logout and clear cookies
- `GET /api/auth/me` - Get current user session
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/csrf-token` - Get CSRF token

**Game:**
- `GET /api/game/modes` - Get available game modes
- `POST /api/game/submit` - Submit game score
- `GET /api/game/history` - Get user game history
- `GET /api/game/stats` - Get user statistics

**Leaderboard:**
- `GET /api/game/leaderboard?mode=FLAGS` - Get leaderboard for mode

**Admin:**
- `GET /api/admin/users` - User management
- `GET /api/admin/stats` - Platform statistics
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

**Battles:**
- `POST /api/battles/create` - Create new battle
- `POST /api/battles/:id/join` - Join battle
- `GET /api/battles/:id` - Get battle details

### Socket.io Events

**Client → Server:**
- `game:join` - Join game mode room
- `game:leave` - Leave game mode room
- `battle:join` - Join battle room
- `battle:answer` - Submit battle answer

**Server → Client:**
- `leaderboard:update` - Leaderboard updated
- `battle:start` - Battle started
- `battle:question` - New battle question
- `battle:result` - Battle round result
- `battle:end` - Battle finished

---

## 📦 Deployment

### Production Build

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The build output will be in `.output/` directory.

### Environment Variables

Set these environment variables in your hosting platform:

```env
# Production API URLs
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com
NUXT_PUBLIC_WS_URL=https://api.yourdomain.com

# Optional: Enable production optimizations
NODE_ENV=production
```

### Deployment Platforms

This Nuxt 3 application can be deployed to various platforms:

#### **Vercel** (Recommended)
```bash
npm i -g vercel
vercel --prod
```

#### **Netlify**
```bash
npm run build
# Deploy .output/public directory
```

#### **Cloudflare Pages**
```bash
npm run build
# Deploy with Cloudflare Pages
```

#### **Node.js Server**
```bash
# Build
npm run build

# Start with PM2
pm2 start .output/server/index.mjs --name geoflags-frontend

# Or with Node.js directly
node .output/server/index.mjs
```

### Performance Optimization

- **SSR** - Server-side rendering for better SEO and initial load
- **Code Splitting** - Automatic route-based code splitting
- **Image Optimization** - Use Nuxt Image for optimized images
- **Lazy Loading** - Components and routes loaded on demand
- **Caching** - Static assets cached with long TTL

---

## 📚 Documentation

### Key Composables

#### `useAuth()`
Handles authentication state and operations.

```typescript
const { user, isAuthenticated, login, logout, register } = useAuth()

await login({ username: 'testuser', password: 'password' })
```

#### `useApi()`
Provides typed API client with automatic CSRF protection.

```typescript
const { submitScore, getLeaderboard } = useApi()

await submitScore({ mode: 'FLAGS', score: 1500 })
const leaderboard = await getLeaderboard('FLAGS')
```

#### `useSocket()`
Manages Socket.io connection and events.

```typescript
const { socket, connected, joinGame, leaveGame } = useSocket()

joinGame('FLAGS')
socket.on('leaderboard:update', (data) => {
  console.log('Leaderboard updated:', data)
})
```

#### `useCountries()`
Access country data and utilities.

```typescript
const { countries, getCountryByCode, searchCountries } = useCountries()

const usa = getCountryByCode('US')
const results = searchCountries('united')
```

### Adding New Game Modes

1. Create a new directory in `pages/play/`
2. Add game logic composable in `composables/`
3. Create game component
4. Register in backend game modes
5. Update navigation

---

## 🤝 Contributing

We welcome contributions from the community!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** with clear commit messages
4. **Write/update tests** if applicable
5. **Ensure code quality**
   ```bash
   npm run lint:fix
   npm run format
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request** with a clear description

### Contribution Guidelines

- Follow existing code style and patterns
- Write meaningful commit messages
- Update documentation for new features
- Test thoroughly before submitting
- Be respectful and constructive in discussions

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Country Data** - [World Countries](https://www.npmjs.com/package/world-countries) & [REST Countries API](https://restcountries.com)
- **Flag Images** - Various open-source flag repositories
- **Icons** - [Material Design Icons](https://pictogrammers.com/library/mdi/)
- **Maps** - [MapLibre GL](https://maplibre.org)
- **3D Globe** - [Globe.gl](https://globe.gl)
- **Framework** - [Nuxt 3](https://nuxt.com)
- **Styling** - [Tailwind CSS](https://tailwindcss.com)

---

## 💬 Support

Need help? Found a bug? Have a feature request?

- **Issues** - [Open an issue](https://github.com/Lukas200301/GeoFlags/issues)
- **Discussions** - [Join discussions](https://github.com/Lukas200301/GeoFlags/discussions)
- **Documentation** - Check the [Nuxt Documentation](https://nuxt.com/docs)

---

<div align="center">

**Made with ❤️ for geography enthusiasts worldwide 🌍**

[⬆ Back to Top](#-geoflags-frontend)

</div>
