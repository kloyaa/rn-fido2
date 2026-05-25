# Feature Specification: Production-Grade FIDO2 Authentication System

**Feature Branch**: `001-fido2-auth`  
**Created**: 2026-05-25  
**Status**: Draft  
**Input**: User description: "Implement a production-grade authentication system that supports both traditional credential-based login and biometric authentication using FIDO/FIDO2 and WebAuthn standards."

## Clarifications

### Session 2026-05-25

- Q: Should a biometric enrolled on one device be usable on another device? → A: Device-bound only. Platform biometrics (Face ID, Touch ID) are device-specific. Users can enroll the same platform independently on multiple devices if needed.
- Q: What recovery mechanism exists if user loses all authenticators AND password? → A: Out of MVP scope. Support-assisted account recovery with proper identity verification is deferred to post-MVP.
- Q: How should rate limiting prevent brute force attacks? → A: Dual strategy — per-account lockout (5 failed attempts → 15 minute lock) + per-IP throttling (10 failed attempts → progressive delays).
- Q: What observability and monitoring capabilities should the system provide? → A: Audit logs (as specified) + structured metrics (event counts, failure rates, lockout triggers) for operational dashboarding. Manual alert configuration by ops team; predefined alerts deferred to post-MVP.

## User Scenarios

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - User Registration (Priority: P1)

New users must be able to create an account with email and password credentials. This is the foundational entry point to the system and enables subsequent authentication flows.

**Why this priority**: Registration is required before any user can authenticate. Without this, no user can access the system.

**Independent Test**: A new user can complete registration with email and password, verify the account is created in the system, and subsequently log in with the created credentials.

**Acceptance Scenarios**:

1. **Given** a new user accessing the registration page, **When** they enter valid email and password, **Then** the account is created and the user can log in.
2. **Given** a user attempting to register with an existing email, **When** they submit the registration, **Then** the system returns an error indicating the email is already registered.
3. **Given** a user entering invalid email format or weak password, **When** they attempt to register, **Then** validation errors are returned before submission.

---

### User Story 2 - Manual Credential Login (Priority: P1)

Users must be able to authenticate using either their email or username combined with a password. This is the primary fallback authentication method and must be secure and reliable.

**Why this priority**: Manual login is essential for users without biometric authenticators or those who lose access to their biometric devices. Supporting both email and username login provides flexibility and improves user experience.

**Independent Test**: A registered user can log in with either email or username (both provide access to the same account) and is redirected to the Home page. Login fails with clear error messages for incorrect credentials.

**Acceptance Scenarios**:

1. **Given** a registered user on the login page, **When** they enter correct email (or username) and password, **Then** they are authenticated and redirected to the Home page.
2. **Given** a user attempting to log in with username instead of email, **When** they submit the login with correct password, **Then** they are authenticated successfully.
3. **Given** a user entering incorrect password, **When** they submit the login, **Then** a clear error message is returned without revealing whether the email/username exists.
4. **Given** a user attempting multiple failed logins, **When** they exceed the rate limit, **Then** the account is temporarily locked with clear guidance.

---

### User Story 3 - FIDO2/WebAuthn Enrollment (Priority: P1)

Authenticated users must be able to enroll a FIDO2-compatible authenticator (hardware key, biometric device) for passwordless login. This establishes the foundation for biometric authentication.

**Why this priority**: Biometric enrollment must be available before users can authenticate using FIDO2. This is a critical security feature.

**Independent Test**: A logged-in user can initiate biometric enrollment, complete the FIDO2 ceremony, and the authenticator is registered in the system. Subsequent biometric login attempts recognize the registered device.

**Acceptance Scenarios**:

1. **Given** an authenticated user in the Settings page, **When** they click "Enable Biometrics", **Then** a FIDO2 registration ceremony is initiated and the user is guided through authenticator enrollment.
2. **Given** a user completing the FIDO2 ceremony successfully, **When** the ceremony completes, **Then** the authenticator is stored securely and the user can log in using it.
3. **Given** a user with an already enrolled authenticator, **When** they attempt to enroll another, **Then** multiple authenticators can be managed independently.

---

### User Story 4 - Biometric Login via FIDO2 (Priority: P1)

Users with enrolled FIDO2 authenticators must be able to authenticate without entering a password. This provides a fast, phishing-resistant login experience.

**Why this priority**: Biometric login is the key differentiator of this system. It must work reliably and securely to replace password-based authentication.

**Independent Test**: A user with an enrolled authenticator can log in using only biometric authentication and is redirected to the Home page. Biometric login fails securely if the authenticator is not recognized or tampered with.

**Acceptance Scenarios**:

1. **Given** a user on the login page with an enrolled authenticator, **When** they initiate biometric login, **Then** a FIDO2 authentication ceremony begins and upon successful completion they are redirected to Home.
2. **Given** a user with a tampered or unregistered authenticator, **When** they attempt biometric login, **Then** the attempt fails with a clear error and the system logs the failure.
3. **Given** a user attempting biometric login during a network outage, **When** the challenge cannot be verified, **Then** the system returns a secure error without revealing internal state.

---

### User Story 5 - Change Password (Priority: P2)

Authenticated users must be able to change their password from the Settings page. This allows users to maintain account security.

**Why this priority**: Password changes are important for security but not critical for MVP functionality. Users can initially use their original password.

**Independent Test**: A logged-in user can navigate to Settings, enter current password and new password, and the password is updated. Subsequent logins with the new password succeed.

**Acceptance Scenarios**:

1. **Given** an authenticated user in Settings, **When** they enter current password and a new password, **Then** the password is updated and a confirmation message is shown.
2. **Given** a user entering an incorrect current password, **When** they attempt to change the password, **Then** an error is returned without updating the password.
3. **Given** a user entering a weak new password, **When** they submit the change, **Then** validation errors guide them to a stronger password.

---

### User Story 6 - Disable Biometrics (Priority: P2)

Authenticated users with enrolled biometric authenticators must be able to revoke them from the Settings page. This provides a security mechanism if an authenticator is lost or compromised.

**Why this priority**: Disabling biometrics is important for security after an authenticator is lost but is secondary to initial setup.

**Independent Test**: A user with an enrolled authenticator can disable biometrics from Settings. After disabling, biometric login is no longer possible and the user must use password login.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an enrolled authenticator in Settings, **When** they click "Disable Biometrics", **Then** the authenticator is revoked and biometric login is no longer possible.
2. **Given** a user with multiple enrolled authenticators, **When** they disable one, **Then** other authenticators remain functional.
3. **Given** a user immediately after disabling biometrics, **When** they attempt biometric login, **Then** the attempt fails with a clear message to use password login instead.

---

### User Story 7 - Logout (Priority: P1)

Authenticated users must be able to log out from the application. This terminates their session and requires re-authentication to access protected pages.

**Why this priority**: Logout is essential for security and user control. Users must be able to end their sessions.

**Independent Test**: A logged-in user can click the logout button. After logout, they are redirected to the login page and cannot access protected pages without re-authenticating.

**Acceptance Scenarios**:

1. **Given** an authenticated user anywhere in the application, **When** they click the Logout button, **Then** the session is terminated and they are redirected to the login page.
2. **Given** a user immediately after logging out, **When** they attempt to access a protected page, **Then** they are redirected to login.
3. **Given** a user with multiple active sessions across devices, **When** they log out, **Then** all sessions are invalidated.

### Edge Cases

- **Expired Challenge**: What happens when a user initiates FIDO2 ceremony but takes too long to complete it? → System MUST invalidate the challenge and require re-initiation.
- **Lost Authenticator**: What if a user loses access to their enrolled biometric device? → User MUST be able to fall back to password login and can enroll a new authenticator.
- **Concurrent Registration**: Can the same email register twice simultaneously? → System MUST prevent duplicate registrations even under race conditions (database constraint).
- **Invalid Attestation**: What if a FIDO2 device provides invalid attestation data? → System MUST reject the registration with a clear error.
- **Replay Attack Attempt**: What if an attacker replays a previously captured FIDO2 response? → System MUST detect and reject the replay attempt based on challenge freshness.
- **Session Timeout**: What happens when a user's session expires during an action? → System MUST redirect to login with a clear message to re-authenticate.
- **Password Reset**: Is there a password recovery mechanism? → System MUST provide a secure password reset flow (out of scope for MVP but documented assumption).

## Requirements

### Functional Requirements

**Authentication & Registration**:
- **FR-001**: System MUST allow new users to register with email, optional username, and password
- **FR-002**: System MUST validate email format, username format (alphanumeric + underscore, 3-20 chars), and password strength during registration
- **FR-003**: System MUST prevent duplicate email registrations with clear error messaging
- **FR-004**: System MUST prevent duplicate username registrations (if username provided) with clear error messaging
- **FR-005**: System MUST allow registered users to log in with EITHER email OR username combined with password
- **FR-006**: System MUST implement rate limiting on login attempts to prevent brute force attacks using dual strategy: per-account lockout (after 5 failed attempts, lock for 15 minutes) AND per-IP throttling (after 10 failed attempts from same IP in 1 hour, apply progressive response delays)
- **FR-007**: System MUST return secure error messages that do not reveal account existence

**FIDO2/WebAuthn Support**:
- **FR-008**: System MUST implement FIDO2 registration ceremony following official W3C WebAuthn standards
- **FR-009**: System MUST validate attestation from enrolled authenticators to ensure device legitimacy
- **FR-010**: System MUST implement FIDO2 authentication ceremony with challenge generation and verification
- **FR-011**: System MUST prevent replay attacks by validating challenge freshness and origin
- **FR-012**: System MUST support multiple enrolled authenticators per user
- **FR-013**: System MUST allow users to enroll, view, and revoke biometric authenticators from Settings

**Password Management**:
- **FR-014**: System MUST allow authenticated users to change their password
- **FR-015**: System MUST validate new password meets security requirements
- **FR-016**: System MUST require current password verification before allowing password change
- **FR-017**: System MUST invalidate sessions upon password change

**Session & Token Management**:
- **FR-018**: System MUST implement secure session tokens with appropriate expiration
- **FR-019**: System MUST support token refresh to extend user sessions
- **FR-020**: System MUST invalidate all sessions when authenticator is disabled
- **FR-021**: System MUST implement secure token storage with HttpOnly and Secure cookies

**Audit Logging**:
- **FR-022**: System MUST log all registration attempts with timestamp, email, username (if provided), and result (success/failure)
- **FR-023**: System MUST log all login attempts (manual and biometric) with timestamp, user identifier (email or username), IP address, and result
- **FR-024**: System MUST log all password changes with timestamp, user identifier, and IP address
- **FR-025**: System MUST log all biometric enrollment and revocation events with timestamp, user, authenticator info, and result
- **FR-026**: System MUST log all logout events with timestamp and user identifier
- **FR-027**: System MUST log all session-related events (creation, invalidation, timeout)
- **FR-028**: System MUST log all security-related failures (rate limit triggers, failed attestation, replay attack attempts)

**Observability & Metrics**:
- **FR-029**: System MUST emit structured metrics: total authentication requests, successful/failed login counts (per method), account lockout events, FIDO2 ceremony failures, session timeouts
- **FR-030**: System MUST expose metrics in a queryable format (JSON API endpoint or Prometheus-compatible format) for integration with operational monitoring/dashboarding systems
- **FR-031**: System MUST provide operational visibility into authentication health without requiring manual log parsing

**User Interface & Settings**:
- **FR-032**: System MUST display Home page only to authenticated users
- **FR-033**: System MUST display Settings page with authentication management options
- **FR-034**: System MUST display clear navigation for logout functionality
- **FR-035**: System MUST display error messages that guide users without exposing sensitive system details

### Key Entities

**User**:
- User ID (unique identifier)
- Email (unique)
- Username (unique, optional - 3-20 alphanumeric + underscore characters)
- Password hash (bcrypt/Argon2)
- Account creation timestamp
- Last login timestamp
- Account status (active/suspended)

**Authenticator (FIDO2/WebAuthn Device)**:
- Authenticator ID (unique)
- User ID (foreign key to User)
- Credential ID (from WebAuthn ceremony)
- Public key (CBOR encoded)
- Attestation data
- Enrollment timestamp
- Last used timestamp
- Device name/label (user-provided)
- Sign counter (for cloned device detection)
- Status (active/revoked)

**AuditLog**:
- Log ID (unique identifier)
- User ID (nullable for registration attempts)
- Event type (registration, login_manual, login_biometric, password_change, biometric_enroll, biometric_revoke, logout, session_created, session_timeout, failed_attestation, replay_attempt)
- Timestamp (UTC)
- IP address
- Device/authenticator info (if applicable)
- Result (success/failure/suspended)
- Error message (if failure)
- Session ID (if applicable)

**Session**:
- Session ID (unique token)
- User ID (foreign key to User)
- Created timestamp (UTC)
- Expires timestamp (UTC)
- Last activity timestamp (UTC)
- IP address
- Device identifier

## Success Criteria

- **SC-001**: Users can complete registration in under 2 minutes with clear validation guidance
- **SC-002**: Users can complete credential-based login in under 1 minute
- **SC-003**: Users can complete FIDO2 biometric login in under 5 seconds after initiating authentication
- **SC-004**: 99.9% of authentication attempts succeed when performed correctly with valid credentials/authenticators
- **SC-005**: Zero successful unauthorized authentication attempts detected in security audit
- **SC-006**: All FIDO2 operations demonstrate compliance with W3C WebAuthn specification and FIDO2 Alliance standards
- **SC-007**: Audit logs capture 100% of specified authentication and account events with complete audit trail
- **SC-008**: System handles 1,000 concurrent users without performance degradation
- **SC-009**: Error messages guide users to resolution without revealing sensitive system details or account information
- **SC-010**: Password reset flow (when implemented) follows OWASP secure password reset guidelines
- **SC-011**: Rate limiting prevents brute force attacks: per-account lockout triggers after 5 failed attempts (15 minute duration), per-IP throttling triggers after 10 failures in 1 hour

## Assumptions

- **Password Requirements**: Passwords MUST be minimum 12 characters with uppercase, lowercase, number, and special character (follows NIST SP 800-63B guidelines).
- **Session Duration**: User sessions MUST expire after 24 hours of creation or 1 hour of inactivity (user-friendly enterprise defaults).
- **Authenticator Support**: System assumes FIDO2-compliant devices including hardware keys (YubiKey, etc.) and platform authenticators (Windows Hello, Face ID, Touch ID).
- **Network Connectivity**: FIDO2 ceremony requires active internet connection for challenge verification and attestation validation.
- **Device Binding**: Authenticators are bound to their enrollment device; platform biometrics (Face ID, Touch ID) are device-specific and cannot be shared across devices. Users can enroll the same platform independently on multiple devices (each enrollment is separate). Cross-device authenticator sharing is out of scope for MVP.
- **Account Recovery**: No self-service account recovery in MVP. If user loses all biometric authenticators AND forgets password, account recovery requires support team intervention with identity verification. Post-MVP can add email-based or security-question-based recovery.
- **Audit Log Retention**: Logs are retained for minimum 90 days for compliance and investigation purposes (configurable per deployment).
- **IP Address Capture**: System captures client IP for audit logging and rate limiting (proxy scenarios will show proxy IP).
- **Password Reset**: Self-service password reset functionality is out of MVP scope; users can authenticate with fallback password and re-enroll biometric authenticators.
- **Single Email per Account**: One email address maps to one account; account linking or federation is out of scope for MVP.
- **Username is Optional**: Users may provide a username during registration; email alone is sufficient to create an account. If username is provided, it must be unique and between 3-20 characters (alphanumeric + underscore). Both email and username can be used for login if username was provided.
- **Login Identifier**: Users can log in with either email or username (if username provided); system treats them as equivalent identifiers for the same account.
- **UTC Timestamps**: All timestamps stored in UTC for consistency across distributed systems and audit compliance.
- **Frontend Deployment**: Frontend (mobile app) runs on Expo with secure credential storage via platform-native APIs (Keychain on iOS, Keystore on Android).
- **Backend Deployment**: Backend runs on NestJS with PostgreSQL and Redis, deployed in production environment with TLS 1.3+ and modern security practices.
