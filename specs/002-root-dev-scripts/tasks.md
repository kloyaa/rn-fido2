# Tasks: Root Development Scripts

**Feature**: Root Development Scripts | **Branch**: `002-root-dev-scripts` | **Total Tasks**: 17

## Implementation Strategy

**MVP Scope**: Complete US1 (Start all services from root) + foundational setup. This alone delivers core value.

**Incremental Delivery**:
1. Phase 1-2: Setup foundation (dependencies, workspace config) — 3 tasks
2. Phase 3: US1 implementation (start-all with log prefixing) — 6 tasks
3. Phase 4: US2 implementation (individual start commands) — 3 tasks
4. Phase 5: Polish & documentation — 2 tasks

**Parallel Opportunities**: US2 tasks (T010-T012) can run in parallel with US1 testing after foundational setup completes.

> **Implementation Note**: `api/` uses pnpm and `mobile/` uses npm. npm workspaces is not used to avoid resolver conflicts. Scripts use direct path invocations (`cd api && pnpm run start:dev`) instead of `npm --workspace=` syntax.

---

## Phase 1: Setup

**Prerequisite**: The `api/` and `mobile/` subdirectories must exist with `package.json` files. Both must have a `start:dev` script configured (if not, they should be added as part of api/ and mobile/ project setup).

**Goal**: Install dependencies and establish workspace configuration.

### Independent Test Criteria
- Root `package.json` exists with concurrently dependency
- `npm install` succeeds and concurrently is available in node_modules

### Tasks

- [x] T001 Install concurrently dependency in root package.json
- [x] T002 Create root package.json with scripts configuration for api/ and mobile/
- [x] T003 Verify setup: `node_modules/.bin/concurrently --version` returns version number

---

## Phase 2: Foundational

**Goal**: Verify existing service start commands work from their own directories.

### Independent Test Criteria
- `api/` has `start:dev` script (pnpm run start:dev works in api/)
- `mobile/` has `start:dev` script (npm run start:dev works in mobile/)
- Both services use their existing start scripts unchanged

### Tasks

- [x] T004 Verify api/package.json has `start:dev` script configured
- [x] T005 Add `start:dev` alias to mobile/package.json pointing to `expo start`
- [x] T006 Verify root scripts invoke correct commands: `cd api && pnpm run start:dev` and `cd mobile && npm run start:dev`

---

## Phase 3: User Story 1 - Start All Services from Root (Priority: P1)

**Goal**: Implement single command to start both API and mobile concurrently with colored log output.

### Independent Test Criteria
- `npm start` launches both services concurrently
- Log output shows `[api]` prefix in blue and `[mobile]` prefix in green
- If either service fails to start, both are stopped and process exits with error code
- Ctrl+C cleanly terminates all child processes
- Command completes within 5 seconds from invocation to both services ready (SC-001)

### Tasks

- [x] T007 [P] [US1] Add `start` script to root package.json using concurrently with `--names "api,mobile"`
- [x] T008 [P] [US1] Configure concurrently `--prefix "[{name}]"` and `--color` options for log output prefixing
- [ ] T009 [P] [US1] Test `npm start` launches both services with colored log prefixes (manual verification)
- [ ] T010 [US1] Test fail-fast behavior: kill one service and verify both stop (manual verification)
- [ ] T011 [US1] Test Ctrl+C cleanly terminates all processes without hanging (manual verification)
- [ ] T012 [US1] Verify startup time is under 5 seconds from command to both services ready (SC-001) (manual verification)

---

## Phase 4: User Story 2 - Start Services Individually from Root (Priority: P2)

**Goal**: Implement separate commands to start only API or only mobile from root.

### Independent Test Criteria
- `npm run start:api` starts only API server
- `npm run start:mobile` starts only mobile development server
- Running start-api does NOT start mobile (and vice versa)
- Individual start commands work identically to running from within subdirectories (FR-005)

### Tasks

- [x] T013 [P] [US2] Add `start:api` script to root package.json: `cd api && pnpm run start:dev`
- [x] T014 [P] [US2] Add `start:mobile` script to root package.json: `cd mobile && npm run start:dev`
- [ ] T015 [US2] Test `npm run start:api` starts only API without starting mobile (manual verification)

---

## Phase 5: Polish & Documentation

**Goal**: Document the new commands and provide user guidance.

### Tasks

- [x] T016 Add `install:all` script to root package.json: `cd api && pnpm install && cd ../mobile && npm install`
- [x] T017 Create README.md with usage section documenting new npm scripts (start, start:api, start:mobile, install:all)

---

## Task Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ├→ Phase 3 (US1)
    │   └→ Phase 5 (Polish)
    └→ Phase 4 (US2) [can run in parallel with US3 testing]
```

## Parallel Execution Examples

**After Phase 2 completes**: Phase 3 (T007-T012) and Phase 4 (T013-T015) can run in parallel as they modify different parts of package.json.

**Within Phase 3**: T007-T009 are parallelizable (different script definitions); T010-T012 must run sequentially after T009 completes.

---

## MVP Checklist

✅ **Phase 1**: Setup (3 tasks)  
✅ **Phase 2**: Foundational (3 tasks)  
✅ **Phase 3**: US1 - Start all services (T007-T008 complete; T009-T012 require manual run)  
✅ **Phase 4**: US2 - Start individually (T013-T014 complete; T015 requires manual run)  
✅ **Phase 5**: Polish (2 tasks)

**MVP Definition**: Phases 1-3 complete = developers can start all services with `npm start` from root. This delivers the core value (FR-001, FR-004, FR-007).

**Pending manual verification**: T009-T012, T015 — run `npm start`, `npm run start:api`, and `npm run start:mobile` to confirm runtime behavior.
