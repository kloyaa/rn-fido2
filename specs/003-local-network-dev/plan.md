# Implementation Plan: Local Network Development — API Exposure & IP Discovery

**Branch**: `003-local-network-dev` | **Date**: 2026-05-25 | **Spec**: [specs/003-local-network-dev/spec.md](spec.md)
**Input**: Feature specification from `/specs/003-local-network-dev/spec.md`

## Summary

Add a root-level `npm run setup:network` command that detects the developer's LAN IP and writes it into the mobile app and API development environment files. The mobile app is updated to read its API base URL from `app.config.js → extra.apiBaseUrl` (sourced from `EXPO_PUBLIC_API_URL`). The API is updated to explicitly bind to `0.0.0.0` and expose a configurable host. The IP discovery script also writes the `ORIGIN` value for FIDO2 validation alignment. Production configs are untouched.

## Technical Context

**Language/Version**: Node.js (IP script); TypeScript (API + mobile)
**Primary Dependencies**: `os` module (Node.js stdlib, no new deps); Expo SDK 56; NestJS 11
**Storage**: `.env.local` files in `api/` and `mobile/` (development-only, gitignored)
**Testing**: None (per constitution III)
**Target Platform**: macOS + Linux (developer machines); API on Node.js; Mobile on Expo Go / EAS Build
**Project Type**: Developer tooling + configuration wiring across monorepo
**Performance Goals**: IP script completes in under 5 seconds (SC-002)
**Constraints**: Must not touch production configs; mobile `client.ts` already reads `Constants.expoConfig?.extra?.apiBaseUrl` — that wiring is preserved
**Scale/Scope**: 3 files modified (main.ts, configuration.ts, app.config.js created), 1 new script, 2 env files written

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicability | Status | Notes |
|-----------|---------------|--------|-------|
| I. FIDO2-First Security | YES | PASS | IP script writes `ORIGIN` to align FIDO2 origin verification with the LAN IP; production origin unchanged |
| II. Enterprise-Grade Architecture | YES | PASS | Explicit bind address in main.ts; typed `appHost` in ConfigurationService; clean script with error handling |
| III. No Testing Implementations | YES | PASS | No test code in scope |
| IV. Documentation-Driven Development | YES | PASS | quickstart.md documents all new commands; inline env var documentation in config files |
| V. Frontend/Backend Contract Alignment | YES | PASS | Mobile reads `EXPO_PUBLIC_API_URL` via `app.config.js → extra.apiBaseUrl`; API provides matching CORS and FIDO2 origin |

**Gate Status**: ✅ **PASS** — All principles respected. Feature is dev-tooling with a security-relevant side: FIDO2 `origin` must be kept in sync with the LAN IP during development.

## Project Structure

### Documentation (this feature)

```text
specs/003-local-network-dev/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code Changes

```text
.                                    # Root
├── package.json                     # ADD: setup:network script
├── scripts/
│   └── setup-network.js             # NEW: IP detection + env file writer
│
├── api/
│   ├── .env.local                   # WRITTEN by setup-network.js (gitignored)
│   └── src/
│       ├── main.ts                  # MODIFY: explicit listen(port, '0.0.0.0')
│       └── config/
│           ├── configuration.ts     # MODIFY: add APP_HOST env var
│           └── configuration.service.ts  # MODIFY: add appHost getter
│
└── mobile/
    ├── app.config.js                # NEW: dynamic config reading EXPO_PUBLIC_API_URL
    └── .env.local                   # WRITTEN by setup-network.js (gitignored)
```

**Structure Decision**: Monorepo with root-level `scripts/` directory for developer utilities. No changes to `api/src` architecture beyond explicit host binding. No changes to `mobile/src/services/api/client.ts` — it already reads `Constants.expoConfig?.extra?.apiBaseUrl`.

## Phase 0: Research

**Objective**: Confirm technical decisions for IP detection, Expo env config, and FIDO2 origin alignment.

**Options Evaluated**: See `research.md`

**Decision**: Node.js `os.networkInterfaces()` for IP detection; `app.config.js` for Expo env wiring; `APP_HOST=0.0.0.0` explicit in API.

## Phase 1: Design

**Key Decisions**:

1. **IP Script**: `scripts/setup-network.js` — Node.js stdlib only (`os`, `fs`); writes two env files; prioritizes non-internal IPv4 on WiFi/Ethernet; exits non-zero with clear message if no suitable interface found.

2. **Env File Targets**:
   - `api/.env.local` — written with `APP_HOST=0.0.0.0` and `ORIGIN=http://<ip>:3000`
   - `mobile/.env.local` — written with `EXPO_PUBLIC_API_URL=http://<ip>:3000`
   - Both already covered by `.gitignore` (`*/node_modules` + `.env.local` patterns)

3. **Expo Config**: `mobile/app.config.js` reads `process.env.EXPO_PUBLIC_API_URL` and spreads it into `extra.apiBaseUrl`. Static fields merged from `app.json`. No changes to `client.ts`.

4. **API Binding**: `main.ts` updated to `app.listen(port, config.appHost)`. `configuration.ts` adds `APP_HOST` env var defaulting to `'localhost'` (safe default; dev sets `0.0.0.0` via `.env.local`).

5. **FIDO2 Alignment**: IP script writes `ORIGIN=http://<ip>:3000` to `api/.env.local` so FIDO2 origin verification matches the LAN URL during development. On production, `ORIGIN` env var is set to the production value separately.

6. **Root Command**: `"setup:network": "node scripts/setup-network.js"` added to root `package.json`.

7. **Start Warning**: Root `npm start` updated to run a pre-check: if `mobile/.env.local` is missing or `EXPO_PUBLIC_API_URL` is absent, print a one-line warning before starting services.

**Output Artifacts**:
- `scripts/setup-network.js`
- `mobile/app.config.js`
- Updated `api/src/main.ts`
- Updated `api/src/config/configuration.ts` + `configuration.service.ts`
- Updated root `package.json`
- `specs/003-local-network-dev/quickstart.md`
- `specs/003-local-network-dev/research.md`
