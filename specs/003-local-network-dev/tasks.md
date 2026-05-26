# Tasks: Local Network Development — API Exposure & IP Discovery

**Feature**: Local Network Dev | **Branch**: `003-local-network-dev` | **Total Tasks**: 15
**Input**: Design documents from `specs/003-local-network-dev/`

## Implementation Strategy

**MVP Scope**: Phase 2 (Foundational) + Phase 3 (US1) + Phase 4 (US2) — delivers the complete working solution. US3 and Polish add safety rails and docs.

**Incremental Delivery**:
1. Phase 1–2: API config wiring (enables network binding) — 4 tasks
2. Phase 3: IP discovery script + root command (US1) — 6 tasks
3. Phase 4: Mobile Expo config wiring (US2) — 1 task
4. Phase 5: Production safety + developer warning (US3) — 2 tasks
5. Phase 6: Polish & documentation — 2 tasks

**No new dependencies**: Script uses Node.js `os` + `fs` (stdlib only).

---

## Phase 1: Setup

**Goal**: Create the scripts directory structure at project root.

### Independent Test Criteria
- `scripts/` directory exists at project root
- Root `package.json` has `setup:network` script pointing to `scripts/setup-network.js`

### Tasks

- [x] T001 Create `scripts/` directory at project root

---

## Phase 2: Foundational — API Network Bind Configuration

**Goal**: Wire `APP_HOST` into NestJS config system so the API can bind to a configurable address. This must complete before US2 is testable.

**⚠️ CRITICAL**: Phases 3–5 depend on this completing first.

### Independent Test Criteria
- `npm run build` in `api/` compiles without TypeScript errors
- `ConfigurationService.appHost` returns the value of `APP_HOST` env var (default `'localhost'`)
- `main.ts` calls `app.listen(port, host)` with both arguments

### Tasks

- [x] T002 [P] Add `APP_HOST` env var to `api/src/config/configuration.ts` — add `host: process.env.APP_HOST ?? 'localhost'` to the `app` config block
- [x] T003 [P] Add `appHost` getter to `api/src/config/configuration.service.ts` — `get appHost(): string { return this.config.get<string>('app.host')!; }`
- [x] T004 Update `api/src/main.ts` — change `await app.listen(port)` to `await app.listen(port, config.appHost)` using the injected `ConfigurationService`

---

## Phase 3: User Story 1 — IP Discovery Script (Priority: P1) 🎯 MVP

**Goal**: Create `scripts/setup-network.js` that detects the LAN IP and writes both `.env.local` files. Add the root command.

### Independent Test Criteria
- `npm run setup:network` completes without error
- `api/.env.local` is created/overwritten with `APP_HOST=0.0.0.0` and `ORIGIN=http://<ip>:3432`
- `mobile/.env.local` is created/overwritten with `EXPO_PUBLIC_API_URL=http://<ip>:3432`
- Running the command a second time overwrites values (idempotent)
- Running with no LAN connection exits with code 1 and prints a clear error

### Tasks

- [x] T005 [US1] Create `scripts/setup-network.js` — implement LAN IP detection using `os.networkInterfaces()`: iterate all interfaces, filter `family === 'IPv4'` and `internal === false`, prefer names matching `/^(en\d|eth\d|wlan\d|wi-fi)/i`, exclude names matching `/^(lo|utun|vpn|bridge|vmnet|docker|veth)/i`; store first matched IP or `null`
- [x] T006 [P] [US1] Add port detection to `scripts/setup-network.js` — read `APP_PORT` from `api/.env` by parsing the file line-by-line for `APP_PORT=<value>`; fall back to `3432` if file absent or key not found
- [x] T007 [P] [US1] Add `api/.env.local` writer to `scripts/setup-network.js` — write/overwrite `api/.env.local` with two lines: `APP_HOST=0.0.0.0` and `ORIGIN=http://<detectedIp>:<port>`; create file if absent
- [x] T008 [P] [US1] Add `mobile/.env.local` writer to `scripts/setup-network.js` — write/overwrite `mobile/.env.local` with one line: `EXPO_PUBLIC_API_URL=http://<detectedIp>:<port>`; create file if absent
- [x] T009 [US1] Add error handling and confirmation output to `scripts/setup-network.js` — if no suitable interface found, print `[setup:network] Error: No suitable LAN interface found. Please connect to WiFi or Ethernet.` and `process.exit(1)`; on success, print detected IP, interface name, and both files written
- [x] T010 [P] [US1] Add `"setup:network": "node scripts/setup-network.js"` to root `package.json` scripts section

---

## Phase 4: User Story 2 — Mobile Expo Config Wiring (Priority: P1)

**Goal**: Create `mobile/app.config.js` so the Expo app reads `EXPO_PUBLIC_API_URL` from the environment and passes it to `client.ts` via `Constants.expoConfig.extra.apiBaseUrl`.

### Independent Test Criteria
- `mobile/app.config.js` exports a function accepting `{ config }` and returns the config augmented with `extra.apiBaseUrl`
- When `EXPO_PUBLIC_API_URL=http://192.168.1.100:3432` is set, `Constants.expoConfig.extra.apiBaseUrl` equals that value in the running Expo app
- When `EXPO_PUBLIC_API_URL` is absent, `extra.apiBaseUrl` is `undefined` and `client.ts` falls back to `'http://localhost:3432'`

### Tasks

- [x] T011 [US2] Create `mobile/app.config.js` — export a function `({ config }) => ({ ...config, extra: { ...(config.extra || {}), apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || undefined } })`; this wraps static `app.json` (Expo merges them automatically) and exposes `apiBaseUrl` via `Constants.expoConfig.extra`

---

## Phase 5: User Story 3 — Production Safety & Developer Warning (Priority: P2)

**Goal**: Ensure production builds are unaffected by local IP config, and developers are warned if they start services without running `setup:network` first.

### Independent Test Criteria
- Building the mobile app without `mobile/.env.local` does not embed any local IP (`EXPO_PUBLIC_API_URL` absent → `extra.apiBaseUrl` is `undefined`)
- Running `npm start` without `mobile/.env.local` present prints a warning but still starts services
- Running `npm start` with `mobile/.env.local` present starts silently without the warning

### Tasks

- [x] T012 [P] [US3] Update `mobile/app.config.js` — verify and document the production safety: add a comment block explaining that `EXPO_PUBLIC_API_URL` is set via `mobile/.env.local` for local dev and via EAS Build env vars for production; when absent, `apiBaseUrl` is `undefined` and `client.ts` uses its built-in fallback
- [x] T013 [US3] Update root `package.json` — change `start` script to: `"node -e \"const fs=require('fs');if(!fs.existsSync('mobile/.env.local'))console.warn('[warn] EXPO_PUBLIC_API_URL not set. Run npm run setup:network for physical device support.');\" && concurrently --names \"api,mobile\" --prefix \"[{name}]\" --color \"npm run start:api\" \"npm run start:mobile\""`

---

## Phase 6: Polish & Documentation

**Goal**: Document the new command in the project README.

### Tasks

- [x] T014 [P] Update root `README.md` — add `npm run setup:network` to the Available Commands section with a description: "Detect local IP and configure API + mobile for physical device connection"
- [x] T015 Update `mobile/.env` — add `EXPO_PUBLIC_API_URL=` as a commented template line with instructions pointing developers to run `npm run setup:network`

---

## Task Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational — API config)
    ↓
Phase 3 (US1 — IP discovery script) ──┐
    ↓                                  │ can run in parallel after Phase 2
Phase 4 (US2 — Mobile config) ─────────┘
    ↓
Phase 5 (US3 — Production safety)
    ↓
Phase 6 (Polish)
```

> **Note**: Phase 3 (US1) and Phase 4 (US2) BOTH depend on Phase 2. T011 (US2) does NOT depend on T005–T009 (US1) — they can run in parallel after Phase 2 completes.

---

## Parallel Execution Examples

**Within Phase 2 (after T001)**:
```
T002 [API config.ts]  ──┐
T003 [service.ts]     ──┤ all parallel
                         └→ T004 [main.ts] (depends on T002/T003)
```

**After Phase 2 (T002–T004 complete)**:
```
T005 → T006, T007, T008 (T006/T007/T008 parallel after T005)
     → T009 (depends on T005–T008)
     → T010 (independent of script content)

T011 [mobile/app.config.js] — independent of T005–T010
```

**Within Phase 6**:
```
T014 [README.md]  ──┐ parallel
T015 [mobile/.env] ─┘
```

---

## MVP Checklist

✅ **Phase 1**: Setup (1 task)
✅ **Phase 2**: API Bind Config (3 tasks) ← **Foundational**
✅ **Phase 3**: US1 — IP Discovery Script (6 tasks) ← **Core feature**
✅ **Phase 4**: US2 — Mobile Config Wiring (1 task) ← **Completes the circuit**
⏳ **Phase 5**: US3 — Production Safety (2 tasks) ← Safety rails
⏳ **Phase 6**: Polish (2 tasks) ← Documentation

**MVP Definition**: Phases 1–4 complete = developer runs `npm run setup:network` + `npm start` and physical device connects to API. Delivers FR-001 through FR-005a.

**Post-MVP**: Phase 5 adds production isolation guarantees and dev warning. Phase 6 adds documentation.
