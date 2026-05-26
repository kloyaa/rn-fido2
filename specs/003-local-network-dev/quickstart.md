# Quickstart: Local Network Development — API Exposure & IP Discovery

**Feature**: Local Network Dev | **Date**: 2026-05-25

## Overview

This feature allows you to connect a physical mobile device to your local development API over WiFi, without manually looking up your IP address or editing environment files. One command detects your machine's local IP and configures both services.

## Prerequisites

- Developer machine and mobile device on the same WiFi network
- `npm install` run at project root (to have `concurrently` available)
- `pnpm install` run in `api/` (to have NestJS dependencies)
- `npm install` run in `mobile/` (to have Expo dependencies)

---

## Setup — One-Time (or After IP Changes)

Run from project root:

```bash
npm run setup:network
```

**What it does**:
1. Detects your machine's local LAN IP address (e.g., `192.168.1.100`)
2. Writes `APP_HOST=0.0.0.0` and `ORIGIN=http://192.168.1.100:3432` to `api/.env.local`
3. Writes `EXPO_PUBLIC_API_URL=http://192.168.1.100:3432` to `mobile/.env.local`
4. Prints confirmation with the detected IP and both files written

**Example output**:
```
[setup:network] Detected LAN IP: 192.168.1.100 (interface: en0)
[setup:network] Written: api/.env.local  → APP_HOST=0.0.0.0 | ORIGIN=http://192.168.1.100:3432
[setup:network] Written: mobile/.env.local → EXPO_PUBLIC_API_URL=http://192.168.1.100:3432
[setup:network] ✓ Done. Run "npm start" to start all services.
```

---

## Start Development

```bash
npm start
```

Both the API and mobile Expo server start concurrently. If `mobile/.env.local` is missing or `EXPO_PUBLIC_API_URL` is not set, a warning is printed:

```
[warn] EXPO_PUBLIC_API_URL is not configured. Physical devices may not connect.
       Run "npm run setup:network" first.
```

---

## Connect Your Mobile Device

1. Scan the QR code shown in the Expo output with **Expo Go** on your device
2. The mobile app uses `EXPO_PUBLIC_API_URL` → `http://192.168.1.100:3432` to reach the API
3. Make sure your device and laptop are on the same WiFi network

---

## Re-Run After IP Changes

If your laptop reconnects to WiFi and gets a new IP:

```bash
npm run setup:network
npm start
```

The script overwrites the old IP values. No other steps needed.

---

## How Each Service Uses the Config

### API (`api/`)

`api/.env.local` is loaded by NestJS `ConfigModule` with priority over `api/.env`.

| Variable | Value Written | Effect |
|----------|---------------|--------|
| `APP_HOST` | `0.0.0.0` | API binds to all interfaces (accessible on LAN) |
| `ORIGIN` | `http://<ip>:3432` | FIDO2 origin verification matches the physical device's requests |

### Mobile (`mobile/`)

`mobile/.env.local` is loaded by Expo Metro bundler. `mobile/app.config.js` reads `EXPO_PUBLIC_API_URL` and passes it as `extra.apiBaseUrl` to the app.

| Variable | Value Written | Effect |
|----------|---------------|--------|
| `EXPO_PUBLIC_API_URL` | `http://<ip>:3432` | `client.ts` uses this URL as the API base |

---

## Production Safety

- `api/.env.local` and `mobile/.env.local` are gitignored — they never go into source control
- Production API URL is set via EAS Build environment variables, not `.env.local`
- Running `npm run setup:network` in CI/CD would produce an error ("No suitable LAN interface found") — by design, it's dev-only

---

## Troubleshooting

### "No suitable LAN interface found"

**Cause**: Machine is not connected to a WiFi or Ethernet network.

**Fix**: Connect to WiFi and re-run `npm run setup:network`.

### Mobile device can't reach the API

1. Confirm both devices are on the same WiFi network
2. Re-run `npm run setup:network` to get a fresh IP
3. Restart Expo: `npm run start:mobile` or `npm start`
4. Verify there is no AP isolation on your router (enterprise routers may block client-to-client traffic)

### Wrong IP detected (VPN active)

**Cause**: VPN interface has higher priority than WiFi in interface enumeration.

**Fix**: Disconnect from VPN, re-run `npm run setup:network`, then reconnect VPN if needed (VPN and WiFi may conflict for local dev).

### FIDO2 authentication fails on device

**Cause**: `ORIGIN` in `api/.env.local` is stale or wrong.

**Fix**: Re-run `npm run setup:network` — it rewrites `ORIGIN` along with `APP_HOST`.

---

## Files Written by `setup:network`

| File | Status | Gitignored |
|------|--------|------------|
| `api/.env.local` | Created/Overwritten | ✅ Yes |
| `mobile/.env.local` | Created/Overwritten | ✅ Yes |

These files are **never committed**. If they don't exist, the services fall back to localhost defaults.
