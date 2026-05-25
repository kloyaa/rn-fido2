# Feature Specification: Root Development Scripts

**Feature Branch**: `002-root-dev-scripts`
**Created**: 2026-05-25
**Status**: Draft
**Input**: User description: "I would like to have a centralize command in our root, that runs mobile and api, so we do not have to do 'cd mobile/api' all the time"

## User Scenarios

### User Story 1 - Start all services from root (Priority: P1)

A developer wants to start both the mobile app and the API server with a single command from the project root, without navigating into subdirectories.

**Why this priority**: This is the core need — eliminating the friction of running multiple terminal sessions or repeatedly using `cd`.

**Independent Test**: Can be fully tested by running a single command from the project root and verifying both the API server and the mobile app start successfully.

**Acceptance Scenarios**:

1. **Given** a developer is at the project root, **When** they run the start-all command, **Then** both the API server and the mobile development server start concurrently.
2. **Given** both services are running, **When** one service fails or is stopped, **Then** the other service continues running (services are independent).
3. **Given** a developer is at the project root, **When** they run the start-all command, **Then** both services output their logs clearly, distinguishable by label or color.

---

### User Story 2 - Start services individually from root (Priority: P2)

A developer wants to start only the API or only the mobile app from the root, without navigating into the respective subdirectory.

**Why this priority**: Developers often work on one service at a time and need the flexibility to start them independently.

**Independent Test**: Can be tested by running the API-only or mobile-only root command and confirming only the target service starts.

**Acceptance Scenarios**:

1. **Given** a developer is at the project root, **When** they run the API-only command, **Then** only the API server starts.
2. **Given** a developer is at the project root, **When** they run the mobile-only command, **Then** only the mobile development server starts.

---

### Edge Cases

- When a port is already in use for one of the services: The startup fails and all services are stopped (fail-fast behavior per FR-001).
- When a dependency (node_modules) is not installed in a subdirectory: The startup fails and all services are stopped; developer must run the install-all command (FR-006) first.
- Stopping all running services: Pressing Ctrl+C stops all services cleanly (FR-007).

## Requirements

### Functional Requirements

- **FR-001**: The root must expose a command that starts both the API and mobile services concurrently. If either service fails to start, all services must be stopped and the command must exit with an error.
- **FR-002**: The root must expose a command that starts only the API service.
- **FR-003**: The root must expose a command that starts only the mobile service.
- **FR-004**: Each service's log output must be prefixed with its service name in brackets with ANSI color (e.g., `[api]` in blue, `[mobile]` in green) so developers can distinguish which service produced a given log line.
- **FR-005**: Starting services from root must behave identically to running the existing start commands from within each subdirectory.
- **FR-006**: The root must expose a command to install dependencies for all workspaces in a single step.
- **FR-007**: Pressing Ctrl+C in the terminal must cleanly stop all running services.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A developer can start all services with one command from the project root in under 5 seconds of command invocation.
- **SC-002**: Log output from each service is prefixed with colored service name brackets (e.g., `[api]` in blue, `[mobile]` in green), allowing visual distinction of service logs.
- **SC-003**: Individual service commands work correctly — running the API-only command does not start the mobile service, and vice versa.
- **SC-004**: The number of steps to start the full development environment is reduced from 4+ steps (open terminal, cd, run, repeat) to 1 step.
- **SC-005**: If either service fails to start, the startup exits with an error and all services are stopped.

## Assumptions

- Developers have Node.js and the necessary package manager already installed globally.
- Both the `api/` and `mobile/` directories already have their own valid start scripts defined.
- The solution runs in a standard terminal on macOS/Linux (Windows compatibility is a bonus, not a requirement).
- No changes are required to the individual `api/` or `mobile/` package configurations.

## Clarifications

### Session 2026-05-25

- Q: Service failure behavior — should one service failure stop all or continue others? → A: Fail-fast — if any service fails to start, stop all services and exit with error.
- Q: Log output format for distinguishability → A: Service name in brackets with ANSI color (e.g., `[api]` in blue, `[mobile]` in green).
- Q: How to stop all running services cleanly? → A: Standard Ctrl+C behavior — pressing Ctrl+C in the terminal stops all services.
