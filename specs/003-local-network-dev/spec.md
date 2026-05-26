# Feature Specification: Local Network Development — API Exposure & IP Discovery

**Feature Branch**: `003-local-network-dev`
**Created**: 2026-05-25
**Status**: Draft
**Input**: User description: "I want my api exposed to network so my mobile device will also be connected as long they are on the same network. I would like also a command that generates automatically the ip address where backend can link and mobile can connect to, this is essential for local development. should have no problem when running to production for both ends."

## Overview

During local development, both the API server and mobile app run on the same developer's machine — but a physical mobile device cannot reach an API bound to `localhost` because localhost is private to the machine. This feature exposes the API to the developer's local network and provides a single command to detect the machine's current local IP address and configure both services to use it, so the mobile device can connect to the backend over WiFi without any manual IP entry.

In production, each service uses its own permanent URL. This feature must not interfere with or change any production configuration.

---

## User Scenarios*

### User Story 1 — Auto-Detect IP and Configure Both Services (Priority: P1)

As a developer working with a physical mobile device on the same WiFi network, I want to run a single command from the project root that detects my machine's local IP address and automatically configures both the API and mobile app to use it, so I can start development without manually looking up and typing my IP address.

**Why this priority**: This is the core pain point. Without automation, developers must manually find their IP, update environment files in two places, and restart services every time their IP changes. A single command eliminates all of this.

**Independent Test**: Run the IP discovery command from root. Start services with `npm start`. Open the mobile app on a physical device connected to the same WiFi — it successfully connects to the API without any manual configuration.

**Acceptance Scenarios**:

1. **Given** a developer is connected to a WiFi network, **When** they run the IP discovery command, **Then** their machine's local IP address is detected and written to the development configuration for both API and mobile.

2. **Given** the IP was previously configured, **When** the developer runs the IP discovery command again after their IP changed (e.g., reconnected to WiFi), **Then** the configuration is updated with the new IP and old values are overwritten.

3. **Given** the IP discovery command has been run, **When** the developer runs `npm start`, **Then** both services start using the configured local IP and a physical mobile device on the same WiFi network can reach the API.

4. **Given** the machine has multiple network interfaces (e.g., WiFi + Ethernet + VPN), **When** the IP discovery command runs, **Then** it selects the most appropriate LAN interface using a deterministic priority rule and reports which interface was chosen.

---

### User Story 2 — API Accessible from Local Network (Priority: P1)

As a developer, I want the API server to accept connections from any device on the local network — not just from the machine itself — so that my physical mobile device can make requests to it during development.

**Why this priority**: Even with the correct IP configured in mobile, the API must actually be listening on the network interface, not just on loopback. This is equally foundational; US1 and US2 together form the complete local dev solution.

**Independent Test**: Start the API server in development mode. From a separate device on the same WiFi, make an HTTP request to `http://<detected-ip>:<port>/health`. The request succeeds with a valid response.

**Acceptance Scenarios**:

1. **Given** the API is started in development mode, **When** a device on the same WiFi network sends a request to the API's local IP and port, **Then** the API responds normally.

2. **Given** the API is started in production mode, **When** deployed to a production server, **Then** the API uses its standard production bind configuration — the local network dev binding does not apply.

---

### User Story 3 — Production Builds Are Unaffected (Priority: P2)

As a developer shipping the mobile app or deploying the API to production, I want production builds and deployments to use permanent production URLs and not be affected by any local development IP configuration.

**Why this priority**: Safety requirement. Local dev configuration must be strictly isolated from production builds. A misconfiguration here would break the production app for all users.

**Independent Test**: Run the IP discovery command (modifying local dev config). Then create a production mobile build. Verify the embedded API URL is the production URL, not any local IP address.

**Acceptance Scenarios**:

1. **Given** a mobile production build is created, **When** the app starts on a user's device, **Then** it connects to the production API URL, not any local IP.

2. **Given** the IP discovery command has been run and modified local dev config, **When** a production mobile build is created, **Then** the production build is unaffected and still uses the production API URL.

3. **Given** the API is deployed to a production server, **When** it starts, **Then** it uses its standard production configuration — no local dev IP settings apply.

---

### Edge Cases

- What happens when the machine has no active WiFi or Ethernet connection when the command runs? → Command exits with a clear error: "No suitable LAN network interface found. Please connect to a WiFi or Ethernet network and retry."
- What happens when multiple network interfaces are active simultaneously (WiFi + Ethernet + VPN)? → Command selects using priority: active WiFi first, then Ethernet, excluding loopback (127.x.x.x) and virtual/tunnel interfaces.
- What happens if the developer runs `npm start` without running the IP discovery command first? → Services start but mobile app may fail to connect. The start command displays a warning if no local IP is configured in the dev environment file.
- What happens if the configured IP becomes stale (developer switched networks mid-session)? → Mobile app requests fail with connection errors; developer re-runs the IP discovery command to refresh the config.
- What happens if the mobile `.env` development file does not exist yet? → The IP discovery command creates it with the detected IP entry.
- What happens if the API port is already in use when starting with network binding? → Standard port-conflict error from the service; no special handling needed beyond what already exists.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a single root-level command (`npm run setup:network` or equivalent) that detects the developer's current local area network IP address automatically.
- **FR-002**: System MUST write the detected local IP to the API's development environment configuration so the API binds to that address on startup.
- **FR-003**: System MUST write the detected local IP to the mobile app's development environment file as `EXPO_PUBLIC_API_URL=http://<local-ip>:<port>`, so the mobile app uses it as the API base URL.
- **FR-004**: The API MUST bind to a network-accessible address in development mode, allowing devices on the same LAN to connect to it.
- **FR-005**: The mobile app MUST be updated to read its API base URL from the `EXPO_PUBLIC_API_URL` environment variable (currently hardcoded — this feature adds that wiring).
- **FR-005a**: Once wired, the mobile app MUST use `EXPO_PUBLIC_API_URL` as its API base URL, falling back to the production URL when the variable is absent.
- **FR-006**: In production mode, the mobile app MUST use the production API URL — local IP configuration must not be applied.
- **FR-007**: In production mode, the API MUST use its standard production bind configuration — local dev network settings must not apply.
- **FR-008**: When multiple network interfaces are present, the IP discovery command MUST select the most appropriate LAN interface using a documented priority rule (WiFi preferred over Ethernet; loopback and virtual interfaces excluded).
- **FR-009**: If no suitable network interface is found, the command MUST exit with a non-zero code and a human-readable error message.
- **FR-010**: The IP discovery command MUST overwrite any previously written local IP values (idempotent — safe to re-run).

### Key Entities

- **Local IP Address**: The IPv4 address of the developer's machine on the current LAN; detected at command runtime; written to development environment files only.
- **Development Environment File**: Per-service configuration file (excluded from source control) that holds local-only settings such as the API host; distinct from production environment files.
- **API Bind Address**: The address the API server listens on; set to a network-accessible value in development, standard production value otherwise.
- **Mobile API Base URL**: The URL prefix the mobile app uses for all API requests; sourced from the `EXPO_PUBLIC_API_URL` environment variable; set to `http://<local-ip>:<port>` in development mode via the IP discovery command; set to the production HTTPS URL via production build environment config.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer runs one command and can connect a physical mobile device to the local API within 30 seconds — no manual IP lookup, file editing, or service restart required beyond `npm start`.
- **SC-002**: IP discovery and environment file update completes in under 5 seconds on any supported development machine.
- **SC-003**: Re-running the command after a network change takes effect on the next `npm start` — no additional manual steps needed.
- **SC-004**: 100% of production builds and deployments connect to the production API URL; zero instances of a local IP address appearing in production configuration.
- **SC-005**: The IP discovery command works correctly on both macOS and Linux development machines.

---

## Assumptions

- Developers work on macOS or Linux; Windows support is out of scope for v1.
- The local network uses standard IPv4 addressing (192.168.x.x, 10.x.x.x, or 172.16–31.x.x LAN ranges).
- Both the developer's machine and the mobile device are connected to the same WiFi access point, with client-to-client communication allowed (no network isolation / AP isolation).
- The mobile app currently has its API base URL hardcoded; this feature adds the environment config wiring so the IP discovery command can control it.
- The API already supports a configurable port (defaulting to 3000) and can be configured to bind to a specific network address.
- The production API URL is a stable, separate value (e.g., `https://api.example.com`) that exists independently of any local dev setup.
- Environment files containing local IPs (`.env`, `.env.local`, etc.) are already in `.gitignore` and will not be committed to source control.
- The IP discovery command is a developer utility only — it is never invoked in CI/CD pipelines or production deployments.
- Developers manually re-run the IP command when their network IP changes; automatic re-detection on network change events is out of scope.

## Clarifications

### Session 2026-05-25

- Q: Should the IP discovery command also restart services after updating config? → A: No — it only updates config files. Developer runs `npm start` separately, which picks up the new values.
- Q: Should dev vs prod mode be auto-detected by the app, or driven by a build/environment flag? → A: Driven by existing build/environment configuration (e.g., `APP_ENV` or `NODE_ENV`); runtime auto-detection is out of scope.
- Q: Does the mobile app currently read its API base URL from environment config, or must this feature add that capability? → A: Not yet — the API URL is currently hardcoded. This feature must also wire up the mobile app to read from an environment config variable (FR-005 updated accordingly).
- Q: What environment variable name should the mobile app use for the API base URL? → A: `EXPO_PUBLIC_API_URL` — Expo's standard convention for runtime-accessible public variables embedded at build time (FR-003, FR-005, Key Entities updated).
