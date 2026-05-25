# Frontend-Backend Type Contracts

**Phase**: Phase 1 Design  
**Date**: 2026-05-25  
**Status**: Complete  

## TypeScript Interfaces (Shared Types)

These interfaces define the strict contract between frontend and backend. Both codebases import from a shared type definition package or maintain identical copies.

### Authentication Domain

```typescript
// types/auth.ts

// ============= User & Account Types =============

export interface User {
  userId: string; // UUID
  email: string;
  username?: string; // Optional username
  createdAt: string; // ISO 8601
}

export interface AuthCredentials {
  email?: string; // Email OR username required
  username?: string; // Email OR username required
  password: string;
}

// Helper type for validation: ensures either email or username is provided
export type AuthCredentialsInput = AuthCredentials & {
  email?: string;
  username?: string;
};

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// ============= Token Types =============

export interface TokenPair {
  accessToken: string; // JWT
  refreshToken: string; // JWT
  accessTokenExpiresIn: number; // seconds
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  accessTokenExpiresIn: number; // seconds
}

// ============= Login Response =============

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number; // seconds (15 * 60 = 900)
  user: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ============= Registration Types =============

export interface RegistrationRequest {
  email: string;
  username?: string; // Optional, 3-20 alphanumeric + underscore
  password: string;
}

export interface RegistrationResponse {
  userId: string;
  email: string;
  username?: string; // Included if provided during registration
  message: string;
}

// ============= Error Types =============

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'USERNAME_ALREADY_TAKEN'
  | 'INVALID_USERNAME'
  | 'INVALID_PASSWORD'
  | 'ACCOUNT_LOCKED'
  | 'INVALID_ATTESTATION'
  | 'CHALLENGE_EXPIRED'
  | 'INVALID_ASSERTION'
  | 'INVALID_CURRENT_PASSWORD'
  | 'AUTHENTICATOR_NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR';

export interface ApiError {
  error: ErrorCode;
  message: string;
  timestamp: string; // ISO 8601
  path: string;
}
```

### FIDO2/WebAuthn Types

```typescript
// types/webauthn.ts

// ============= Enrollment Types =============

export interface Authenticator {
  authenticatorId: string; // UUID
  deviceName: string; // User-provided label
  enrolledAt: string; // ISO 8601
  lastUsedAt: string | null; // ISO 8601 or null
  status: 'active' | 'revoked';
}

export interface ListAuthenticatorsResponse {
  authenticators: Authenticator[];
}

export interface RevokeAuthenticatorResponse {
  success: boolean;
  message: string;
}

// ============= Enrollment Ceremony Types =============

export interface EnrollmentStartResponse {
  challengeId: string;
  challenge: string; // Base64-encoded challenge bytes
  rp: {
    id: string; // Relying Party ID (e.g., example.com)
    name: string; // Relying Party name
  };
  user: {
    id: string; // User ID (base64url-encoded)
    email: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    alg: number; // -7 (ES256), -257 (RS256), etc.
    type: 'public-key';
  }>;
  timeout: number; // milliseconds (60000 = 1 min)
  authenticatorSelection: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    residentKey?: 'discouraged' | 'preferred' | 'required';
    userVerification?: 'discouraged' | 'preferred' | 'required';
  };
  attestation?: 'direct' | 'indirect' | 'none';
}

export interface AttestationResponse {
  id: string; // Credential ID
  rawId: string; // Base64url raw credential ID
  response: {
    clientDataJSON: string; // Base64url
    attestationObject: string; // Base64url CBOR
  };
  type: 'public-key';
}

export interface EnrollmentVerifyRequest {
  challengeId: string;
  attestationResponse: AttestationResponse;
  deviceName: string;
}

export interface EnrollmentVerifyResponse {
  success: boolean;
  authenticatorId: string;
  deviceName: string;
  message: string;
}

// ============= Authentication Ceremony Types =============

export interface AuthenticationStartResponse {
  challengeId: string;
  challenge: string; // Base64-encoded challenge bytes
  timeout: number; // milliseconds
  rpId: string; // Relying Party ID
  userVerification?: 'discouraged' | 'preferred' | 'required';
}

export interface AssertionResponse {
  id: string; // Credential ID
  rawId: string; // Base64url raw credential ID
  response: {
    clientDataJSON: string; // Base64url
    authenticatorData: string; // Base64url
    signature: string; // Base64url signature
  };
  type: 'public-key';
}

export interface AuthenticationVerifyRequest {
  challengeId: string;
  assertionResponse: AssertionResponse;
}

export interface AuthenticationVerifyResponse extends LoginResponse {}
```

### Request/Response Validation Rules

```typescript
// types/validation.ts

export interface ValidationRule {
  field: string;
  rule: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
}

// ============= Password Validation =============

export const PASSWORD_RULES: ValidationRule[] = [
  {
    field: 'password',
    rule: 'minimum 12 characters',
    minLength: 12,
    required: true,
  },
  {
    field: 'password',
    rule: 'must contain uppercase letter',
    pattern: '[A-Z]',
    required: true,
  },
  {
    field: 'password',
    rule: 'must contain lowercase letter',
    pattern: '[a-z]',
    required: true,
  },
  {
    field: 'password',
    rule: 'must contain digit',
    pattern: '[0-9]',
    required: true,
  },
  {
    field: 'password',
    rule: 'must contain special character (!@#$%^&*)',
    pattern: '[!@#$%^&*]',
    required: true,
  },
];

// ============= Email Validation =============

export const EMAIL_RULE: ValidationRule = {
  field: 'email',
  rule: 'valid email format',
  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
  maxLength: 255,
  required: true,
};

// ============= Username Validation =============

export const USERNAME_RULE: ValidationRule = {
  field: 'username',
  rule: 'alphanumeric and underscore only; 3-20 chars; optional',
  pattern: '^[a-zA-Z0-9_]{3,20}$',
  minLength: 3,
  maxLength: 20,
  required: false,
};

// ============= Authenticator Device Name Validation =============

export const DEVICE_NAME_RULE: ValidationRule = {
  field: 'deviceName',
  rule: 'alphanumeric, spaces, hyphens only; max 255 chars',
  pattern: '^[a-zA-Z0-9 -]+$',
  maxLength: 255,
};
```

### Session & Storage Types

```typescript
// types/session.ts

export interface SessionData {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number; // UNIX timestamp
  refreshTokenExpiresAt: number; // UNIX timestamp
}

export interface SecureStorageKeys {
  ACCESS_TOKEN = 'fido2_access_token';
  REFRESH_TOKEN = 'fido2_refresh_token';
  USER_EMAIL = 'fido2_user_email'; // Optional
}
```

### API Client Configuration

```typescript
// types/api-client.ts

export interface ApiClientConfig {
  baseUrl: string; // e.g., https://api.example.com
  timeout: number; // milliseconds
  retryAttempts: number;
  retryDelayMs: number;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
  timestamp: string;
}
```

---

## Communication Protocol

### HTTP Headers

**Request Headers (Frontend → Backend)**:
```
Content-Type: application/json
Authorization: Bearer {accessToken}  (optional, for authenticated endpoints)
User-Agent: ExpoApp/{version} {platform}  (informational)
```

**Response Headers (Backend → Frontend)**:
```
Content-Type: application/json
X-Request-ID: {uuid}  (for tracing)
X-Response-Time: {milliseconds}  (optional, for performance tracking)
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Login, token refresh |
| 201 | Created | Registration, authenticator enrollment |
| 400 | Bad Request | Invalid password format |
| 401 | Unauthorized | Invalid token, wrong credentials |
| 408 | Request Timeout | FIDO2 ceremony expired |
| 409 | Conflict | Email already registered |
| 429 | Too Many Requests | Account locked, IP throttled |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | DB or Redis down |

### Data Serialization

**JSON Format**:
- All dates: ISO 8601 (UTC) — `2026-05-25T10:00:00Z`
- UUIDs: Standard format — `550e8400-e29b-41d4-a716-446655440000`
- Large integers (timestamps): UNIX seconds or milliseconds (context-dependent)
- Base64 encoding: URL-safe base64 (RFC 4648 §5) for FIDO2 ceremony data

### Payload Size Limits

| Payload | Limit | Notes |
|---------|-------|-------|
| POST body | 10 KB | JSON requests |
| FIDO2 attestation | 5 KB | Binary FIDO2 data |
| FIDO2 assertion | 3 KB | Binary FIDO2 data |
| Access Token | 2 KB | JWT (typically ~1 KB) |

---

## Contract Enforcement

### Frontend Responsibilities

1. **Type Safety**: Import shared types; use TypeScript strict mode
2. **Validation**: Validate inputs before sending (password strength, email format)
3. **Error Handling**: Parse ApiError responses; display user-friendly messages
4. **Token Management**: Store tokens in secure storage; include in Authorization header
5. **Timeout Handling**: Implement timeouts for FIDO2 ceremonies (60 seconds)

### Backend Responsibilities

1. **Request Validation**: Re-validate all inputs (never trust frontend validation)
2. **Response Format**: Always return ApiError or typed data; never arbitrary JSON
3. **Error Messages**: No sensitive data (passwords, tokens, internal errors)
4. **Status Codes**: Use appropriate HTTP status codes per spec
5. **Security Headers**: Include X-Request-ID for tracing

---

## Breaking Changes Policy

### Versioning

Current version: `1.0.0-beta`  
API versioning: URL-based (`/v1/`, `/v2/`, etc.) if breaking changes introduced post-1.0

### Forward/Backward Compatibility

- ✅ Adding optional fields to responses: Safe (frontend ignores new fields)
- ❌ Removing fields from responses: Breaking (frontend code breaks)
- ✅ Adding new endpoints: Safe
- ❌ Changing endpoint paths: Breaking
- ✅ Adding new error codes: Safe (frontend can ignore unknown codes)
- ❌ Removing error codes: Potentially breaking
- ✅ Changing error message text: Safe (frontend should not parse error text)

### Change Notification

Any breaking changes require:
1. Explicit communication to stakeholders
2. Deprecation period (if possible)
3. Updated contracts and documentation
4. Versioning bump (MAJOR version)

---

**Phase 1 Contracts Complete**: Frontend and backend now have strict type alignment; ready for implementation.
