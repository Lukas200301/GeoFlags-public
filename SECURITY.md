# Security Documentation

Comprehensive security documentation for the GeoFlags application (frontend and backend).

## Table of Contents

- [Overview](#overview)
- [Authentication & Session Management](#authentication--session-management)
- [CSRF Protection](#csrf-protection)
- [Role-based Access Control](#role-based-access-control)
- [API Security](#api-security)
- [Backend Security](#backend-security)
- [Type Safety](#type-safety)
- [Security Checklist](#security-checklist)
- [Reporting Security Issues](#reporting-security-issues)

## Overview

GeoFlags implements defense-in-depth security with multiple layers of protection:

- **HttpOnly Secure Cookies** - Session tokens never exposed to JavaScript
- **CSRF Protection** - Token validation for all state-changing operations
- **JWT Authentication** - Stateless authentication with access and refresh tokens
- **Role-based Access Control** - Server-side role verification
- **Rate Limiting** - Protection against brute force and DoS attacks
- **Input Validation** - Zod schemas validate all user input
- **Type Safety** - TypeScript strict mode catches errors at compile time
- **Security Headers** - Helmet.js protection against common attacks

## Authentication & Session Management

### HttpOnly Secure Cookies

**Implementation**: Session authentication uses HttpOnly, Secure cookies set by the backend.

**Cookie Configuration**:
```javascript
{
  httpOnly: true,      // Prevents JavaScript access (XSS protection)
  secure: true,        // HTTPS only in production
  sameSite: 'lax',     // CSRF protection
  maxAge: 24 * 60 * 60 * 1000  // 24 hours
}
```

**Security Benefits**:
- ✅ Cookies inaccessible to JavaScript - prevents XSS token theft
- ✅ `Secure` flag ensures transmission only over HTTPS
- ✅ `SameSite` attribute prevents CSRF attacks
- ✅ No token exposure in localStorage (vulnerable to XSS)

### JWT Token Architecture

**Token Types**:

| Token | Lifespan | Storage | Purpose |
|-------|----------|---------|---------|
| Access Token | 15 minutes | HttpOnly Cookie | API authentication |
| Refresh Token | 7 days | HttpOnly Cookie | Access token renewal |
| CSRF Token | Session | Client memory | Mutation protection |
| Re-auth Token | 5 minutes | Client memory | Sensitive operations |

**Token Versioning**: Global invalidation capability via `tokenVersion` field in user table.

### Session Verification

Every authenticated request is verified server-side:

**Frontend** ([app.vue:13](app.vue#L13)):
```typescript
credentials: 'include' // Sends HttpOnly cookies
```

**Backend**:
- Validates JWT signature
- Checks token expiration
- Verifies user exists
- Confirms token version matches
- Returns user with role

**Endpoints**:
- `POST /api/auth/login` - Create session
- `POST /api/auth/refresh` - Renew access token
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current user

## CSRF Protection

### Token-based CSRF Prevention

All mutating requests (POST, PUT, DELETE, PATCH) require a CSRF token.

**Flow**:
1. Client requests CSRF token: `GET /api/auth/csrf-token`
2. Token cached in composable: [composables/useApi.ts:21](composables/useApi.ts#L21)
3. Token included in headers: `X-CSRF-Token`
4. Backend validates token before processing request
5. Invalid tokens return 403 Forbidden

**Example** ([composables/useAuth.ts:64](composables/useAuth.ts#L64)):
```typescript
const csrfToken = await useApi().getCsrfToken()

await $fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
  },
  credentials: 'include',
  body: credentials,
})
```

### Automatic Token Management

The `useApi()` composable automatically:
- Fetches CSRF token on first mutating request
- Caches token for subsequent requests
- Includes token in all POST/PUT/DELETE/PATCH requests
- Handles token refresh on expiration

**Implementation**: [composables/useApi.ts:39-70](composables/useApi.ts#L39-L70)

## Role-based Access Control

### Admin Routes Protection

Admin routes (`/admin/*`) are protected by the `admin` middleware.

**Middleware Flow** ([middleware/admin.ts](middleware/admin.ts)):
1. Fetch user from backend (if not already loaded)
2. Check if user is authenticated → redirect to `/auth/login` if not
3. Check if user has `role === 'admin'` → redirect to `/` if not
4. Allow access to admin route

**CRITICAL**: Role verification happens **server-side** on every request. Client-side checks are for UX only.

### Admin UI Rendering

Admin menu items only render if backend confirms admin role:

**Example** ([layouts/default.vue:44](layouts/default.vue#L44)):
```vue
<div v-if="isAdmin" class="pt-4 mt-4 border-t border-gray-200">
  <!-- Admin links -->
</div>
```

`isAdmin` is computed from `user.role`, which is **always** fetched from backend.

### Sensitive Admin Actions

Destructive operations require explicit confirmation:

**Examples**:
- **Delete user**: Requires clicking "Delete User" button
- **Clear leaderboard**: Requires typing "DELETE" to confirm
- **Change roles**: Requires re-authentication token

**Implementation** ([components/AdminModal.vue](components/AdminModal.vue)):
```vue
<AdminModal
  v-model="deleteModal.open"
  title="Delete User"
  confirm-text="Delete User"
  danger
  @confirm="handleDeleteUser"
>
  <div class="p-4 bg-red-50">
    ⚠️ This action cannot be undone
  </div>
</AdminModal>
```

## API Security

### Composable-based API Layer

All API calls go through `useApi()` composable ([composables/useApi.ts](composables/useApi.ts)).

**Benefits**:
- ✅ Centralized security logic
- ✅ Automatic CSRF token inclusion
- ✅ Consistent error handling
- ✅ Type-safe requests
- ✅ Credential management

**Request Flow**:
```typescript
const { submitScore } = useApi()

// Automatically includes:
// - CSRF token (for POST)
// - Session cookie (credentials: 'include')
// - Proper headers
await submitScore({ mode: 'flags', score: 100 })
```

### Input Validation

**Frontend**: Client-side validation for UX
**Backend**: Server-side validation with Zod schemas (source of truth)

**Example** (backend):
```typescript
const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100),
})
```

## Backend Security

### Security Headers

Helmet.js configures secure HTTP headers:

```javascript
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
```

### Rate Limiting

Different limits for different endpoints:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Admin | 100 requests | 15 minutes |
| General API | 200 requests | 15 minutes |

### Password Security

- **Hashing**: bcrypt with 10 rounds
- **Minimum Length**: 8 characters
- **Validation**: Must contain letters and numbers
- **Storage**: Only hashed passwords stored
- **Transmission**: HTTPS only in production

### SQL Injection Prevention

**Prisma ORM** uses parameterized queries:

```typescript
// ✅ Safe - parameterized
const user = await prisma.user.findUnique({
  where: { id: userId }
})

// ❌ Never do this - vulnerable to SQL injection
// await prisma.$queryRaw(`SELECT * FROM users WHERE id = ${userId}`)
```

### Audit Logging

All admin actions are logged:

**Logged Information**:
- Admin user ID and username
- Action type (USER_DELETE, ROLE_CHANGE, etc.)
- Target user/resource ID
- IP address
- Timestamp
- Additional metadata

**Access**: Admin audit logs available at `/api/admin/audit-logs`

## Type Safety

### TypeScript Strict Mode

**Configuration** ([tsconfig.json:3](tsconfig.json#L3)):
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Benefits**:
- Compile-time type checking
- Prevents null/undefined errors
- Catches type mismatches
- IDE autocomplete and IntelliSense
- Self-documenting code

### Type Definitions

All API responses and data structures are typed ([types/index.ts](types/index.ts)):

```typescript
export interface User {
  id: string
  username: string
  role: UserRole // 'user' | 'admin'
}

export interface AuthResponse {
  user: User
  message?: string
}
```

## Security Checklist

### Frontend
- [x] HttpOnly, Secure cookies for session management
- [x] No JWT tokens in localStorage
- [x] CSRF protection for all mutating requests
- [x] Server-side role verification for admin routes
- [x] Client-side role checks for UI rendering only
- [x] Re-authentication modals for sensitive actions
- [x] Type-safe API with TypeScript strict mode
- [x] Centralized API layer via composables
- [x] Input validation on forms
- [x] Error handling without exposing sensitive data

### Backend
- [x] JWT access tokens (15 min) + refresh tokens (7 days)
- [x] HttpOnly, Secure cookies for token storage
- [x] CSRF token validation on mutations
- [x] bcrypt password hashing (10 rounds)
- [x] Rate limiting on all endpoints
- [x] Helmet.js security headers
- [x] CORS with credentials enabled
- [x] SQL injection prevention (Prisma ORM)
- [x] Input validation with Zod schemas
- [x] Admin action audit logging
- [x] Token versioning for global invalidation

### Production
- [ ] Change all default passwords
- [ ] Use strong JWT secrets (64+ random chars)
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Use secure database connection (SSL mode)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS with specific origins
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Use environment variables (never hardcode secrets)
- [ ] Set secure cookie flags
- [ ] Enable PostgreSQL connection pooling
- [ ] Configure firewall rules
- [ ] Set up reverse proxy (Nginx/Caddy)

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. **Do NOT** discuss the vulnerability publicly
3. Open a private security advisory on GitHub
4. Provide detailed information about the vulnerability
5. Include steps to reproduce if possible
6. Allow time for a fix before public disclosure

### Responsible Disclosure

We follow responsible disclosure practices:

- Acknowledge receipt of vulnerability reports within 48 hours
- Provide regular updates on fixing progress
- Credit researchers who report vulnerabilities (if desired)
- Coordinate disclosure timeline with reporter

### What to Report

Security vulnerabilities that should be reported:

- Authentication bypass
- SQL injection
- XSS (Cross-site scripting)
- CSRF bypass
- Privilege escalation
- Information disclosure
- Remote code execution
- Denial of service vulnerabilities

### What Not to Report

Please do not report:

- Theoretical vulnerabilities without proof of concept
- Social engineering attacks
- Physical security issues
- Issues in third-party dependencies (report to maintainers)
- Denial of service via resource exhaustion without amplification

## Security Best Practices

### For Developers

1. **Never** store sensitive data in localStorage
2. **Always** validate input on both client and server
3. **Always** use CSRF tokens for mutations
4. **Never** trust client-side role checks for security
5. **Always** use HTTPS in production
6. **Never** log sensitive data (passwords, tokens)
7. **Always** use parameterized queries
8. **Never** expose detailed error messages to users

### For Administrators

1. Change default admin password immediately
2. Use strong, unique passwords
3. Enable 2FA if available
4. Regularly review audit logs
5. Keep dependencies up to date
6. Monitor for suspicious activity
7. Implement database backups
8. Use least privilege principle

### For Users

1. Use strong, unique passwords
2. Do not share account credentials
3. Log out when using shared computers
4. Report suspicious activity
5. Keep browser up to date

---

**Last Updated**: 2025-01-13

For additional security information, see:
- [Frontend Setup](SETUP_INSTRUCTIONS.md)
- [Backend Setup](backend/SETUP_INSTRUCTIONS.md)
- [Backend API Documentation](backend/README.md)
