# Quickstart: Root Development Scripts

**Feature**: Root Development Scripts | **Date**: 2026-05-25

## Overview

This feature adds centralized npm scripts to the root `package.json` that allow developers to start the mobile app and API server without navigating into subdirectories.

## Installation

The root `package.json` includes a new dev dependency:

```json
{
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

Install it with:
```bash
npm install
```

> **Note**: The `api/` workspace uses pnpm and `mobile/` uses npm. npm workspaces is intentionally not used to avoid resolver conflicts between the two package managers. Scripts invoke each service via `cd api && pnpm run start:dev` and `cd mobile && npm run start:dev` directly.

## Usage

### Start All Services
Start both the API and mobile development servers concurrently from the project root:

```bash
npm start
```

**What happens**:
1. Both services start in parallel
2. Log output appears with `[api]` and `[mobile]` prefixes in distinct colors
3. If either service fails to start, both are stopped and the command exits with an error
4. Press `Ctrl+C` to stop all services cleanly

**Example output**:
```
[api]    [15:32:45] Starting NestJS development server...
[mobile] [15:32:46] Starting Expo packager...
[api]    [15:32:48] Server running on http://localhost:3000
[mobile] [15:32:52] Packager ready on port 8081
```

### Start API Only
Start only the API server (useful for backend-only development):

```bash
npm run start:api
```

### Start Mobile Only
Start only the mobile development server:

```bash
npm run start:mobile
```

### Install All Dependencies
Install dependencies for both workspaces:

```bash
npm run install:all
```

## Troubleshooting

### "Port already in use" Error
If a service fails to start because a port is already in use:

1. **Identify which port is in use**: Check the error message (usually port 3000 for API, 8081 for mobile)
2. **Kill the existing process**:
   ```bash
   lsof -ti:3000 | xargs kill -9   # For API port
   lsof -ti:8081 | xargs kill -9   # For mobile port
   ```
3. **Retry**: Run `npm start` again

### "node_modules not installed"
If you see a dependency error:

1. Run `npm install` from the root to install all workspace dependencies
2. Retry the start command

### One Service Fails on Startup
Due to fail-fast behavior, if one service fails to start:

1. Both services will stop immediately
2. Check the error output to identify which service failed
3. Fix the underlying issue (missing dependency, configuration error, etc.)
4. Retry `npm start`

## Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm start` | Start all services (API + mobile) |
| `npm run start:api` | Start API only |
| `npm run start:mobile` | Start mobile only |
| `npm run install:all` | Install dependencies for all workspaces |

## Implementation Details

- **Tool**: `concurrently` for process management
- **Log Prefixing**: Service names displayed in colored brackets
- **Error Handling**: Fail-fast on any service startup failure
- **Signal Handling**: Ctrl+C properly terminates all child processes
- **No Changes**: Individual api/ and mobile/ package.json files remain unchanged
