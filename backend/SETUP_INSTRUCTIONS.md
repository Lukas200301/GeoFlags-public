# Backend Setup Instructions

Complete guide to set up and run the GeoFlags backend API server.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 24.11.1+** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** version control

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE geoflags;
\q
```

Or use a GUI tool like **pgAdmin**, **DBeaver**, or **TablePlus**.

### 3. Configure Environment

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/geoflags"

# JWT Secrets (Generate strong random secrets!)
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Admin User (Created on first seed)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!
```

> **IMPORTANT**: Generate strong random secrets for production:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Initialize Database

Run database migrations and seed initial data:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data (admin user + game modes)
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The backend will start on **http://localhost:3001**

You should see:
```
╔════════════════════════════════════════╗
║        GeoFlags Backend Server         ║
╚════════════════════════════════════════╝

Server running on port 3001
Environment: development
```

## Available Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm start                # Start production server

# Prisma Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:seed      # Seed database with initial data

# Code Quality
npm run lint             # Lint TypeScript code
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
```

## Verify Installation

Test that the API is running correctly:

### Health Check
```bash
curl http://localhost:3001/api/health
```

Expected response: `{"status":"ok","timestamp":"..."}`

### Register a User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "ChangeThisPassword123!"
  }'
```

## Database Management

### Prisma Studio

Open Prisma Studio to visually browse and edit your database:

```bash
npm run prisma:studio
```

Access the interface at **http://localhost:5555**

### Create New Migration

When you modify the Prisma schema:

```bash
npx prisma migrate dev --name migration_name
```

### Reset Database

**WARNING**: This deletes all data!

```bash
npx prisma migrate reset
```

## Updating the Database

### When You Need to Update the Database

You need to update the database when:
- Adding new tables or models
- Adding/removing fields from existing models
- Changing field types or constraints
- Modifying relationships between models
- Adding indexes or unique constraints

### Step-by-Step Update Process

#### 1. Modify the Prisma Schema

Edit `prisma/schema.prisma` with your changes:

```prisma
// Example: Adding a new field to User model
model User {
  id            String   @id @default(uuid())
  username      String   @unique
  email         String   @unique
  password_hash String
  role          Role     @default(USER)
  tokenVersion  Int      @default(0)
  createdAt     DateTime @default(now())

  // New field
  lastLoginAt   DateTime?  // ← Add new field

  gameSessions        GameSession[]
  leaderboardEntries  LeaderboardEntry[]
  adminAudits         AdminAudit[]
}
```

#### 2. Create Migration

Generate a migration file from your schema changes:

```bash
npx prisma migrate dev --name add_last_login_field
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your development database
- Regenerate the Prisma Client

**Migration naming convention**:
- `add_<field_name>` - Adding new field
- `remove_<field_name>` - Removing field
- `update_<table_name>` - Modifying existing table
- `create_<table_name>` - Creating new table

#### 3. Review the Generated Migration

Check the migration file in `prisma/migrations/<timestamp>_<migration_name>/migration.sql`:

```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
```

Ensure the SQL is correct before proceeding.

#### 4. Apply Migration (Development)

If you haven't applied it yet:

```bash
npm run prisma:migrate
```

Or:

```bash
npx prisma migrate dev
```

#### 5. Update Production Database

For production, use:

```bash
npx prisma migrate deploy
```

This applies all pending migrations without prompting.

### Common Update Scenarios

#### Adding a New Table

1. Add the model to `schema.prisma`:
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

2. Update User model with relation:
```prisma
model User {
  // ... existing fields
  notifications Notification[]
}
```

3. Create migration:
```bash
npx prisma migrate dev --name create_notifications_table
```

#### Adding a Field with Default Value

```prisma
model User {
  // ... existing fields
  isVerified Boolean @default(false)  // New field with default
}
```

```bash
npx prisma migrate dev --name add_is_verified_field
```

#### Renaming a Field

```bash
# 1. Create migration
npx prisma migrate dev --name rename_email_to_email_address

# 2. Manually edit the migration SQL to use RENAME
# Change from DROP/ADD to:
ALTER TABLE "User" RENAME COLUMN "email" TO "email_address";
```

#### Changing Field Type

```prisma
model User {
  // Change from String to Text (larger)
  bio String @db.Text  // Was: String
}
```

```bash
npx prisma migrate dev --name change_bio_to_text
```

### Handling Migration Conflicts

#### Reset and Reapply (Development Only)

If migrations are out of sync:

```bash
# WARNING: Deletes all data!
npx prisma migrate reset

# Then seed again
npm run prisma:seed
```

#### Resolve Conflicts Manually

1. Check migration status:
```bash
npx prisma migrate status
```

2. If migrations are unapplied:
```bash
npx prisma migrate resolve --applied <migration_name>
```

3. If migration failed:
```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

### Rolling Back Migrations

Prisma doesn't support automatic rollbacks. To roll back:

#### Option 1: Create a Reverse Migration

```bash
# Create new migration that reverses changes
npx prisma migrate dev --name revert_last_login_field
```

Manually edit the migration SQL to reverse changes:
```sql
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastLoginAt";
```

#### Option 2: Reset Database (Development Only)

```bash
npx prisma migrate reset
```

### Production Database Updates

#### Safe Production Update Process

1. **Backup your database first!**
```bash
# PostgreSQL backup
pg_dump -U postgres -d geoflags > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. **Test migrations on staging**:
```bash
# On staging environment
npx prisma migrate deploy
```

3. **Apply to production**:
```bash
# On production environment
npx prisma migrate deploy
```

4. **Verify the update**:
```bash
# Check if migrations applied
npx prisma migrate status

# Restart application
pm2 restart geoflags-backend
```

### After Updating the Database

After any database update:

1. **Regenerate Prisma Client**:
```bash
npm run prisma:generate
```

2. **Restart development server**:
```bash
npm run dev
```

3. **Update TypeScript types** (if needed):
```bash
npm run build
```

4. **Test the changes**:
- Verify new fields appear in Prisma Studio
- Test API endpoints that use updated models
- Check that existing data is preserved

### Best Practices

✅ **DO**:
- Always backup production database before migrations
- Test migrations on staging first
- Use descriptive migration names
- Review generated SQL before applying
- Keep migrations small and focused
- Commit migration files to version control

❌ **DON'T**:
- Don't edit applied migration files
- Don't delete migration files
- Don't use `migrate reset` in production
- Don't skip testing on staging
- Don't apply untested migrations to production

### Viewing Migration History

```bash
# View all migrations
ls -la prisma/migrations/

# Check migration status
npx prisma migrate status

# View specific migration SQL
cat prisma/migrations/<timestamp>_<name>/migration.sql
```

## Default Credentials

After seeding, you can login with:

**Admin User:**
- Username: `admin` (or your ADMIN_USERNAME)
- Password: `ChangeThisPassword123!` (or your ADMIN_PASSWORD)

> **IMPORTANT**: Change the admin password immediately after first login!

## Troubleshooting

### Database Connection Failed

**Symptoms**: Cannot connect to PostgreSQL

**Solutions**:
- Check PostgreSQL is running: `pg_isready`
- Verify `DATABASE_URL` in `.env`
- Confirm database exists: `psql -U postgres -l`
- Check PostgreSQL service is running

### Port Already in Use

**Symptoms**: Error: Port 3001 is already in use

**Solutions**:
- Change `PORT` in `.env` to a different port
- Or kill the process using port 3001:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <pid> /F

# Linux/Mac
lsof -i :3001
kill -9 <pid>
```

### Prisma Errors

**Symptoms**: Prisma client errors, migration failures

**Solutions**:
```bash
# Delete and regenerate
rm -rf node_modules
rm -rf prisma/migrations
npm install
npm run prisma:generate
npm run prisma:migrate
```

### TypeScript Errors

**Symptoms**: Build or compilation errors

**Solutions**:
- Ensure `npm install` completed successfully
- Run `npm run build` to check for errors
- Check TypeScript version compatibility

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration history
│
├── src/
│   ├── index.ts             # App entry point
│   ├── server.ts            # Express server setup
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.ts          # Authentication middleware
│   │   ├── admin.ts         # Admin role middleware
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   └── errorHandler.ts  # Error handling
│   │
│   ├── routes/              # API route handlers
│   │   ├── auth.ts          # Auth routes
│   │   ├── game.ts          # Game routes
│   │   └── admin.ts         # Admin routes
│   │
│   ├── services/            # Business logic
│   │   ├── auth.service.ts  # Auth service
│   │   ├── game.service.ts  # Game service
│   │   └── admin.service.ts # Admin service
│   │
│   ├── utils/               # Utility functions
│   │   ├── jwt.ts           # JWT helpers
│   │   ├── validation.ts    # Zod schemas
│   │   └── constants.ts     # Constants
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   │
│   ├── socket/              # Socket.io handlers
│   │   └── handlers.ts      # Socket event handlers
│   │
│   ├── seed.ts              # Database seeding
│   └── seed-demo.ts         # Demo data seeding
│
├── .env.example             # Environment template
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## Security Best Practices

### Production Checklist

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
- [ ] Set secure cookie flags (HttpOnly, Secure, SameSite)
- [ ] Enable PostgreSQL connection pooling

### Environment Variables

Production `.env` example:

```env
# Database (use connection pooling)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=10"

# JWT Secrets (MUST BE STRONG & UNIQUE)
JWT_ACCESS_SECRET="<64-char-random-string>"
JWT_REFRESH_SECRET="<64-char-random-string>"

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<secure-password>
```

## Production Deployment

### Build Application

```bash
npm run build
```

### Run Database Migrations

```bash
npm run prisma:migrate deploy
```

### Seed Database (First deployment only)

```bash
npm run prisma:seed
```

### Start Production Server

```bash
npm start
```

Or with **PM2** (recommended):

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start dist/index.js --name geoflags-backend

# Auto-restart on system reboot
pm2 startup
pm2 save

# Monitor
pm2 logs geoflags-backend
pm2 status
```

## Testing Socket.io

Use the [Socket.io Client Tool](https://amritb.github.io/socketio-client-tool/) or test with code:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' },
  withCredentials: true
});

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('game:join', 'FLAGS');
});

socket.on('leaderboard:update', (data) => {
  console.log('Leaderboard:', data);
});
```

## Development Tools

### Logging

Development logs appear in terminal. For production, consider:
- **Winston** - File logging
- **ELK Stack** - Centralized logging
- **Sentry** - Error tracking

### Database Monitoring

- Use Prisma Studio for visual database inspection
- Monitor slow queries with PostgreSQL logs
- Set up database performance monitoring

## Additional Resources

- **Full API Documentation**: [README.md](README.md)
- **Security Guidelines**: [SECURITY.md](../SECURITY.md)
- **Frontend Setup**: [../SETUP_INSTRUCTIONS.md](../SETUP_INSTRUCTIONS.md)

### External Documentation

- [Express.js Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

If you encounter issues:

1. Check this documentation
2. Review error messages in terminal
3. Check database logs
4. Search existing issues on GitHub
5. Create a new issue with detailed information

### When Creating an Issue

Include:
- Node.js version (`node --version`)
- PostgreSQL version
- npm/yarn version
- Operating system and version
- Full error messages with stack traces
- Steps to reproduce
- Expected vs actual behavior

---

**Setup complete!** Run `npm run dev` and the API will be available at http://localhost:3001
