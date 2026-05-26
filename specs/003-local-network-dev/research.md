# Research: Local Network Development — API Exposure & IP Discovery

**Date**: 2026-05-25 | **Feature**: Local Network Dev | **Phase**: 0

---

## Decision 1: LAN IP Detection Method

### Decision
Use **Node.js `os.networkInterfaces()`** (stdlib, zero new dependencies) to enumerate network interfaces and select the first non-loopback, non-virtual IPv4 address with preference order: WiFi interface names first, then Ethernet.

### Rationale
- Zero-dependency: `os` is built into Node.js — no install step, no version pinning
- Cross-platform: works on macOS and Linux (both targeted)
- Deterministic: interface list is stable per network session; priority rule is codeable
- Fast: synchronous call, completes in < 1 ms

### Alternatives Considered

| Option | Rejected Because |
|--------|-----------------|
| Shell: `ipconfig getifaddr en0` (macOS) | macOS-only, not portable to Linux |
| Shell: `hostname -I` (Linux) | Linux-only, not portable to macOS |
| External package (`network`, `internal-ip`) | Adds a dependency for trivial functionality; `os` does the job |
| DNS lookup of hostname | Resolves to 127.0.0.1 on many machines, unreliable |

### Interface Priority Rule
```
Priority:
  1. Active, non-loopback IPv4 (family === 'IPv4', internal === false)
  2. Prefer interface names starting with: en0, en1, eth0, eth1, wlan0, wlan1, wi-fi
  3. Exclude: lo, lo0 (loopback), utun, vpn, bridge, vmnet, docker, veth
  4. First match wins
```

---

## Decision 2: Expo Environment Config Strategy

### Decision
Create **`mobile/app.config.js`** (dynamic config) that wraps the existing `app.json`, reads `EXPO_PUBLIC_API_URL` from the environment at start/build time, and exposes it via `extra.apiBaseUrl`. The existing `client.ts` already reads `Constants.expoConfig?.extra?.apiBaseUrl`, so **no changes to `client.ts` are needed**.

### Rationale
- `client.ts` is already wired correctly: `Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:3000'`
- `app.config.js` is the standard Expo pattern for dynamic configuration
- `EXPO_PUBLIC_API_URL` naming is consistent with Expo SDK 50+ conventions
- No `client.ts` modification → no risk of breaking existing interceptors or retry logic

### Current State vs Target State
| Layer | Current | After Feature |
|-------|---------|---------------|
| `mobile/.env.local` | Does not exist | `EXPO_PUBLIC_API_URL=http://<ip>:3432` (written by setup-network.js) |
| `mobile/app.config.js` | Does not exist | New file reading `EXPO_PUBLIC_API_URL` → `extra.apiBaseUrl` |
| `mobile/app.json` | Static, no `extra` field | Unchanged (app.config.js wraps it) |
| `mobile/src/services/api/client.ts` | Reads `extra.apiBaseUrl ?? 'http://localhost:3000'` | Unchanged |
| `mobile/.env` | Has `API_BASE_URL=http://localhost:3432` (unused by app) | Unchanged |

### Production Isolation
- `mobile/.env.local` is gitignored (`.env.local` in root `.gitignore`)
- `mobile/.env.production` (future) or EAS Build env vars provide `EXPO_PUBLIC_API_URL` for production builds
- When `EXPO_PUBLIC_API_URL` is absent, `app.config.js` passes `undefined` → `client.ts` falls back to `'http://localhost:3000'`

---

## Decision 3: API Bind Address

### Decision
Update `api/src/main.ts` to explicitly pass `'0.0.0.0'` as the bind host:
```ts
await app.listen(port, config.appHost);
```
Add `APP_HOST` env var to `configuration.ts` (default: `'localhost'`). The IP discovery script writes `APP_HOST=0.0.0.0` to `api/.env.local` to activate network binding.

### Rationale
- Currently `app.listen(port)` binds to `0.0.0.0` by default in Node.js/NestJS — but this is implicit behavior. Making it explicit and configurable is better for enterprise-grade architecture (Constitution II).
- Default `localhost` in `configuration.ts` means: **without running `setup:network`, the API stays localhost-only** — safer default.
- The script activates network exposure explicitly, not automatically on every dev start.

### Existing Port Discrepancy (Noted)
`api/.env` uses `APP_PORT=3432`, but `client.ts` fallback is `'http://localhost:3000'`. This pre-existing inconsistency is **out of scope** for this feature — the IP discovery script reads `APP_PORT` from `api/.env` at runtime to use the correct port.

---

## Decision 4: FIDO2 Origin Alignment

### Decision
The IP discovery script also writes `ORIGIN=http://<detected-ip>:<port>` to `api/.env.local`.

### Rationale
- NestJS FIDO2 service reads `ORIGIN` env var for WebAuthn `rpID` and expected origin validation
- When a physical device makes a WebAuthn request via `http://192.168.1.100:3432`, the `clientDataJSON.origin` will be that URL
- If `ORIGIN` still points to `localhost`, FIDO2 authentication will fail with origin mismatch
- Writing `ORIGIN` at the same time as `APP_HOST` keeps both values synchronized

---

## Decision 5: Target Env Files

### Decision
Script writes to `.env.local` files (not `.env`):
- `api/.env.local` — `APP_HOST` + `ORIGIN`
- `mobile/.env.local` — `EXPO_PUBLIC_API_URL`

### Rationale
- `.env` in both projects is used as the committed template (developer reference)
- `.env.local` is gitignored and machine-specific — correct target for auto-generated values
- Pattern: `process.env` loading order in NestJS ConfigModule: `.env.local` overrides `.env`
- Expo Metro bundler also loads `.env.local` with higher priority than `.env`

### NestJS ConfigModule Override Order
```
.env.local > .env.development.local > .env.development > .env
```
Writing to `.env.local` ensures it takes priority without touching the committed template.

---

## Decision 6: Port Detection in Script

### Decision
Script reads `APP_PORT` from `api/.env` using a simple line-by-line parser (no `dotenv` dependency needed — single regex match). Falls back to `3432` if not found.

### Rationale
- Avoids dependency on `dotenv` package in the script
- Simple enough: one `grep`-style parse of `APP_PORT=<value>` line
- Accurate: uses the project's configured port, not a hardcoded guess

---

## Root Command Name

### Decision
`npm run setup:network`

### Rationale
- Consistent with existing naming pattern in root `package.json` (`start`, `start:api`, `start:mobile`, `install:all`)
- Descriptive: setup = one-time/repeated config step; network = purpose
- `setup:network` follows the `<verb>:<noun>` convention used elsewhere
