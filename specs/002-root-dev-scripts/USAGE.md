# Root Development Scripts - Usage Guide

**Feature**: Root Development Scripts | **Date**: 2026-05-25 | **Version**: 1.0

## Overview

This guide provides comprehensive documentation for the root-level npm scripts that enable starting the mobile app and API server without navigating into subdirectories. These scripts use `npm workspaces` and the `concurrently` library for parallel process management.

## Prerequisites

- **Node.js**: 18 LTS or higher (latest recommended: 24 LTS)
- **npm**: 7 or higher (workspaces support required)
- **Structure**: Project must have both `api/` and `mobile/` directories with `package.json` files
- **Scripts**: Both `api/package.json` and `mobile/package.json` must have `start:dev` scripts configured

## Installation

### One-Time Setup

Install dependencies for the entire monorepo:

```bash
npm install
```

This installs all workspace dependencies including the `concurrently` dev dependency in the root.

### Verify Installation

Check that workspaces are recognized:

```bash
npm ls --depth=0
```

Expected output shows both `api` and `mobile` workspaces listed.

---

## Available Commands

### 1. `npm start` - Start All Services

Launches both the API and mobile development servers concurrently with colored log output.

**Usage**:
```bash
npm start
```

**What happens**:
1. Both services start in parallel
2. Each service's output is prefixed with `[api]` or `[mobile]` in distinct colors
3. Timestamps and log messages from each service are clearly separated
4. Services are monitored for failures

**Example output**:
```
[api]    [15:32:45] Starting NestJS development server...
[mobile] [15:32:46] Starting Expo packager...
[api]    [15:32:48] Server running on http://localhost:3000
[mobile] [15:32:52] Packager ready on port 8081
```

**Exit behavior**:
- If either service fails to start: both are stopped immediately (fail-fast)
- If both services start successfully: they run continuously until manually stopped
- Press `Ctrl+C` to stop all services cleanly
- Exit code is non-zero if any service fails, 0 if both stop gracefully

**Performance target**: Both services should be ready within 5 seconds of command invocation.

---

### 2. `npm run start:api` - Start API Only

Launches only the NestJS API server (useful for backend-only development).

**Usage**:
```bash
npm run start:api
```

**What happens**:
- API server starts on port 3000 (default)
- Mobile service is NOT started
- Output is direct from the API server (no prefixing)

**Use cases**:
- Backend development or debugging
- API integration testing
- Database migrations or seeding
- Isolating API issues without mobile interference

**Exit**:
- Press `Ctrl+C` to stop
- Exit code is non-zero on startup failure, 0 on graceful shutdown

---

### 3. `npm run start:mobile` - Start Mobile Only

Launches only the Expo development server (useful for frontend-only development).

**Usage**:
```bash
npm run start:mobile
```

**What happens**:
- Expo packager starts on port 8081 (default)
- Mobile dev server enters interactive CLI mode
- API server is NOT started

**Use cases**:
- Mobile UI development or styling
- React Native component testing
- Debugging mobile-specific issues
- Testing without backend changes

**Interactive features**:
- Press `a` to run on Android emulator
- Press `i` to run on iOS simulator
- Press `w` to open web preview
- Press `j` to open debugger

**Exit**:
- Press `Ctrl+C` to stop
- Exit code is non-zero on startup failure, 0 on graceful shutdown

---

### 4. `npm run install:all` - Install All Dependencies

Installs dependencies for all workspaces (convenience script).

**Usage**:
```bash
npm run install:all
```

**Equivalent to**:
```bash
npm install --workspaces
```

**When to use**:
- After pulling changes that update dependencies
- When a new workspace is added
- After switching branches with different dependency sets

---

## Implementation Details

### Technology Stack

| Component | Purpose | Details |
|-----------|---------|---------|
| npm workspaces | Monorepo management | Native npm feature (7+), no additional tooling |
| concurrently | Process orchestration | Handles parallel execution, log prefixing, signal handling |
| Node.js scripts | Command definitions | Declarative package.json entries, no shell scripts |

### How It Works

1. **Root `package.json`** defines four npm scripts that coordinate workspaces:
   - `start`: Runs concurrently with prefixed output
   - `start:api`: Routes to api workspace's start:dev script
   - `start:mobile`: Routes to mobile workspace's start:dev script
   - `install:all`: Installs all workspace dependencies

2. **Concurrently features used**:
   - `--names "api,mobile"`: Identifies each process
   - `--prefix "[{name}]"`: Adds colored service name prefix to each log line
   - `--color`: Enables ANSI color output for visual distinction
   - Fail-fast: If either process exits with non-zero code, all processes terminate

3. **No changes to subdirectories**: `api/package.json` and `mobile/package.json` remain unchanged. Root scripts only wrap their existing `start:dev` scripts.

### Port Configuration

| Service | Default Port | Environment Variable |
|---------|--------------|----------------------|
| API (NestJS) | 3000 | `PORT` or `API_PORT` |
| Mobile (Expo) | 8081 | `EXPO_PORT` |

**Changing ports**:
```bash
# API on custom port
PORT=3001 npm run start:api

# Mobile on custom port
EXPO_PORT=8082 npm run start:mobile

# Both with custom ports
PORT=3001 EXPO_PORT=8082 npm start
```

### Signal Handling

| Signal | Behavior |
|--------|----------|
| `SIGINT` (Ctrl+C) | Gracefully terminates all child processes |
| `SIGTERM` (kill) | Gracefully terminates all child processes |
| Service exit (non-zero) | Fail-fast: stops all other services immediately |
| Service crash | All services terminate; user must restart |

---

## Troubleshooting

### Problem: "Port already in use" Error

**Symptom**: One or both services fail to start with port binding error.

**Solution**:
```bash
# Find which process is using port 3000 (API)
lsof -i :3000

# Find which process is using port 8081 (Mobile)
lsof -i :8081

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or use convenience commands:
# macOS/Linux:
lsof -ti:3000 | xargs kill -9    # Free port 3000
lsof -ti:8081 | xargs kill -9    # Free port 8081

# Then retry:
npm start
```

**Prevention**:
- Don't run multiple instances of the same command concurrently
- Use custom port numbers if you need multiple instances
- Check for hanging processes after unexpected shutdown

---

### Problem: "node_modules not installed" Error

**Symptom**: Missing dependency error when starting services.

**Solution**:
```bash
# Install all workspace dependencies
npm install

# Or use the convenience script
npm run install:all

# Retry the start command
npm start
```

**Causes**:
- First-time setup (forgotten install)
- Dependencies were deleted or corrupted
- Switching between branches with different dependency sets

---

### Problem: One Service Fails to Start

**Symptom**: One service starts but the other fails; both stop due to fail-fast.

**Diagnosis**:
```bash
# Start the failing service individually to see the error
npm run start:api      # If API failed
npm run start:mobile   # If mobile failed
```

**Common causes & fixes**:

| Issue | Cause | Fix |
|-------|-------|-----|
| Missing env file | `.env` not created | Create `.env` file with required variables |
| Database connection error | PostgreSQL not running | Start PostgreSQL service |
| Port conflict | Another service uses the port | Use troubleshooting section above |
| Missing dependency | package.json has uninstalled packages | Run `npm install` in that workspace |
| TypeScript compilation error | Code errors in api/ or mobile/ | Fix code errors, then retry |

---

### Problem: Services Don't Stop Cleanly on Ctrl+C

**Symptom**: Ctrl+C sent but processes hang for 10+ seconds or don't terminate.

**Solution**:
```bash
# Force terminate any remaining processes
# Find all node processes
ps aux | grep node

# Kill specific process (replace PID)
kill -9 <PID>

# Or kill all node processes (careful!)
killall -9 node
```

**Prevention**:
- Ensure services implement graceful shutdown handlers
- Don't block on long-running operations without timeouts
- Check service logs for uncaught exceptions

---

### Problem: Slow Startup (>5 seconds)

**Symptom**: Services take longer than 5 seconds to report "ready".

**Diagnosis**:
```bash
# Time the startup
time npm start
```

**Common causes**:
- TypeScript compilation (initial build)
- Database migrations running
- Module resolution/node_modules resolution slow
- Network I/O during initialization

**Optimization**:
- Pre-warm TypeScript compiler cache
- Run migrations separately before starting
- Check module imports for circular dependencies
- Use `npm ci` instead of `npm install` for faster installs

---

## Development Workflows

### Scenario 1: Backend Development

Start only the API:
```bash
npm run start:api
```

- API reloads on file changes (if hot reload configured)
- Make requests via REST client or frontend separately
- Debug backend logic in isolation

### Scenario 2: Frontend Development

Start only the mobile app:
```bash
npm run start:mobile
```

- Expo packager opens interactive CLI
- Press `i` for iOS simulator or `a` for Android emulator
- Hot reload on file changes (native mobile features)
- Backend must be running separately or mocked

### Scenario 3: Full Stack Development

Start both concurrently:
```bash
npm start
```

- Monitor both API and mobile logs in one terminal
- Colored prefixes help distinguish output
- If either fails, both stop (fail-fast helps catch integration issues)
- Open new terminal for additional commands while services run

### Scenario 4: Testing Integration

Start all services, then run integration tests in another terminal:
```bash
# Terminal 1: Start services
npm start

# Terminal 2: Run tests (in a new terminal)
cd api && npm run test:integration

# Or from root if integration tests run via workspace
npm --workspace=api run test:integration
```

---

## Environment Variables

### API (NestJS)

Create `/api/.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/fido2_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-dev-secret
FIDO2_ORIGIN=http://localhost:8081
```

### Mobile (Expo)

Create `/mobile/.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENVIRONMENT=development
```

---

## Best Practices

1. **Always start from project root**: Avoid `cd` into subdirectories to start services
2. **Use individual commands for debugging**: When one service fails, start it alone to see full error
3. **Check logs carefully**: Colored prefixes make it easy to spot which service has issues
4. **One terminal per session**: Keep development terminal clean by running services in foreground
5. **Clean shutdown**: Always press Ctrl+C rather than killing the terminal; allows graceful cleanup
6. **Fresh start on issues**: If behavior becomes weird, Ctrl+C, kill any hanging processes, then restart
7. **Version control .env**: Add `.env.example` to git with default/template values, but never commit `.env` with secrets

---

## Quick Reference

| Task | Command |
|------|---------|
| Start all services | `npm start` |
| Start API only | `npm run start:api` |
| Start mobile only | `npm run start:mobile` |
| Install dependencies | `npm install` |
| Install all workspaces | `npm run install:all` |
| Verify workspaces | `npm ls --depth=0` |
| Check API is running | `curl http://localhost:3000/health` |
| Access mobile dev menu | Press `m` in Expo CLI |

---

## Support & Debugging

For issues not covered here:

1. Check individual service logs (start service alone)
2. Verify prerequisites (Node.js, npm, ports available)
3. Review `.env` files for correct configuration
4. Check git status to ensure no uncommitted changes that might cause conflicts
5. Try fresh install: `rm -rf node_modules && npm install`

---

**Last Updated**: 2026-05-25 | **Status**: Active | **Maintained By**: Development Team
