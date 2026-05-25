# Implementation Plan: Root Development Scripts

**Branch**: `002-root-dev-scripts` | **Date**: 2026-05-25 | **Spec**: [specs/002-root-dev-scripts/spec.md](spec.md)
**Input**: Feature specification from `/specs/002-root-dev-scripts/spec.md`

## Summary

Create centralized commands in the root `package.json` to start the mobile app and API server without navigating into subdirectories. Implement using npm workspaces and custom shell scripts with log prefixing. Fail-fast on startup errors, support concurrent execution, and provide individual service commands.

## Technical Context

**Language/Version**: Bash (POSIX-compatible shell) + Node.js npm
**Primary Dependencies**: npm (workspaces feature), existing API + mobile start scripts
**Storage**: N/A (dev tooling only)
**Testing**: No tests (per constitution III)
**Target Platform**: macOS/Linux terminal (Windows bonus, not required)
**Project Type**: Development utility / workspace orchestration
**Performance Goals**: Start-all command invocation to both services running < 5 seconds (SC-001)
**Constraints**: Must not require changes to api/ or mobile/ package.json files; must handle port conflicts gracefully (fail-fast)
**Scale/Scope**: 2 services (api, mobile), 4 npm scripts (start-all, start-api, start-mobile, install-all)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Compliance Assessment**:

| Principle | Applicability | Status | Notes |
|-----------|---------------|--------|-------|
| I. FIDO2-First Security | N/A | PASS | Not authentication-related; dev tooling only |
| II. Enterprise-Grade Architecture | YES | PASS | Clean shell scripts, proper error handling, no shortcuts |
| III. No Testing Implementations | YES | PASS | No test frameworks or mocks in scope |
| IV. Documentation-Driven Development | YES | PASS | Scripts will be documented in README or comments |
| V. Frontend/Backend Contract Alignment | N/A | PASS | Not applicable; dev utility |

**Gate Status**: ✅ **PASS** — Feature complies with constitution. Enterprise-Grade and Documentation-Driven principles apply; implementation must follow clean code practices and be well-documented.

## Project Structure

### Documentation (this feature)

```text
specs/002-root-dev-scripts/
├── plan.md              # This file
├── research.md          # Phase 0 output (script/tool selection)
├── quickstart.md        # Phase 1 output (how to use the scripts)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
.
├── package.json         # Root workspace definition + npm scripts
├── api/                 # Existing backend project
├── mobile/              # Existing mobile project
└── scripts/             # (Optional) Helper utilities if needed
```

**Structure Decision**: Root-level `package.json` with npm workspaces configured. No new source directories required. Implementation uses existing api/package.json and mobile/package.json start scripts via npm's workspace feature. Optional helper scripts in a top-level `scripts/` directory if shell script logic becomes complex (e.g., log prefixing utility).

## Phase 0: Research & Approach

**Objective**: Select the best approach for root-level service orchestration.

**Options Evaluated**:

1. **npm workspaces + concurrently library**: Leverage npm native workspaces, add concurrently for parallel execution
2. **Pure shell script (Bash)**: Write custom bash script with process management
3. **Makefile**: Use traditional make for task orchestration
4. **Custom Node.js orchestrator**: Write a Node.js script that spawns child processes

**Decision**: Option 1 (npm workspaces + concurrently)
- **Rationale**: npm workspaces is native to modern npm, concurrently is battle-tested and widely used, simple declarative approach in package.json, no custom scripting needed, good cross-platform support
- **Alternatives Rejected**:
  - Pure bash: More complex error handling, less portable across platforms
  - Makefile: Not idiomatic in Node.js ecosystem, requires Make installation
  - Node.js orchestrator: Overkill for two services, adds maintenance burden

## Phase 1: Design

**Key Decisions**:

1. **Log Prefixing**: Use concurrently's built-in `--prefix` feature or add simple grep/sed wrapper to prefix logs with service name + ANSI colors
2. **Fail-fast Behavior**: Both processes run concurrently; if either exits with non-zero code, kill all and exit with error
3. **Stop Behavior**: Ctrl+C (SIGINT) handled natively by concurrently — kills all child processes
4. **Dependencies**: Add `concurrently` as dev dependency in root package.json

**Output Artifacts**:
- Root `package.json` with workspace definition and npm scripts
- Updated `README.md` with usage instructions for new commands
- No additional source code files needed
