<div align="center">

# 🔐 GeoFlags Backend

**Secure, scalable Node.js backend for the GeoFlags geography quiz platform**

Built with Express, TypeScript, PostgreSQL, Prisma ORM, and Socket.io for real-time features

[![Node.js](https://img.shields.io/badge/Node.js-24.11.1+-339933?style=flat&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=flat&logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.18.0-2D3748?style=flat&logo=prisma)](https://www.prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Security](#-security-features)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Security Features](#-security-features)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Socket.io Events](#-socketio-events)
- [Development](#-development)
- [Production Deployment](#-production-deployment)
- [Testing](#-testing)

---

## ✨ Features

### 🔐 **Authentication & Security**
- **JWT-based Authentication** - Access tokens (15 min) + refresh tokens (7 days)
- **HttpOnly Secure Cookies** - No token exposure in localStorage
- **CSRF Protection** - Token validation for all mutating requests
- **Token Versioning** - Global token invalidation capability
- **bcrypt Password Hashing** - Industry-standard password security (10 rounds)
- **Re-authentication Flow** - Sensitive operations require password confirmation

### 🎮 **Game Management**
- **Multiple Game Modes** - FLAGS, CAPITALS, MAPS, MIXED
- **Score Submission** - Validated game session recording
- **Game History** - Track all user game sessions with pagination
- **User Statistics** - Comprehensive stats per user and game mode
- **Game Mode Configuration** - Enable/disable modes dynamically

### 🏆 **Leaderboard System**
- **Global Leaderboards** - Per game mode rankings
- **Real-time Updates** - Socket.io broadcasts for live leaderboard changes
- **High Score Tracking** - Automatic best score per user per mode
- **Pagination Support** - Efficient large dataset handling
- **Rank Calculation** - Automatic ranking on score submission

### 👨‍💼 **Admin Panel**
- **User Management** - View, suspend, promote, delete users
- **Role-Based Access Control** - USER and ADMIN roles
- **Game Mode Management** - Configure and toggle game modes
- **Leaderboard Control** - Admin leaderboard management
- **Platform Statistics** - User counts, game sessions, averages
- **Audit Logging** - Complete admin action trail with IP tracking

### 🔄 **Real-time Features**
- **Socket.io Integration** - Bidirectional real-time communication
- **Live Leaderboard Updates** - Instant leaderboard refreshes
- **Battle System** - Real-time PvP gameplay support
- **Admin Notifications** - Live admin event broadcasting
- **Connection Management** - Automatic reconnection handling

### 🛡️ **API Protection**
- **Rate Limiting** - Different limits for auth, admin, and API routes
- **Helmet.js Security Headers** - XSS, clickjacking, MIME-sniffing protection
- **CORS Configuration** - Credential-enabled cross-origin requests
- **Input Validation** - Zod schemas for all request bodies
- **SQL Injection Prevention** - Parameterized queries via Prisma

---

## 🛠️ Tech Stack

### **Core Technologies**
- **[Node.js](https://nodejs.org)** (v24.11.1+) - JavaScript runtime
- **[Express.js](https://expressjs.com)** (v4.21.2) - Fast, minimalist web framework
- **[TypeScript](https://www.typescriptlang.org)** (v5.7) - Type-safe JavaScript

### **Database & ORM**
- **[PostgreSQL](https://www.postgresql.org)** (v14+) - Robust relational database
- **[Prisma ORM](https://www.prisma.io)** (v6.18.0) - Next-generation Node.js ORM
- **Prisma Migrate** - Version-controlled database migrations
- **Prisma Studio** - Visual database browser

### **Authentication & Security**
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - JWT implementation
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Password hashing
- **[helmet](https://helmetjs.github.io)** - Security headers middleware
- **[csurf](https://www.npmjs.com/package/csurf)** - CSRF protection
- **[express-rate-limit](https://www.npmjs.com/package/express-rate-limit)** - Rate limiting middleware
- **[cors](https://www.npmjs.com/package/cors)** - CORS middleware
- **[cookie-parser](https://www.npmjs.com/package/cookie-parser)** - Cookie parsing

### **Real-time & Data**
- **[Socket.io](https://socket.io)** (v4.8.1) - Real-time bidirectional communication
- **[world-countries](https://www.npmjs.com/package/world-countries)** - Comprehensive country dataset
- **[zod](https://zod.dev)** - TypeScript-first schema validation

### **Development Tools**
- **[tsx](https://www.npmjs.com/package/tsx)** - TypeScript execution with hot reload
- **[ESLint](https://eslint.org)** - Code linting
- **[Prettier](https://prettier.io)** - Code formatting
- **[dotenv](https://www.npmjs.com/package/dotenv)** - Environment variable management

---

## 🔒 Security Features

### **Authentication Architecture**

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │◄────────┤   Backend   │────────►│  PostgreSQL │
│  (Browser)  │         │   (Node.js) │         │  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
       │                        │
       │  1. POST /api/auth/login
       ├───────────────────────►│
       │                        │ 2. Verify credentials
       │                        │ 3. Generate JWT tokens
       │                        │
       │  4. Set HttpOnly cookies
       │◄───────────────────────┤
       │     (access + refresh)
       │                        │
       │  5. Authenticated requests
       │     (cookies auto-sent)
       ├───────────────────────►│
       │                        │
```

### **Token Management**
| Token Type | Lifespan | Storage | Purpose |
|------------|----------|---------|---------|
| Access Token | 15 minutes | HttpOnly Cookie | API authentication |
| Refresh Token | 7 days | HttpOnly Cookie | Access token renewal |
| CSRF Token | Session | Client memory | Mutation protection |
| Re-auth Token | 5 minutes | Client memory | Sensitive operations |

### **Authorization Levels**
- **Public Routes** - No authentication required (health, CSRF token)
- **User Routes** - Require valid JWT (game submission, profile)
- **Admin Routes** - Require JWT + ADMIN role (user management, stats)
- **Sensitive Admin Actions** - Require JWT + ADMIN + re-authentication token

### **Protection Mechanisms**
- **Rate Limiting**:
  - Authentication endpoints: 5 requests / 15 minutes
  - Admin endpoints: 100 requests / 15 minutes
  - General API: 200 requests / 15 minutes
- **Input Validation**: Zod schemas validate all request bodies
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Helmet security headers + Content Security Policy
- **CSRF Protection**: Token validation on POST/PUT/DELETE/PATCH
- **Password Security**: bcrypt hashing with 10 rounds

### **Audit Trail**
All admin actions are logged with:
- Admin user ID and details
- Action type (e.g., USER_DELETE, ROLE_CHANGE)
- Target user/resource ID
- IP address
- Timestamp
- Additional metadata

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** - v24.11.1 or higher ([Download](https://nodejs.org))
- **PostgreSQL** - v14.0 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** - Package manager
- **Git** - Version control

### Installation

1. **Clone the repository and navigate to backend**

```bash
git clone https://github.com/Lukas200301/GeoFlags.git
cd GeoFlags/backend
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/geoflags"

# JWT Secrets (MUST BE CHANGED IN PRODUCTION!)
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars-change-this-in-production"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Admin User (Created on first seed)
ADMIN_EMAIL=admin@geoflags.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!
```

4. **Set up PostgreSQL database**

Create a new database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE geoflags;
\q

# Or using pgAdmin or your preferred tool
```

5. **Run database migrations**

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

6. **Start the development server**

```bash
npm run dev
```

The server will start on **http://localhost:3001**

### Verify Installation

Test the API is running:

```bash
# Health check
curl http://localhost:3001/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 📋 Detailed Setup Guide

For comprehensive setup instructions including production deployment, environment configuration, and troubleshooting, see **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)**.

---

## 📡 API Documentation

### Base URL

```
http://localhost:3001/api
```

All endpoints return JSON responses. Authenticated endpoints require cookies set by `/auth/login`.

---

### 🔐 Authentication Endpoints

#### **POST** `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation:**
- `username`: 3-30 characters, alphanumeric + underscores
- `email`: Valid email format
- `password`: 8-100 characters

**Response:** `201 Created`
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-01-15T12:00:00.000Z"
  }
}
```

**Cookies Set:**
- `accessToken` - HttpOnly, Secure, 15min
- `refreshToken` - HttpOnly, Secure, 7 days

---

#### **POST** `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-01-15T12:00:00.000Z"
  }
}
```

**Cookies Set:**
- `accessToken` - HttpOnly, Secure, 15min
- `refreshToken` - HttpOnly, Secure, 7 days

**Rate Limit:** 5 requests per 15 minutes per IP

---

#### **POST** `/api/auth/refresh`
Refresh access token using refresh token.

**Authentication:** Requires `refreshToken` cookie

**Response:** `200 OK`
```json
{
  "message": "Token refreshed successfully"
}
```

**Cookies Updated:**
- `accessToken` - New access token

---

#### **POST** `/api/auth/logout`
Logout and clear authentication cookies.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `accessToken`
- `refreshToken`

---

#### **GET** `/api/auth/me`
Get current authenticated user information.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-01-15T12:00:00.000Z"
  }
}
```

---

#### **POST** `/api/auth/re-auth`
Generate short-lived re-authentication token for sensitive operations.

**Authentication:** Required

**Request Body:**
```json
{
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Re-authentication successful",
  "reAuthToken": "temp-token-here",
  "expiresIn": 300
}
```

**Token Lifespan:** 5 minutes

---

### 🎮 Game Endpoints

#### **GET** `/api/game/modes`
Get all enabled game modes.

**Authentication:** Not required

**Response:** `200 OK`
```json
{
  "modes": [
    {
      "id": "FLAGS",
      "name": "Flags Quiz",
      "description": "Identify countries by their flags",
      "enabled": true
    },
    {
      "id": "CAPITALS",
      "name": "Capitals Quiz",
      "description": "Match countries with their capital cities",
      "enabled": true
    }
  ]
}
```

---

#### **GET** `/api/game/leaderboard?mode=FLAGS&limit=100`
Get leaderboard for a specific game mode.

**Authentication:** Not required

**Query Parameters:**
- `mode` (required): `FLAGS` | `CAPITALS` | `MAPS` | `MIXED`
- `limit` (optional): Number of entries (default: 100, max: 500)

**Response:** `200 OK`
```json
{
  "leaderboard": [
    {
      "id": "uuid-here",
      "userId": "user-uuid",
      "mode": "FLAGS",
      "score": 15000,
      "createdAt": "2025-01-15T12:00:00.000Z",
      "user": {
        "username": "player1",
        "id": "user-uuid"
      },
      "rank": 1
    }
  ],
  "total": 1234
}
```

---

#### **POST** `/api/game/submit`
Submit a game score.

**Authentication:** Required

**Request Body:**
```json
{
  "mode": "FLAGS",
  "score": 1500,
  "data": {
    "difficulty": "medium",
    "correct": 15,
    "total": 20,
    "timeSpent": 120
  }
}
```

**Headers:**
- `x-csrf-token`: CSRF token (get from `/api/csrf-token`)

**Response:** `201 Created`
```json
{
  "message": "Score submitted successfully",
  "session": {
    "id": "session-uuid",
    "userId": "user-uuid",
    "mode": "FLAGS",
    "score": 1500,
    "data": {...},
    "createdAt": "2025-01-15T12:00:00.000Z"
  },
  "isNewHighScore": true,
  "rank": 42,
  "leaderboardEntry": {
    "id": "lb-uuid",
    "userId": "user-uuid",
    "mode": "FLAGS",
    "score": 1500,
    "createdAt": "2025-01-15T12:00:00.000Z"
  }
}
```

---

#### **GET** `/api/game/history?mode=FLAGS&page=1&limit=20`
Get user's game history.

**Authentication:** Required

**Query Parameters:**
- `mode` (optional): Filter by game mode
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "mode": "FLAGS",
      "score": 1500,
      "data": {...},
      "createdAt": "2025-01-15T12:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
```

---

#### **GET** `/api/game/stats`
Get user's game statistics.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "stats": {
    "totalGames": 100,
    "totalScore": 125000,
    "averageScore": 1250,
    "highScores": {
      "FLAGS": 2000,
      "CAPITALS": 1800,
      "MAPS": 1600,
      "MIXED": 1900
    },
    "gamesByMode": {
      "FLAGS": 30,
      "CAPITALS": 25,
      "MAPS": 20,
      "MIXED": 25
    }
  }
}
```

---

### 👨‍💼 Admin Endpoints

All admin endpoints require authentication + `ADMIN` role.

**Rate Limit:** 100 requests per 15 minutes

---

#### **GET** `/api/admin/users?page=1&limit=20&search=query`
Get all users with pagination and search.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by username or email

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "uuid-here",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "USER",
      "tokenVersion": 1,
      "createdAt": "2025-01-15T12:00:00.000Z",
      "_count": {
        "gameSessions": 50,
        "leaderboardEntries": 4
      }
    }
  ],
  "total": 1234,
  "page": 1,
  "totalPages": 62
}
```

---

#### **GET** `/api/admin/users/:id`
Get detailed information about a single user.

**Authentication:** Required (Admin only)

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-01-15T12:00:00.000Z",
    "gameSessions": [...],
    "leaderboardEntries": [...]
  }
}
```

---

#### **PUT** `/api/admin/users/:id/role`
Change a user's role.

**Authentication:** Required (Admin only + Re-auth token)

**Headers:**
- `x-csrf-token`: CSRF token
- `x-reauth-token`: Re-authentication token

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:** `200 OK`
```json
{
  "message": "User role updated successfully",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "role": "ADMIN"
  }
}
```

**Audit Log:** `ROLE_CHANGE` action logged

---

#### **DELETE** `/api/admin/users/:id`
Delete a user account.

**Authentication:** Required (Admin only + Re-auth token)

**Headers:**
- `x-csrf-token`: CSRF token
- `x-reauth-token`: Re-authentication token

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

**Audit Log:** `USER_DELETE` action logged

**Note:** Cannot delete yourself or other admins without elevated permissions

---

#### **GET** `/api/admin/game-modes`
Get all game modes (including disabled).

**Authentication:** Required (Admin only)

**Response:** `200 OK`
```json
{
  "modes": [
    {
      "id": "FLAGS",
      "name": "Flags Quiz",
      "description": "Identify countries by their flags",
      "enabled": true
    },
    {
      "id": "CAPITALS",
      "name": "Capitals Quiz",
      "description": "Match countries with capitals",
      "enabled": false
    }
  ]
}
```

---

#### **PUT** `/api/admin/game-modes/:id`
Update game mode settings.

**Authentication:** Required (Admin only)

**Headers:**
- `x-csrf-token`: CSRF token

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "enabled": false
}
```

**Response:** `200 OK`
```json
{
  "message": "Game mode updated successfully",
  "mode": {
    "id": "FLAGS",
    "name": "Updated Name",
    "description": "Updated description",
    "enabled": false
  }
}
```

**Audit Log:** `GAME_MODE_UPDATE` action logged

---

#### **GET** `/api/admin/leaderboard?mode=FLAGS&page=1&limit=50`
Get leaderboard with admin controls.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `mode` (required): Game mode
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 500)

**Response:** `200 OK`
```json
{
  "leaderboard": [...],
  "total": 1234,
  "page": 1,
  "totalPages": 25
}
```

---

#### **DELETE** `/api/admin/leaderboard/:id`
Delete a leaderboard entry.

**Authentication:** Required (Admin only + Re-auth token)

**Headers:**
- `x-csrf-token`: CSRF token
- `x-reauth-token`: Re-authentication token

**Response:** `200 OK`
```json
{
  "message": "Leaderboard entry deleted successfully"
}
```

**Audit Log:** `LEADERBOARD_DELETE` action logged

---

#### **GET** `/api/admin/stats`
Get platform-wide statistics.

**Authentication:** Required (Admin only)

**Response:** `200 OK`
```json
{
  "stats": {
    "totalUsers": 1234,
    "totalGameSessions": 50000,
    "totalLeaderboardEntries": 4567,
    "adminUsers": 5,
    "averageScorePerMode": {
      "FLAGS": 1250,
      "CAPITALS": 1180,
      "MAPS": 1100,
      "MIXED": 1350
    },
    "gamesPerMode": {
      "FLAGS": 15000,
      "CAPITALS": 12000,
      "MAPS": 10000,
      "MIXED": 13000
    }
  }
}
```

---

#### **GET** `/api/admin/audit-logs?page=1&limit=50`
Get audit logs of admin actions.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 200)

**Response:** `200 OK`
```json
{
  "logs": [
    {
      "id": "log-uuid",
      "adminId": "admin-uuid",
      "action": "USER_DELETE",
      "targetId": "user-uuid",
      "details": {
        "username": "deleteduser",
        "reason": "Terms violation"
      },
      "ip": "192.168.1.1",
      "createdAt": "2025-01-15T12:00:00.000Z",
      "admin": {
        "username": "admin",
        "email": "admin@example.com"
      }
    }
  ],
  "total": 456,
  "page": 1,
  "totalPages": 10
}
```

---

### 🛠️ Utility Endpoints

#### **GET** `/api/csrf-token`
Get CSRF token for mutating requests.

**Authentication:** Not required

**Response:** `200 OK`
```json
{
  "csrfToken": "token-string-here"
}
```

**Usage:** Include token in `x-csrf-token` header for POST/PUT/DELETE/PATCH requests

---

#### **GET** `/api/health`
Health check endpoint.

**Authentication:** Not required

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

## 💾 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│      User       │          │  GameSession    │          │ LeaderboardEntry│
├─────────────────┤          ├─────────────────┤          ├─────────────────┤
│ id (PK)         │◄────────┤ userId (FK)     │          │ id (PK)         │
│ username        │          │ mode            │          │ userId (FK)     │◄───┐
│ email           │          │ score           │          │ mode            │    │
│ password_hash   │          │ data (JSON)     │          │ score           │    │
│ role            │          │ createdAt       │          │ createdAt       │    │
│ tokenVersion    │          └─────────────────┘          └─────────────────┘    │
│ createdAt       │                                       Unique(userId, mode)    │
└─────────────────┘                                                              │
        │                                                                         │
        └─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐          ┌─────────────────┐
│    GameMode     │          │   AdminAudit    │
├─────────────────┤          ├─────────────────┤
│ id (PK)         │          │ id (PK)         │
│ name            │          │ adminId (FK)    │────►User
│ description     │          │ action          │
│ enabled         │          │ targetId        │
└─────────────────┘          │ details (JSON)  │
                             │ ip              │
                             │ createdAt       │
                             └─────────────────┘
```

### Prisma Schema

```prisma
model User {
  id                  String               @id @default(uuid())
  username            String               @unique
  email               String               @unique
  password_hash       String
  role                Role                 @default(USER)
  tokenVersion        Int                  @default(0)
  createdAt           DateTime             @default(now())

  gameSessions        GameSession[]
  leaderboardEntries  LeaderboardEntry[]
  adminAudits         AdminAudit[]
}

enum Role {
  USER
  ADMIN
}

model GameSession {
  id        String   @id @default(uuid())
  userId    String
  mode      GameMode
  score     Int
  data      Json?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([mode])
  @@index([createdAt])
}

model LeaderboardEntry {
  id        String   @id @default(uuid())
  userId    String
  mode      GameMode
  score     Int
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, mode])
  @@index([mode, score])
}

enum GameMode {
  FLAGS
  CAPITALS
  MAPS
  MIXED
}

model GameModeConfig {
  id          GameMode @id
  name        String
  description String?
  enabled     Boolean  @default(true)
}

model AdminAudit {
  id        String   @id @default(uuid())
  adminId   String
  action    String
  targetId  String?
  details   Json?
  ip        String?
  createdAt DateTime @default(now())

  admin     User     @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([adminId])
  @@index([createdAt])
}
```

---

## 🔌 Socket.io Events

### Connection

Socket.io server runs on the same port as the HTTP server.

**Client Connection:**
```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-access-token'
  },
  withCredentials: true
})
```

**Authentication:** JWT token required for connection

---

### Client → Server Events

#### `game:join`
Join a game mode room to receive live updates.

**Payload:**
```javascript
socket.emit('game:join', 'FLAGS')
```

**Parameters:**
- `mode` (string): Game mode ID (`FLAGS`, `CAPITALS`, `MAPS`, `MIXED`)

---

#### `game:leave`
Leave a game mode room.

**Payload:**
```javascript
socket.emit('game:leave', 'FLAGS')
```

---

#### `score:submit`
Notify server of score submission (triggers leaderboard broadcast).

**Payload:**
```javascript
socket.emit('score:submit', {
  mode: 'FLAGS',
  score: 1500
})
```

---

#### `admin:action`
Notify other admins of an action (admin only).

**Payload:**
```javascript
socket.emit('admin:action', {
  action: 'USER_DELETE',
  details: {
    userId: 'user-uuid',
    username: 'deleteduser'
  }
})
```

---

### Server → Client Events

#### `leaderboard:update`
Receive updated leaderboard for joined game mode.

**Payload:**
```javascript
socket.on('leaderboard:update', (data) => {
  console.log('Updated leaderboard:', data)
  // {
  //   mode: 'FLAGS',
  //   leaderboard: [...]
  // }
})
```

---

#### `admin:update`
Receive admin action notifications (admin only).

**Payload:**
```javascript
socket.on('admin:update', (data) => {
  console.log('Admin action:', data)
  // {
  //   action: 'USER_DELETE',
  //   details: {...},
  //   timestamp: '2025-01-15T12:00:00.000Z'
  // }
})
```

---

#### `error`
Receive error messages.

**Payload:**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error)
  // {
  //   message: 'Error description',
  //   code: 'ERROR_CODE'
  // }
})
```

---

#### `connect`
Connection established.

```javascript
socket.on('connect', () => {
  console.log('Connected to server')
})
```

---

#### `disconnect`
Connection closed.

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason)
})
```

---

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Prisma commands
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio GUI
npm run prisma:seed       # Seed database with initial data
npm run prisma:seed-demo  # Seed with demo data

# Code quality
npm run lint              # Lint TypeScript code
npm run lint:fix          # Auto-fix linting issues
npm run format            # Format code with Prettier
```

### Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration history
├── src/
│   ├── index.ts               # App entry point
│   ├── server.ts              # Express server setup
│   ├── middleware/            # Custom middleware
│   │   ├── auth.ts            # Authentication middleware
│   │   ├── admin.ts           # Admin role middleware
│   │   ├── rateLimiter.ts     # Rate limiting
│   │   └── errorHandler.ts    # Error handling
│   ├── routes/                # API route handlers
│   │   ├── auth.ts            # Auth routes
│   │   ├── game.ts            # Game routes
│   │   └── admin.ts           # Admin routes
│   ├── services/              # Business logic
│   │   ├── auth.service.ts    # Auth service
│   │   ├── game.service.ts    # Game service
│   │   └── admin.service.ts   # Admin service
│   ├── utils/                 # Utility functions
│   │   ├── jwt.ts             # JWT helpers
│   │   ├── validation.ts      # Zod schemas
│   │   └── constants.ts       # Constants
│   ├── types/                 # TypeScript types
│   │   └── index.ts           # Type definitions
│   ├── socket/                # Socket.io handlers
│   │   └── handlers.ts        # Socket event handlers
│   ├── seed.ts                # Database seeding
│   └── seed-demo.ts           # Demo data seeding
├── .env.example               # Environment template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
```

Open http://localhost:5555 to view and edit database records.

---

## 🚀 Production Deployment

### Environment Configuration

**Production `.env` file:**

```env
# Database (use connection pooling for production)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=10"

# JWT Secrets (MUST BE STRONG & UNIQUE)
JWT_ACCESS_SECRET="<64-char-random-string>"
JWT_REFRESH_SECRET="<64-char-random-string>"

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Admin (change immediately after first login)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<secure-password>
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 64 chars, random)
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Use secure database connection (SSL mode)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS with specific origins
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Use environment variables (never hardcode secrets)
- [ ] Set secure cookie flags (`HttpOnly`, `Secure`, `SameSite`)
- [ ] Enable PostgreSQL connection pooling
- [ ] Configure firewall rules
- [ ] Set up reverse proxy (Nginx/Caddy)
- [ ] Enable database SSL/TLS

### Deployment Steps

1. **Build the application**

```bash
npm run build
```

2. **Set environment variables** on your hosting platform

3. **Run database migrations**

```bash
npm run prisma:migrate deploy
```

4. **Seed the database** (first deployment only)

```bash
npm run prisma:seed
```

5. **Start the production server**

```bash
npm start
# Or with PM2:
pm2 start dist/index.js --name geoflags-backend
```

### Recommended Infrastructure

| Component | Recommendation |
|-----------|----------------|
| **Web Server** | Nginx or Caddy (reverse proxy) |
| **Process Manager** | PM2 or systemd |
| **Database** | PostgreSQL 14+ (managed service recommended) |
| **Monitoring** | Prometheus + Grafana |
| **Logging** | Winston + ELK Stack or Datadog |
| **Hosting** | DigitalOcean, AWS, Railway, Render |
| **SSL** | Let's Encrypt or managed SSL |

### PM2 Setup

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name geoflags-backend

# Auto-restart on system reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs geoflags-backend

# View status
pm2 status

# Restart
pm2 restart geoflags-backend
```

---

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!!"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!!"}' \
  -c cookies.txt

# Get current user (authenticated)
curl http://localhost:3001/api/auth/me -b cookies.txt

# Get leaderboard
curl "http://localhost:3001/api/game/leaderboard?mode=FLAGS&limit=10"
```

### Load Testing

Use tools like Apache Bench, wrk, or k6 for load testing:

```bash
# Apache Bench - 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:3001/api/health

# k6 - Custom script
k6 run load-test.js
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Express.js** - Web framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Robust database
- **Socket.io** - Real-time communication
- **JWT** - Secure authentication
- **TypeScript** - Type safety

---

## 💬 Support

Need help? Found a bug?

- **Issues** - [Open an issue](https://github.com/Lukas200301/GeoFlags/issues)
- **Documentation** - Check the [Express docs](https://expressjs.com) or [Prisma docs](https://www.prisma.io/docs)
- **Frontend** - See the [Frontend README](../README.md)

---

<div align="center">

**Secure backend for the GeoFlags geography quiz platform 🔐**

[⬆ Back to Top](#-geoflags-backend)

</div>
