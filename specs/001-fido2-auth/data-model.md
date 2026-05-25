# Data Model: FIDO2 Authentication System

**Phase**: Phase 1 Design  
**Date**: 2026-05-25  
**Status**: Complete  

## Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ passwordHash        │
│ createdAt           │
│ updatedAt           │
│ deletedAt (soft)    │
└──────────┬──────────┘
           │ 1
           │
           │ M
    ┌──────┴──────────┐
    │                 │
    │                 │
┌───┴──────────────┐  │  ┌────────────────────┐
│  Authenticator   │  │  │   AuditLog         │
├──────────────────┤  │  ├────────────────────┤
│ id (PK)          │  │  │ id (PK)            │
│ userId (FK)      │  │  │ userId (FK, null)  │
│ credentialId     │  │  │ eventType          │
│ publicKey        │  │  │ timestamp          │
│ attestationData  │  │  │ ipAddress          │
│ createdAt        │  │  │ deviceInfo         │
│ lastUsedAt       │  │  │ result             │
│ name             │  │  │ errorMessage       │
│ signCounter      │  │  │ sessionId          │
│ status           │  │  └────────────────────┘
└──────────────────┘  │
                      │
                      │ (tracks all user events)
                      │
                ┌─────┴──────────┐
                │                │
         ┌──────▼───────┐  ┌─────▼────────┐
         │   Session    │  │  (Redis)     │
         ├──────────────┤  │  Challenges  │
         │ id (PK)      │  │  RateLimit   │
         │ userId (FK)  │  │  Metrics     │
         │ expiresAt    │  └──────────────┘
         │ createdAt    │
         │ ipAddress    │
         └──────────────┘
```

## Entity Definitions

### 1. User

**Purpose**: Core identity entity; stores credential and account metadata.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Primary key (auto-generated) |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Email address; immutable after creation |
| username | VARCHAR(20) | UNIQUE, NULL, INDEX | Optional username (3-20 alphanumeric + underscore); NULL if not provided |
| passwordHash | VARCHAR(500) | NOT NULL | Argon2 hash; never store plaintext |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp (UTC) |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp (UTC) |
| deletedAt | TIMESTAMP | NULL | Soft delete marker (NULL = active) |

**Relationships**:
- 1:M with Authenticator (user has 0+ biometric authenticators)
- 1:M with Session (user has 0+ active sessions)
- 1:M with AuditLog (user has N audit events)

**Validation Rules**:
- email: Valid email format (RFC 5322), lowercase, trimmed, unique
- username: Optional; if provided: 3-20 chars, alphanumeric + underscore only, unique, case-insensitive comparison for uniqueness
- passwordHash: Argon2($2id$...) format; never plaintext in response/logs

**State Transitions**:
- Active (normal) → Soft-deleted (deletedAt set) → Never reactivated (compliance)

**Indexes**:
- UNIQUE(email) — fast email lookup
- INDEX(createdAt) — for user analytics queries
- INDEX(deletedAt) — efficient active user queries

---

### 2. Authenticator (FIDO2/WebAuthn Device)

**Purpose**: Tracks enrolled biometric authenticators; enables FIDO2 authentication.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Primary key |
| userId | UUID | FK(User), NOT NULL, INDEX | User who owns this authenticator |
| credentialId | BYTEA | NOT NULL, UNIQUE | WebAuthn credential ID (binary) |
| publicKey | BYTEA | NOT NULL | CBOR-encoded public key; never private key |
| attestationData | JSONB | NULL | Original attestation object (for audit) |
| enrolledAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | When authenticator was registered |
| lastUsedAt | TIMESTAMP | NULL | Last successful authentication (for analytics) |
| deviceName | VARCHAR(255) | NULL | User-provided label (e.g., "iPhone 15", "YubiKey #1") |
| signCounter | BIGINT | NOT NULL, DEFAULT 0 | Cloned authenticator detection counter |
| status | ENUM (active, revoked) | NOT NULL, DEFAULT 'active' | Revocation state |
| revokedAt | TIMESTAMP | NULL | Soft revocation timestamp |

**Relationships**:
- M:1 with User (many authenticators per user)

**Validation Rules**:
- credentialId: Unique per user (allows reuse across users per W3C spec)
- publicKey: Non-empty CBOR (validated on enrollment)
- signCounter: Must not decrease (clone detection); increment on each auth
- status: Transitions active → revoked only; never back to active

**State Transitions**:
- active (usable) → revoked (can no longer log in via this device)

**Indexes**:
- UNIQUE(credentialId) — fast credential lookup
- INDEX(userId) — list user's authenticators
- INDEX(status) — query active authenticators

**Security**:
- Public key ONLY (never private key stored)
- Attestation data retained for security audits
- Sign counter prevents cloned device attacks

---

### 3. AuditLog

**Purpose**: Immutable event log for security, compliance, and incident investigation.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Primary key |
| userId | UUID | FK(User), NULL | User involved (NULL for registration attempts on unknown email) |
| eventType | ENUM | NOT NULL, INDEX | Event category (see enum below) |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW(), INDEX | When event occurred (UTC) |
| ipAddress | INET | NOT NULL | Source IP address |
| deviceInfo | JSONB | NULL | Device/authenticator metadata (e.g., {deviceName, credentialId}) |
| result | ENUM (success, failure, suspended) | NOT NULL, INDEX | Outcome |
| errorMessage | VARCHAR(500) | NULL | Machine-readable error code (no secrets) |
| sessionId | UUID | NULL, INDEX | Associated session (if applicable) |

**Event Types** (ENUM):
- `registration_attempt` — User registration attempt
- `login_credential` — Manual login (email/password)
- `login_biometric` — Biometric login (FIDO2 auth ceremony)
- `password_change` — User changed password
- `biometric_enrollment` — User enrolled authenticator
- `biometric_revocation` — User revoked authenticator
- `logout` — User logged out
- `session_created` — Session initiated
- `session_invalidated` — Session revoked (password change, biometric revoke, etc.)
- `session_timeout` — Session expired (inactivity or 24h max)
- `rate_limit_triggered` — Rate limiting applied (account lock or IP throttle)
- `failed_attestation` — Attestation validation failed
- `replay_attempt_detected` — Challenge replay attempt blocked
- `suspicious_activity` — Unclassified security event

**Validation Rules**:
- eventType: Only predefined enum values
- ipAddress: Valid IPv4 or IPv6
- result: success | failure | suspended
- deviceInfo: JSON with optional fields {deviceName, credentialId, attempt#}
- errorMessage: No sensitive data (passwords, tokens, keys); codes only

**State**:
- Immutable: Records are append-only; never modified or deleted

**Indexes**:
- INDEX(userId, timestamp DESC) — fast user event history
- INDEX(eventType, timestamp) — incident investigation by type
- INDEX(ipAddress, timestamp) — detect suspicious IP patterns
- INDEX(result) — failure analysis

**Retention**:
- Retain 90+ days (configurable per compliance requirements)

---

### 4. Session

**Purpose**: Tracks active user sessions; enables revocation (via Redis, persisted in DB for audit).

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Session token identifier |
| userId | UUID | FK(User), NOT NULL, INDEX | Authenticated user |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Session start time (UTC) |
| expiresAt | TIMESTAMP | NOT NULL, INDEX | Absolute expiration (24h from creation) |
| inactivityExpiresAt | TIMESTAMP | NOT NULL | Inactivity timeout (1h from last activity) |
| lastActivityAt | TIMESTAMP | NOT NULL | Last request timestamp |
| ipAddress | INET | NOT NULL | Session origin IP |
| deviceIdentifier | VARCHAR(255) | NULL | Device fingerprint (user-agent, etc.) |
| revokedAt | TIMESTAMP | NULL | Revocation timestamp (if manually revoked) |

**Relationships**:
- M:1 with User

**Validation Rules**:
- expiresAt: createdAt + 24 hours
- inactivityExpiresAt: lastActivityAt + 1 hour (updated on each request)
- ipAddress: Valid IP

**State Transitions**:
- active (revokedAt = NULL) → revoked (revokedAt set)
- Expired sessions cleaned up by background job or on query

**Indexes**:
- INDEX(userId) — list user's sessions
- INDEX(expiresAt) — find expired sessions for cleanup
- INDEX(revokedAt) — find revoked sessions

**Storage**: Primary in Redis (fast access); periodically synced to PostgreSQL for audit/analysis.

---

## FIDO2 Ceremony Data Flows

### Registration Ceremony (User enrolls authenticator)

**Step 1: Backend generates challenge**
```
POST /auth/fido2/enroll/start
Request: { userId }
Response: { challengeId, challenge, rp, user, pubKeyCredParams, timeout, authenticatorSelection }

Backend:
1. Generate random 32-byte challenge
2. Store in Redis: fido2:challenge:{challengeId} = challenge (10 min TTL)
3. Return challenge + ceremony options
```

**Step 2: Mobile performs ceremony**
```
Mobile (WebAuthn API):
1. Call navigator.credentials.create({publicKey: ceremony options})
2. User completes biometric/hardware key interaction
3. Receive AttestationResponse { id, response: {clientDataJSON, attestationObject} }
4. Send to backend
```

**Step 3: Backend verifies and stores**
```
POST /auth/fido2/enroll/verify
Request: { challengeId, attestationResponse }
Response: { success: true, authenticatorId, deviceName }

Backend:
1. Retrieve challenge from Redis (verify not expired, not replayed)
2. Verify attestationResponse against challenge (using @simplewebauthn)
3. If attestation invalid: Audit log (failed_attestation), return error
4. Extract credentialId + publicKey from attestation
5. Store in Authenticator table: { userId, credentialId, publicKey, attestationData, status: 'active' }
6. Delete challenge from Redis
7. Audit log: biometric_enrollment, result: success
```

### Authentication Ceremony (User logs in via biometric)

**Step 1: Backend generates challenge**
```
POST /auth/fido2/authenticate/start
Request: {} (unauthenticated)
Response: { challengeId, challenge, timeout }

Backend:
1. Generate random 32-byte challenge
2. Store in Redis: fido2:challenge:{challengeId} = challenge (10 min TTL)
3. Return challenge
```

**Step 2: Mobile performs ceremony**
```
Mobile:
1. Call navigator.credentials.get({publicKey: ceremony options})
2. User completes biometric interaction
3. Receive AssertionResponse { id, response: {clientDataJSON, authenticatorData, signature} }
4. Send to backend
```

**Step 3: Backend verifies, creates session**
```
POST /auth/fido2/authenticate/verify
Request: { challengeId, assertionResponse }
Response: { accessToken, refreshToken, user }

Backend:
1. Retrieve challenge from Redis (verify not expired)
2. Fetch Authenticator by credentialId from assertion
3. Verify signature + challenge + origin (using @simplewebauthn)
4. Compare signCounter: must be > last value (clone detection)
5. If verification fails: Audit log (replay_attempt_detected or failed_attestation), return 401
6. If sign counter not incremented: Audit log (suspicious_activity), consider locking authenticator
7. Update Authenticator.lastUsedAt + signCounter
8. Create Session record
9. Generate JWT (exp: 15 min) + refresh token (exp: 7 days)
10. Store session in Redis + PostgreSQL
11. Audit log: login_biometric, result: success
12. Return tokens
```

---

## Data Validation & Constraints

### User Constraints

- email: `^\S+@\S+\.\S+$` (minimal; DB handles RFC 5322 validation)
- passwordHash: Argon2 format (runtime check in service)

### Authenticator Constraints

- credentialId: Not null, max 1024 bytes (per WebAuthn spec)
- publicKey: Valid CBOR, max 2KB
- signCounter: >= 0; must increase on auth

### AuditLog Constraints

- errorMessage: Max 500 chars; no passwords/tokens/keys (validate in service)
- deviceInfo: Valid JSON; max 1KB

### Session Constraints

- expiresAt > createdAt
- inactivityExpiresAt >= lastActivityAt

---

## Migration Path

**Initial Schema** (Migration 1):
- Create User, Authenticator, AuditLog, Session tables
- Add indexes for performance

**Seeding** (seed.ts):
- Optional: Insert test user (email: test@example.com)
- Optional: Insert test authenticator (for development)
- Idempotent: Safe to run multiple times

---

**Phase 1 Design Complete**: Data model ready for API contract definition.
