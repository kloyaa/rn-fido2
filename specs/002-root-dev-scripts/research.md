# Research: Root Development Scripts

**Date**: 2026-05-25 | **Feature**: Root Development Scripts | **Phase**: 0

## Decision: Approach for Multi-Service Orchestration

### Decision
Use **npm workspaces + `concurrently` library** for starting multiple services from root.

### Rationale

1. **Native npm Integration**: npm workspaces are built into npm 7+ and require minimal configuration
2. **Battle-Tested Concurrency**: `concurrently` is the industry-standard Node.js tool for running multiple processes in parallel, with excellent process management and signal handling
3. **Log Prefixing**: `concurrently` has built-in `--prefix` option that labels each process output with a configurable prefix (supports ANSI colors)
4. **Error Handling**: Supports fail-fast behavior — if any process exits with non-zero code, can be configured to stop all others
5. **Cross-Platform**: Works on macOS, Linux, and Windows (meets future extensibility needs)
6. **No Custom Scripting**: Declarative npm scripts in package.json — no shell script maintenance burden
7. **Active Ecosystem**: Well-maintained, widely adopted in the Node.js community, minimal security risk

### Alternatives Considered

#### 1. Pure Bash Script
```bash
# Pseudocode
#!/bin/bash
(cd api && npm run start:dev) &
API_PID=$!
(cd mobile && npm run start:dev) &
MOBILE_PID=$!
wait $API_PID $MOBILE_PID
```

**Why Rejected**:
- Complex signal handling for Ctrl+C across multiple backgrounded processes
- Less portable (different shells behave differently)
- Log output not easily distinguishable without post-processing
- Requires custom error handling for exit codes
- Maintenance burden for edge cases (zombie processes, timing issues)

#### 2. Makefile
```makefile
.PHONY: start-all
start-all:
	$(MAKE) -j start-api start-mobile
```

**Why Rejected**:
- Not idiomatic in Node.js / npm ecosystem
- Requires Make installation (not guaranteed on all machines)
- Less integrated with npm workflow
- Developers less familiar with Makefiles in modern Node.js projects

#### 3. Custom Node.js Orchestrator
```javascript
// scripts/orchestrate.js
const { spawn } = require('child_process');
// ... custom process management logic
```

**Why Rejected**:
- Overkill for two services
- Adds maintenance burden (bug fixes, platform-specific behavior)
- Reinvents the wheel (concurrently already exists and is mature)
- Adds a custom script dependency

### Implementation Approach

**Dependencies**:
- Add `concurrently` as a dev dependency: `npm install --save-dev concurrently`

**Root package.json Scripts**:
```json
{
  "scripts": {
    "start": "concurrently --names \"api,mobile\" --prefix \"[{name}]\" --color \"npm run start:api\" \"npm run start:mobile\"",
    "start:api": "cd api && pnpm run start:dev",
    "start:mobile": "cd mobile && npm run start:dev",
    "install:all": "cd api && pnpm install && cd ../mobile && npm install"
  }
}
```

> **Note**: `npm --workspace=` syntax was avoided because `api/` uses pnpm (has `pnpm-lock.yaml`) and `mobile/` uses npm. npm's workspace resolver crashes when it encounters pnpm's `.pnpm` node_modules structure. Direct `cd` invocations are equivalent and avoid the conflict.

**Log Output Format**:
- concurrently's `--prefix` option: `[{name}]` prefix for each service
- `--color` flag: Enables ANSI colors for service distinction
- Example output:
  ```
  [api] [15:32:45] Starting NestJS server...
  [mobile] [15:32:46] Starting Expo...
  [api] [15:32:48] Server running on http://localhost:3000
  [mobile] [15:32:52] Packager ready on port 8081
  ```

### Success Metrics

- ✅ Start-all command works from project root
- ✅ API and mobile services start concurrently
- ✅ Log output is prefixed and colored for clarity
- ✅ Ctrl+C stops all services cleanly
- ✅ If one service fails, all stop (fail-fast)
- ✅ No changes required to api/package.json or mobile/package.json
