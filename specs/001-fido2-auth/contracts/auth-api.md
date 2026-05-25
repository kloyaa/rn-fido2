# API Contracts: FIDO2 Authentication REST Endpoints

**Phase**: Phase 1 Design  
**Date**: 2026-05-25  
**Status**: Complete  

## Health Check

### GET /

**Purpose**: AWS ALB/ELB health check endpoint.

**Request**:
```
GET /
Headers: None required
```

**Response (200 OK)**:
```json
{
  "status": "ok",
  "service": "fido2-auth-api",
  "timestamp": "2026-05-25T10:00:00Z"
}
```

**Response (503 Service Unavailable)**:
```json
{
  "status": "error",
  "message": "Database or Redis unavailable"
}
```

**Rate Limit**: None  
**Auth**: None  
**Audit**: No  

---

## User Registration

### POST /auth/register

**Purpose**: Create new user account with email, optional username, and password.

**Request**:
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecureP@ssw0rd!2024"
}
```

**Validation**:
- email: Valid format, lowercase, <= 255 chars, must be unique
- username: Optional; if provided: 3-20 chars, alphanumeric + underscore only, must be unique
- password: >= 12 chars, contains uppercase, lowercase, digit, special char

**Response (201 Created)**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "john_doe",
  "message": "Account created. Please log in."
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "INVALID_PASSWORD",
  "message": "Password must contain uppercase, lowercase, digit, and special character (min 12 characters)"
}
```

**Response (400 Bad Request)** (Invalid username):
```json
{
  "error": "INVALID_USERNAME",
  "message": "Username must be 3-20 characters, containing only letters, numbers, and underscores"
}
```

**Response (409 Conflict)**:
```json
{
  "error": "EMAIL_ALREADY_REGISTERED",
  "message": "This email is already registered"
}
```

**Response (409 Conflict)** (Username taken):
```json
{
  "error": "USERNAME_ALREADY_TAKEN",
  "message": "This username is already taken"
}
```

**Rate Limit**: 5 per minute per IP  
**Auth**: None (public)  
**Audit**: Yes (registration_attempt)  

---

## Credential-Based Login

### POST /auth/login

**Purpose**: Authenticate user with email or username combined with password.

**Request** (Option 1 - Email):
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd!2024"
}
```

**Request** (Option 2 - Username):
```json
{
  "username": "john_doe",
  "password": "SecureP@ssw0rd!2024"
}
```

**Note**: Either email OR username must be provided, not both. If username was not set during registration, only email login is available.

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessTokenExpiresIn": 900,
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

**Response (429 Too Many Requests)** (account locked):
```json
{
  "error": "ACCOUNT_LOCKED",
  "message": "Account temporarily locked due to too many failed attempts. Try again in 15 minutes."
}
```

**Rate Limit**: 5 failed per account → 15 min lock; 10 per IP/hour → progressive delay  
**Auth**: None (public)  
**Audit**: Yes (login_credential)  

---

## FIDO2 Enrollment: Start Ceremony

### POST /auth/fido2/enroll/start

**Purpose**: Initiate FIDO2 authenticator registration ceremony.

**Request**:
```
POST /auth/fido2/enroll/start
Headers: Authorization: Bearer {accessToken}
Body: {}
```

**Response (200 OK)**:
```json
{
  "challengeId": "550e8400-e29b-41d4-a716-446655440000",
  "challenge": "base64_encoded_challenge_bytes",
  "rp": {
    "id": "example.com",
    "name": "FIDO2 Auth Service"
  },
  "user": {
    "id": "550e8400...",
    "email": "user@example.com",
    "displayName": "user@example.com"
  },
  "pubKeyCredParams": [
    { "alg": -7, "type": "public-key" }
  ],
  "timeout": 60000,
  "authenticatorSelection": {
    "authenticatorAttachment": "platform",
    "residentKey": "preferred",
    "userVerification": "preferred"
  },
  "attestation": "direct"
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Access token invalid or expired"
}
```

**Rate Limit**: 10 per user per hour  
**Auth**: Required (JWT)  
**Audit**: No (ceremony initiation not logged; only result logged)  

---

## FIDO2 Enrollment: Verify Ceremony

### POST /auth/fido2/enroll/verify

**Purpose**: Complete FIDO2 authenticator registration; verify attestation.

**Request**:
```json
{
  "challengeId": "550e8400-e29b-41d4-a716-446655440000",
  "attestationResponse": {
    "id": "credential_id_from_ceremony",
    "rawId": "base64_raw_id",
    "response": {
      "clientDataJSON": "base64_client_data",
      "attestationObject": "base64_attestation_object"
    },
    "type": "public-key"
  },
  "deviceName": "iPhone 15 Pro"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "authenticatorId": "550e8400-e29b-41d4-a716-446655440000",
  "deviceName": "iPhone 15 Pro",
  "message": "Biometric authenticator enrolled successfully"
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "INVALID_ATTESTATION",
  "message": "Attestation validation failed; authenticator may be compromised"
}
```

**Response (408 Request Timeout)**:
```json
{
  "error": "CHALLENGE_EXPIRED",
  "message": "Registration ceremony expired. Initiate a new enrollment."
}
```

**Rate Limit**: 5 per user per hour  
**Auth**: Required (JWT)  
**Audit**: Yes (biometric_enrollment)  

---

## FIDO2 Authentication: Start Ceremony

### POST /auth/fido2/authenticate/start

**Purpose**: Initiate FIDO2 authentication ceremony for biometric login.

**Request**:
```
POST /auth/fido2/authenticate/start
Headers: None
Body: {}
```

**Response (200 OK)**:
```json
{
  "challengeId": "550e8400-e29b-41d4-a716-446655440000",
  "challenge": "base64_encoded_challenge_bytes",
  "timeout": 60000,
  "rpId": "example.com",
  "userVerification": "preferred"
}
```

**Rate Limit**: 20 per IP per minute  
**Auth**: None (public)  
**Audit**: No (ceremony initiation not logged)  

---

## FIDO2 Authentication: Verify Ceremony

### POST /auth/fido2/authenticate/verify

**Purpose**: Complete FIDO2 authentication ceremony; verify assertion.

**Request**:
```json
{
  "challengeId": "550e8400-e29b-41d4-a716-446655440000",
  "assertionResponse": {
    "id": "credential_id",
    "rawId": "base64_raw_id",
    "response": {
      "clientDataJSON": "base64_client_data",
      "authenticatorData": "base64_authenticator_data",
      "signature": "base64_signature"
    },
    "type": "public-key"
  }
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessTokenExpiresIn": 900,
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "INVALID_ASSERTION",
  "message": "Biometric authentication failed. Please try again."
}
```

**Response (408 Request Timeout)**:
```json
{
  "error": "CHALLENGE_EXPIRED",
  "message": "Authentication ceremony expired. Initiate a new login."
}
```

**Rate Limit**: 5 failed per IP per hour → progressive delay  
**Auth**: None (public)  
**Audit**: Yes (login_biometric)  

---

## List Enrolled Authenticators

### GET /auth/authenticators

**Purpose**: Retrieve list of user's enrolled FIDO2 authenticators.

**Request**:
```
GET /auth/authenticators
Headers: Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "authenticators": [
    {
      "authenticatorId": "550e8400-e29b-41d4-a716-446655440000",
      "deviceName": "iPhone 15 Pro",
      "enrolledAt": "2026-05-20T10:00:00Z",
      "lastUsedAt": "2026-05-25T08:30:00Z",
      "status": "active"
    },
    {
      "authenticatorId": "550e8400-e29b-41d4-a716-446655440001",
      "deviceName": "YubiKey 5",
      "enrolledAt": "2026-05-15T15:20:00Z",
      "lastUsedAt": "2026-05-24T09:15:00Z",
      "status": "active"
    }
  ]
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Access token invalid or expired"
}
```

**Rate Limit**: 20 per user per minute  
**Auth**: Required (JWT)  
**Audit**: No  

---

## Revoke Authenticator

### DELETE /auth/authenticators/{authenticatorId}

**Purpose**: Disable a FIDO2 authenticator (biometric login no longer works for that device).

**Request**:
```
DELETE /auth/authenticators/550e8400-e29b-41d4-a716-446655440000
Headers: Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Authenticator revoked. Biometric login disabled on this device."
}
```

**Response (404 Not Found)**:
```json
{
  "error": "AUTHENTICATOR_NOT_FOUND",
  "message": "Authenticator does not exist or is already revoked"
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Access token invalid or expired"
}
```

**Rate Limit**: 10 per user per hour  
**Auth**: Required (JWT)  
**Audit**: Yes (biometric_revocation)  

---

## Change Password

### POST /auth/password/change

**Purpose**: Update user password (requires current password verification).

**Request**:
```json
{
  "currentPassword": "OldSecureP@ssw0rd!2024",
  "newPassword": "NewSecureP@ssw0rd!2025"
}
```

**Validation**:
- currentPassword: Must match stored hash
- newPassword: >= 12 chars, contains uppercase, lowercase, digit, special char

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password changed successfully. All sessions have been invalidated. Please log in again."
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "INVALID_CURRENT_PASSWORD",
  "message": "Current password is incorrect"
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "INVALID_NEW_PASSWORD",
  "message": "New password does not meet security requirements"
}
```

**Rate Limit**: 5 per user per hour  
**Auth**: Required (JWT)  
**Audit**: Yes (password_change)  
**Side Effect**: Invalidate all sessions for user (force re-login everywhere)  

---

## Logout

### POST /auth/logout

**Purpose**: Terminate user session.

**Request**:
```
POST /auth/logout
Headers: Authorization: Bearer {accessToken}
Body: {}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Access token invalid or expired"
}
```

**Rate Limit**: 10 per user per hour  
**Auth**: Required (JWT)  
**Audit**: Yes (logout)  
**Side Effect**: Revoke session (delete from Redis); no further API access with this token  

---

## Token Refresh

### POST /auth/token/refresh

**Purpose**: Obtain new access token using refresh token.

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessTokenExpiresIn": 900
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "INVALID_REFRESH_TOKEN",
  "message": "Refresh token expired or revoked"
}
```

**Rate Limit**: 20 per user per minute  
**Auth**: None (refresh token in body)  
**Audit**: No  

---

## Error Response Format

All errors follow this standard format:

```json
{
  "error": "ERROR_CODE_IN_UPPERCASE",
  "message": "Human-readable error message (no sensitive data)",
  "timestamp": "2026-05-25T10:00:00Z",
  "path": "/auth/endpoint"
}
```

**Common Error Codes**:
- `UNAUTHORIZED` — JWT invalid/expired
- `INVALID_CREDENTIALS` — Wrong password
- `EMAIL_ALREADY_REGISTERED` — Duplicate email
- `INVALID_ATTESTATION` — FIDO2 attestation failed
- `CHALLENGE_EXPIRED` — FIDO2 ceremony timeout
- `ACCOUNT_LOCKED` — Rate limiting triggered
- `INVALID_PASSWORD` — Password validation failed

---

**Phase 1 Contracts Complete**: API ready for implementation.
