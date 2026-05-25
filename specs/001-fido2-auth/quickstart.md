# Quickstart: Local Development & Setup

**Phase**: Phase 1 Design  
**Date**: 2026-05-25  
**Status**: Complete  

## Prerequisites

- Node.js 24 LTS
- npm or pnpm
- PostgreSQL 14+ (local or Docker)
- Redis 7+ (local or Docker)
- Expo CLI (for mobile development)
- macOS, Linux, or WSL2 for mobile development

---

## Environment Setup

### 1. Clone Repository & Install Dependencies

```bash
git clone <repo-url>
cd rn-fido2

# Install backend dependencies
cd api && npm install && cd ..

# Install frontend dependencies
cd mobile && npm install && cd ..
```

### 2. Create Environment Files

#### Backend (api/.env.local)

Copy `.env.example` and fill in local values:

```bash
cp api/.env.example api/.env.local
```

**api/.env.example** (template):
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=fido2_auth
DB_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-required
JWT_EXPIRATION=900  # 15 minutes (seconds)
REFRESH_TOKEN_EXPIRATION=604800  # 7 days

# Server
NODE_ENV=development
APP_PORT=3000
APP_NAME=fido2-auth-api

# FIDO2
RP_ID=localhost  # Relying Party ID (change for production)
RP_NAME=FIDO2 Auth Service
ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_MAX_ATTEMPTS=10  # per IP
ACCOUNT_LOCK_DURATION_MS=900000  # 15 minutes
ACCOUNT_LOCK_THRESHOLD=5  # attempts before lock

# Logging
LOG_LEVEL=debug
```

#### Frontend (mobile/.env.local)

```bash
cp mobile/.env.example mobile/.env.local
```

**mobile/.env.example** (template):
```
# API Configuration
API_BASE_URL=http://localhost:3000
API_TIMEOUT_MS=30000

# App
APP_NAME=FIDO2 Auth
APP_VERSION=1.0.0-beta
```

### 3. Start Database & Cache

#### Option A: Docker Compose (Recommended)

Create `docker-compose.yml` at project root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: fido2_auth
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Start services:
```bash
docker-compose up -d
```

Verify:
```bash
docker-compose ps
```

#### Option B: Local Installation

**PostgreSQL** (macOS with Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
createdb fido2_auth
```

**Redis** (macOS with Homebrew):
```bash
brew install redis
brew services start redis
```

Verify:
```bash
psql -U postgres -d fido2_auth -c "SELECT version();"
redis-cli ping
```

---

## Backend Setup

### 1. Database Migrations

#### Run All Pending Migrations

```bash
cd api
npm run typeorm migration:run
```

**Expected Output**:
```
query: SELECT * FROM "typeorm_metadata" ...
migration QueryRunner#1 (1000-CreateUserTable) execution started
...
migrations have been executed successfully!
```

#### View Migration Status

```bash
npm run typeorm migration:show
```

**Output**:
```
 {0} [TypeOrmMigrationShow] "1000-CreateUserTable" is pending
 {1} [TypeOrmMigrationShow] "1001-CreateAuthenticatorTable" is pending
```

#### Revert Last Migration

```bash
npm run typeorm migration:revert
```

**Use Case**: Undo a migration if it fails or you need to rebuild the schema

### 2. Seed Development Data (Optional)

```bash
npm run seed
```

**What gets seeded**:
- Test user: email=test@example.com, password=TestPassword123!
- Test authenticator (if available)

**Note**: Idempotent; safe to run multiple times (won't duplicate)

### 3. Start Backend Server

```bash
npm run start:dev
```

**Expected Output**:
```
[NestFactory] Starting Nest application...
[InstanceLoader] AuthModule dependencies initialized
[RoutesResolver] AppController {/}:
  GET /                     (health check)
  POST /auth/register       (create account)
  POST /auth/login          (credential login)
  POST /auth/logout         (logout)
  ...
[NestApplication] Nest application successfully started
[Logger] Server running on http://localhost:3000
```

### 4. Test Backend Health Check

```bash
curl http://localhost:3000/
```

**Expected Response**:
```json
{
  "status": "ok",
  "service": "fido2-auth-api",
  "timestamp": "2026-05-25T10:00:00Z"
}
```

---

## Frontend Setup

### 1. Start Expo Development Server

```bash
cd mobile
npm start
```

**Expected Output**:
```
Starting Expo CLI...
Local: http://localhost:19000
LAN: http://192.168.x.x:19000
```

### 2. Run on iOS Simulator

```bash
i  # In the Expo CLI prompt
```

Prerequisites:
- Xcode installed
- iOS Simulator running

### 3. Run on Android Emulator

```bash
a  # In the Expo CLI prompt
```

Prerequisites:
- Android Studio installed
- Android Emulator running

### 4. Run on Physical Device

1. Download Expo Go app (iOS App Store or Google Play)
2. Scan QR code from Expo CLI
3. App loads on device

---

## First-Run Workflow

### Backend Initialization Checklist

- [ ] Docker services running (postgres + redis)
- [ ] `.env.local` configured with local DB credentials
- [ ] Migrations run successfully (`npm run typeorm migration:run`)
- [ ] (Optional) Seeding complete (`npm run seed`)
- [ ] Backend started (`npm run start:dev`)
- [ ] Health check responds (GET `http://localhost:3000/`)

### Frontend Initialization Checklist

- [ ] `.env.local` configured with API_BASE_URL=http://localhost:3000
- [ ] Expo CLI started (`npm start`)
- [ ] Simulator/emulator running
- [ ] App loads and displays login screen

### Manual Integration Test (End-to-End)

1. **Registration**:
   - Open app → navigate to registration
   - Enter email: test-user@example.com
   - Enter password: SecureTest123!
   - Tap "Create Account"
   - Expected: Success message; redirected to login

2. **Credential Login**:
   - Email: test-user@example.com
   - Password: SecureTest123!
   - Tap "Login"
   - Expected: Logged in; redirected to Home screen

3. **Enable Biometrics**:
   - Tap "Settings" → "Enable Biometrics"
   - Complete FIDO2 ceremony (simulator will simulate or prompt physical authenticator)
   - Expected: Authenticator enrolled; displayed in "My Authenticators" list

4. **Biometric Login**:
   - Logout
   - On login screen, tap "Login with Biometric"
   - Complete FIDO2 ceremony
   - Expected: Logged in; redirected to Home

5. **Change Password**:
   - Settings → "Change Password"
   - Current: SecureTest123!
   - New: NewSecureTest456!
   - Expected: Password updated; all sessions invalidated; must re-login

6. **Logout**:
   - Tap logout from any screen
   - Expected: Redirected to login screen; cannot access protected pages

---

## Troubleshooting

### Backend Issues

#### "ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:5432" (PostgreSQL not running)

```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Or check Docker
docker-compose ps postgres
```

#### "Error: connect ECONNREFUSED 127.0.0.1:6379" (Redis not running)

```bash
# Verify Redis is running
redis-cli ping
# Should return: PONG

# Or check Docker
docker-compose ps redis
```

#### "QueryFailedError: unknown type: uuid" (PostgreSQL UUID extension)

Some PostgreSQL installations require UUID extension. Run:

```bash
psql -U postgres -d fido2_auth -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

### Frontend Issues

#### "Cannot find module '@react-native-async-storage/async-storage'"

```bash
cd mobile
npm install @react-native-async-storage/async-storage
npm install
```

#### Expo Server Not Found (API timeout)

Verify backend is running and API_BASE_URL is correct in `.env.local`:

```bash
# Confirm backend is listening
curl http://localhost:3000/
```

#### Biometric API Not Available in Simulator

Native biometric APIs (Face ID, Touch ID, fingerprint) don't work in simulators. FIDO2 ceremony will display mocked authenticator selection. For real biometric testing, use physical device.

### Database Issues

#### "FATAL: remaining connection slots are reserved"

Too many connections. Restart PostgreSQL:

```bash
# Docker
docker-compose restart postgres

# Homebrew
brew services restart postgresql@14
```

#### Database Won't Start After Truncation/Revert

Clear all migrations and rebuild:

```bash
npm run typeorm migration:revert  # Repeat until all reverted
npm run typeorm migration:run     # Rebuild from scratch
npm run seed                      # Reseed
```

---

## Development Commands

### Backend

```bash
# Start development server (watch mode)
npm run start:dev

# Run all pending migrations
npm run typeorm migration:run

# Generate new migration (after schema change)
npm run typeorm migration:generate -- -n CreateTableName

# Revert last migration
npm run typeorm migration:revert

# Seed development data
npm run seed

# Clear all data (dangerous!)
npm run seed:clear

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend

```bash
# Start Expo development server
npm start

# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Lint code
npm run lint

# Format code
npm run format
```

---

## Database Persistence

### Backup Database

```bash
# PostgreSQL dump
pg_dump -U postgres fido2_auth > backup.sql

# Or with Docker
docker-compose exec postgres pg_dump -U postgres fido2_auth > backup.sql
```

### Restore Database

```bash
psql -U postgres fido2_auth < backup.sql

# Or with Docker
docker-compose exec postgres psql -U postgres fido2_auth < backup.sql
```

---

## Next Steps

1. ✅ Complete backend + frontend setup
2. ✅ Run integration tests (manual E2E flows above)
3. → Generate Phase 2 tasks via `/speckit-tasks`
4. → Implement features per task list

---

**Setup Complete**: Local development environment ready for implementation.
