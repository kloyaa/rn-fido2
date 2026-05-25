<!--
SYNC IMPACT REPORT
Version: 0.0.0 → 1.0.0 (MINOR: initial constitution establishment)
Rationale: First constitution for rn-fido2 project focusing on FIDO2 authentication.

New principles:
- I. FIDO2-First Security
- II. Enterprise-Grade Architecture  
- III. No Testing Implementations
- IV. Documentation-Driven Development
- V. Frontend/Backend Contract Alignment

New sections:
- Frontend Architecture Requirements
- Backend Architecture Requirements
- Security Standards & Compliance

Templates updated: plan-template, spec-template, tasks-template
Follow-up: None
-->

# rn-fido2 Constitution

## Core Principles

### I. FIDO2-First Security

All authentication flows MUST fully comply with FIDO2/WebAuthn standards and best practices. Every authentication mechanism—manual login, biometric login, WebAuthn registration, device verification—must implement industry-standard security protocols, challenge verification, attestation validation, and replay attack prevention. Security is non-negotiable and takes absolute priority over convenience.

**Rationale**: FIDO2 is the gold standard for passwordless, phishing-resistant authentication. Strict compliance ensures enterprise-grade security posture and protects against the largest class of authentication vulnerabilities.

### II. Enterprise-Grade Architecture

Backend (NestJS) and frontend (Expo) MUST follow production-grade architectural patterns: strict typing, validation layers, proper separation of concerns, error handling, and audit logging. Every module, service, controller, screen, and component must be independently maintainable and scalable. No shortcuts, temporary hacks, or simplified implementations are permitted.

**Rationale**: This system handles sensitive authentication data. Enterprise architecture patterns ensure security, maintainability, and long-term scalability without requiring refactoring after deployment.

### III. No Testing Implementations

Do NOT write, generate, or configure ANY form of tests, test frameworks, or testing utilities. This includes unit tests, integration tests, end-to-end tests, mock scaffolding, or test-related dependencies. Testing is explicitly excluded from the development lifecycle.

**Rationale**: Testing is deferred to later phases. Focus development effort on correct, secure, working implementation.

### IV. Documentation-Driven Development

Every implemented feature, flow, endpoint, payload, security consideration, and architectural decision MUST be properly documented and continuously updated throughout development. Documentation is a first-class artifact, not an afterthought. Incomplete or outdated documentation is a code quality issue.

**Rationale**: FIDO2 is complex. Documentation enables code review, security audits, and future maintenance. It also serves as a reference for integrations and compliance verification.

### V. Frontend/Backend Contract Alignment

All frontend-backend communication MUST follow strictly defined API contracts with typed payloads, clear request/response schemas, validation rules, and error responses. Frontend and backend must never negotiate or adapt on-the-fly. Breaking changes require explicit, documented migration.

**Rationale**: Type safety and contract enforcement prevent integration bugs, security misconfigurations, and inconsistent authentication state.

## Frontend Architecture Requirements

- **Framework**: React Native (Expo) with TypeScript
- **Styling**: Tailwind CSS with consistent design patterns
- **Folder Structure**: components, screens, hooks, services/api, stores, utilities, types, constants, authentication modules
- **State Management**: Type-safe, centralized state for authentication and session
- **Storage**: Secure credential and token storage (platform-native secure storage)
- **Authentication Flows**:
  - Manual login (username/password fallback with rate limiting)
  - Biometric login (native biometric APIs)
  - FIDO2/WebAuthn registration and authentication
  - Session management with token refresh
  - Logout with device revocation
- **Error Handling**: Explicit error states, security-aware UX, clear messaging
- **Accessibility**: WCAG 2.1 AA minimum compliance

## Backend Architecture Requirements

- **Framework**: NestJS with modular domain architecture
- **Database**: PostgreSQL with TypeORM for data persistence
- **Cache/Session**: Redis for session management, challenge storage, rate limiting
- **Typing**: Strict TypeScript, no `any` types in critical authentication paths
- **Validation**: DTOs, validation pipes, input sanitization at all boundaries
- **Guards & Interceptors**: Authentication/authorization guards, request logging, exception handling
- **FIDO2 Implementation**:
  - Registration ceremony with attestation verification
  - Authentication ceremony with challenge verification
  - Authenticator trust management
  - Device revocation and session invalidation
- **Security Requirements**:
  - CSRF and XSS protection
  - Secure cookie handling (HttpOnly, Secure, SameSite flags)
  - Rate limiting on authentication endpoints
  - Audit logging for all auth events
  - Token rotation and expiration
- **API Clarity**: Documented endpoint contracts with request payloads, response schemas, validation rules, and error codes
- **Database Design**: Properly structured migrations, foreign keys, indexes, constraints

## Security Standards & Compliance

- All cryptographic operations MUST use industry-standard libraries (libsodium, node:crypto, native mobile APIs)
- Challenge generation and verification MUST prevent replay attacks
- Device fingerprinting and authenticator binding MUST be implemented
- Session invalidation MUST revoke all device access
- Audit logs MUST record all authentication attempts (success and failure)
- Rate limiting MUST protect against brute force attacks
- No plaintext secrets in code, configuration, or logs
- Environment variables MUST be validated and typed
- All sensitive data MUST be encrypted at rest and in transit (TLS 1.3+)

## Governance

This constitution is the source of truth for rn-fido2 project governance. All architectural decisions, code reviews, and PRs MUST verify compliance with these principles.

**Amendment Process**: Constitution changes require explicit ratification. Changes to security principles require additional security review.

**Versioning**: 
- MAJOR: Backward-incompatible principle removals or redefinitions
- MINOR: New principles, new sections, or materially expanded guidance
- PATCH: Clarifications, wording, typo fixes

**Compliance Verification**: Every PR review MUST ask:
1. Does this follow the architecture principles?
2. Is security properly considered (FIDO2 standards, validation, audit logging)?
3. Is documentation updated to reflect the change?
4. Are frontend/backend contracts aligned?

**Version**: 1.0.0 | **Ratified**: 2026-05-25 | **Last Amended**: 2026-05-25
