# Research: Production-Grade FIDO2 Authentication System

**Phase**: Phase 0 Research  
**Date**: 2026-05-25  
**Status**: Complete  

## FIDO2/WebAuthn Implementation Libraries

### Decision: @simplewebauthn Suite

**Backend Library**: `@simplewebauthn/server`  
**Mobile Library**: `expo-web-authn` + platform-specific bridges  

**Rationale**:
- @simplewebauthn/server is the gold-standard FIDO2 library for Node.js backends
- Actively maintained, FIDO2 Alliance certified patterns
- Handles all ceremony logic (challenge generation, attestation verification, challenge verification)
- Clear error handling for tampered authenticators, expired challenges, replay attempts
- Well-documented API; integrates cleanly with NestJS services

**Alternatives Considered**:
- `fido2-lib`: Lower-level, requires manual ceremony orchestration (rejected: more complexity, higher error risk)
- `cbor2` (CBOR only): Just serialization; rejected as insufficient (needs full ceremony support)

**Implementation Notes**:
- Backend exports challenge-generation and verification services
- Mobile uses platform WebAuthn APIs (iOS: PassKeys, Android: BiometricPrompt + platform keys)
- Credential IDs and public keys stored in PostgreSQL; private keys never leave device

---

## Database & ORM Design (TypeORM + PostgreSQL)

### Decision: TypeORM with PostgreSQL

**Rationale**:
- Constitution requires strong typing and modular architecture
- TypeORM provides entity-based schema, migrations, and strict typing
- PostgreSQL supports JSON fields (future audit log enrichment), full-text search (future account recovery), and is production-ready
- Migrations are version-controlled and reversible (fits requirement: create, view, revert)

**Key Design Patterns**:
1. **Entities with Timestamps**: All entities have `createdAt` (auto-generated), `updatedAt` (auto-updated)
2. **Soft Deletes**: Users/Authenticators support soft deletes (for compliance, not hard deletion)
3. **Indexes**: On `email` (unique), `userId` (for lookups), `createdAt` (for audit pagination)
4. **Foreign Keys**: Strict FK constraints with CASCADE delete where appropriate (e.g., Authenticator → User)

**Migration Strategy**:
- TypeORM CLI generates migrations automatically (`npm run typeorm migration:generate`)
- Custom seeding script for test data (independent of migrations)
- Revert support: TypeORM rollback (`npm run typeorm migration:revert`)
- All scripts documented in quickstart.md

**Alternatives Considered**:
- Prisma: Excellent but slower TypeORM setup; rejected (complexity overkill for MVP)
- Raw SQL: Would violate enterprise architecture principle (DDD, type safety)

---

## Redis Architecture (Session, Challenges, Rate Limiting)

### Decision: Redis for Three Use Cases

**Use Case 1: Session Management**
- Structure: Hash with userId + session metadata (IP, device, expiry, createdAt)
- Key: `session:{sessionId}` TTL: 24 hours
- Invalidation: Delete all keys matching pattern `session:{userId}:*` on logout/password change
- Rationale: Stateless JWT + stateful Redis ensures revocation capability (can't revoke pure JWT)

**Use Case 2: FIDO2 Challenges**
- Structure: String with challenge bytes (hex-encoded)
- Key: `fido2:challenge:{challengeId}` TTL: 10 minutes
- Flow: Challenge generated → stored in Redis → verified within TTL → deleted
- Rationale: Prevents challenge replay; short TTL matches user experience (ceremony < 2 min)

**Use Case 3: Rate Limiting**
- Structure: Sorted set (score = timestamp) for sliding window
- Key: `ratelimit:login:{identifier}` (identifier = email for account lockout, IP for throttling)
- Logic: Append attempt timestamp; remove entries older than 1 hour; count remaining
- Thresholds: 5/account → 15 min lock flag; 10/IP → progressive backoff
- Rationale: Distributed, real-time, efficient (O(log n) operations)

**Alternatives Considered**:
- In-Memory Cache (Node process): Would not work in multi-instance deployments (rejected)
- Memcached: Less rich data structures; Redis sorted sets perfect for rate limiting (rejected)

---

## Configuration Management (Injectable, Not process.env)

### Decision: Injectable Config Service

**Pattern**: NestJS ConfigModule + custom configuration service (not direct process.env access)

**Rationale**:
- Centralizes environment variable parsing and validation
- Enables easy testing with mock configs (even without test code, maintainers can swap configs)
- Clear error messages if required vars missing (vs. undefined runtime errors)
- Single source of truth for config schema

**Implementation**:
```typescript
// src/config/configuration.ts
export interface Config {
  database: { host, port, username, password, database }
  redis: { host, port, password }
  auth: { jwtSecret, sessionDuration }
  server: { port, nodeEnv }
}

export class ConfigService {
  config: Config;
  constructor() {
    this.config = {
      database: {
        host: process.env.DB_HOST || 'localhost',
        // ... validate and with defaults
      },
      // ...
    };
    this.validate(); // Fail fast on startup if required vars missing
  }
}

// Usage in services (injected via DI)
constructor(private configService: ConfigService) {}
getRedisConfig() { return this.configService.config.redis; }
```

**Alternatives Considered**:
- Direct process.env: Would violate requirement to avoid direct env access (rejected)
- Hardcoded defaults: Not flexible; rejected

**`.env.example`**:
- Template file at root with all required variables (documented)
- Local `.env` files (.gitignored) override for development
- Deployment uses environment variables (AWS/Vercel/etc.)

---

## Migration & Seeding Scripts

### Decision: TypeORM Migrations + Custom Seeders

**Migrations** (TypeORM):
- Auto-generated via `npm run typeorm migration:generate`
- Each migration has `up()` and `down()` methods (revert support)
- Stored in `api/src/database/migrations/`
- Commands:
  - Create: `npm run typeorm migration:generate -- -n CreateUserTable`
  - View: `npm run typeorm migration:show` (lists pending/ran migrations)
  - Revert: `npm run typeorm migration:revert` (rolls back last batch)
  - Run all: `npm run typeorm migration:run` (applies pending)

**Seeders** (Custom scripts, not migrations):
- Separate from migrations (seeders are for test data, migrations for schema)
- File: `api/src/database/seeders/seed.ts`
- Commands:
  - Seed: `npm run seed` (inserts test data: users, authenticators)
  - Clear: `npm run seed:clear` (truncates test tables)
- Idempotent design: Safe to run multiple times (doesn't duplicate)

**Rationale**: Separates schema changes (migrations) from sample data (seeders); both are version-controlled and reproducible.

**Alternatives Considered**:
- Knex.js: More flexible but less DDD-aligned than TypeORM (rejected)
- Hasura/Supabase migrations: Cloud-only; rejected for self-hosted flexibility

---

## Health Check Endpoint

### Decision: GET / → 200 OK (JSON)

**Response**:
```json
{
  "status": "ok",
  "service": "fido2-auth-api",
  "timestamp": "2026-05-25T10:00:00Z"
}
```

**Rationale**:
- AWS ALB/ELB health checks expect `/ `endpoint responding quickly
- Simple JSON response; no auth required
- Returns 200 only if all critical systems (DB, Redis) connected; 503 Service Unavailable otherwise
- Used by deployment health checks, not by frontend

**Endpoint Definition**:
```
GET /
Response: 200 {status: "ok", service: "fido2-auth-api", timestamp}
Auth: None
Rate Limit: None
Audit Log: No
```

---

## Security Decisions

### Password Hashing

**Decision**: Argon2 (via `@node-argon2`)

**Rationale**:
- OWASP recommendation for password storage
- Resistant to GPU cracking (time + memory cost)
- Industry standard (used by major platforms)

**Alternative**: bcrypt (simpler, still secure; acceptable but Argon2 preferred for sensitivity of auth data)

### JWT Token Strategy

**Decision**: Short-lived JWT (15 min) + Long-lived Refresh Token (7 days)

**Rationale**:
- Short JWT: Limits exposure if token leaked
- Refresh token: Improves UX (no frequent re-login)
- Both stored in secure HTTPOnly cookies (mobile: AsyncStorage with encryption)
- Refresh endpoint validates against session in Redis (can revoke remotely)

### FIDO2 Challenge Binding

**Decision**: Challenge bound to user + origin (Relying Party ID)

**Rationale**:
- Prevents phishing (challenge specific to registered origin)
- FIDO2/WebAuthn standard
- Authenticators verify origin before ceremony completion

---

## Frontend Theming (Tailwind + Light/Dark Mode)

### Decision: Tailwind CSS with React Context Theme Provider

**Pattern**:
1. Define light/dark color tokens in Tailwind config
2. Create ThemeContext (React Context) to track active theme (light/dark)
3. Theme hook: `useTheme()` to access current theme + setTheme()
4. Components use Tailwind classes; theme toggle updates context
5. Persistence: Theme preference saved to AsyncStorage

**Implementation**:
- `mobile/src/theme/light.ts`: Tailwind token overrides (colors, fonts)
- `mobile/src/theme/dark.ts`: Dark mode overrides
- `mobile/src/utils/useTheme.ts`: Context hook
- Root `App.tsx` wraps tree in ThemeProvider

**Rationale**:
- Tailwind utility-first CSS is performant
- React Context is lightweight (no Redux needed for theme)
- Users expect dark mode on mobile; built from day 1, not retrofitted

**Alternatives Considered**:
- NativeWind (Tailwind for React Native): Immature ecosystem (rejected)
- StyleSheet.create(): Loses benefits of Tailwind tokens (rejected)

---

## Async Storage & Secure Credential Storage

### Decision: Platform-Native Secure Storage

**iOS**: Keychain (via Expo Secure Store wrapper)  
**Android**: Keystore (via Expo Secure Store wrapper)  

**Rationale**:
- OS-native encryption; private keys never leave device
- Enforces biometric unlock per-credential (if supported by device)
- @react-native-async-storage for non-sensitive state
- @react-native-secure-storage for tokens, credentials

**What to Store Securely**:
- JWT refresh token
- Temporary FIDO2 credential binding info
- User email (optional; for credential pre-fill)

**What to Store Non-Securely** (AsyncStorage):
- Theme preference
- Last login method (credential vs. biometric)
- Feature flags

---

## Documentation

### Key Artifacts Generated

1. **data-model.md**: Schema, entity relationships, validation (Phase 1)
2. **contracts/auth-api.md**: REST endpoints, request/response payloads (Phase 1)
3. **contracts/frontend-backend.md**: TypeScript interfaces for all API types (Phase 1)
4. **quickstart.md**: Local setup, migrations, seeding, first-run (Phase 1)
5. **FIDO2 Ceremony Flows**: Detailed diagrams/pseudocode in data-model or separate doc (Phase 1)

---

## Compliance & Standards

- ✅ W3C WebAuthn specification (latest)
- ✅ FIDO2 Alliance best practices
- ✅ OWASP Authentication Guidelines
- ✅ NIST SP 800-63B (password policy, session management)

**No Deviations**: Strict adherence to standards ensures interoperability and security.

---

**Phase 0 Complete**: All research decisions documented; ready for Phase 1 design.
