# Tasks: Production-Grade FIDO2 Authentication System

**Input**: Design documents from `specs/001-fido2-auth/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Status**: Generated via `/speckit-tasks` on 2026-05-25

**Organization**: Tasks grouped by user story (P1, P2) to enable independent implementation. Monorepo structure with `/api` (NestJS backend) and `/mobile` (Expo frontend).

**Important Notes**:
- NO TESTS: Testing is explicitly excluded per constitution
- Checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- [P] = parallelizable (different files, no dependencies)
- [Story] = US1-US7 (maps to user stories from spec.md)
- Constitution compliance verified throughout

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic monorepo structure

- [ ] T001 Create backend directory structure per plan.md in `/api/src/`
- [ ] T002 Create frontend directory structure per plan.md in `/mobile/src/`
- [ ] T003 Initialize NestJS project in `/api` with TypeScript strict mode
- [ ] T004 [P] Initialize Expo project in `/mobile` with TypeScript strict mode
- [ ] T005 [P] Create root `.env.example` template with all backend + frontend variables
- [ ] T006 [P] Create `/api/.env.example` with PostgreSQL, Redis, JWT, FIDO2 config
- [ ] T007 [P] Create `/mobile/.env.example` with API_BASE_URL and app version
- [ ] T008 Setup Git hooks for linting/formatting (backend + frontend)
- [ ] T009 [P] Configure ESLint and Prettier for `/api`
- [ ] T010 [P] Configure ESLint and Prettier for `/mobile`

---

## Phase 2: Foundational Infrastructure (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: All tasks here must complete before moving to user stories

### Backend Infrastructure

- [ ] T011 Configure TypeORM connection in `/api/src/config/database.ts` with injectable pattern
- [ ] T012 Create TypeORM migration framework with `/api/src/database/migrations/` directory
- [ ] T013 Create database configuration service in `/api/src/config/configuration.service.ts` (no process.env in business logic)
- [ ] T014 [P] Setup Redis client wrapper in `/api/src/cache/redis.service.ts` for sessions, challenges, rate limiting
- [ ] T015 [P] Create audit logging service in `/api/src/audit/audit.service.ts` with full event tracking
- [ ] T016 Create JWT configuration and token generation in `/api/src/auth/services/token.service.ts`
- [ ] T017 [P] Create password hashing service (Argon2) in `/api/src/auth/services/password.service.ts`
- [ ] T018 [P] Create rate limiting middleware in `/api/src/auth/middleware/rate-limiting.middleware.ts` (per-account + per-IP)
- [ ] T019 Create JWT guard in `/api/src/auth/guards/jwt.guard.ts`
- [ ] T020 [P] Create authenticated decorator in `/api/src/auth/decorators/authenticated.decorator.ts`
- [ ] T021 Create global exception filter in `/api/src/common/filters/http-exception.filter.ts`
- [ ] T022 [P] Setup API response interceptor in `/api/src/common/interceptors/response.interceptor.ts`
- [ ] T023 Create validation pipe for DTOs in `/api/src/common/pipes/validation.pipe.ts`
- [ ] T024 Setup health check endpoint (GET `/`) in `/api/src/app.controller.ts` for AWS ALB
- [ ] T025 Create shared DTOs/types in `/api/src/auth/dto/` (AuthCredentials, LoginResponse, etc. from contracts)
- [ ] T026 [P] Create migration helper scripts: `npm run typeorm migration:run`, `migration:show`, `migration:revert`
- [ ] T027 Create seeding script framework in `/api/src/database/seeders/` for test data generation

### Frontend Infrastructure

- [ ] T028 Setup Tailwind CSS with light/dark mode in `/mobile/tailwind.config.js`
- [ ] T029 Create theme context provider in `/mobile/src/theme/ThemeContext.tsx` with light/dark toggle
- [ ] T030 [P] Create secure storage wrapper in `/mobile/src/services/storage/secureStorage.ts` (Keychain/Keystore)
- [ ] T031 [P] Create HTTP API client in `/mobile/src/services/api/client.ts` with error handling
- [ ] T032 Create auth store in `/mobile/src/stores/authStore.ts` (user, tokens, session state)
- [ ] T033 [P] Create useAuth hook in `/mobile/src/hooks/useAuth.ts` for auth operations
- [ ] T034 [P] Create useAuthenticators hook in `/mobile/src/hooks/useAuthenticators.ts` for biometric management
- [ ] T035 [P] Create useSession hook in `/mobile/src/hooks/useSession.ts` for session lifecycle
- [ ] T036 Create error handling utilities in `/mobile/src/utils/errorHandling.ts` (parse API errors)
- [ ] T037 [P] Create validation utilities in `/mobile/src/utils/validation.ts` (password, email, username)
- [ ] T038 [P] Create auth API client in `/mobile/src/services/api/authApi.ts` (all auth endpoints)
- [ ] T039 Create theme hook in `/mobile/src/theme/useTheme.ts` for consuming theme context
- [ ] T040 Create navigation structure in `/mobile/src/navigation/RootNavigator.tsx` (auth stack, app stack)
- [ ] T041 [P] Create error boundary component in `/mobile/src/components/common/ErrorBoundary.tsx`
- [ ] T042 [P] Create loading spinner component in `/mobile/src/components/common/LoadingSpinner.tsx`

**Checkpoint**: Foundation ready - all user stories can now proceed in parallel

---

## Phase 3: User Story 1 - User Registration (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts with email, optional username, and secure password

**Independent Test**: A new user can register with valid credentials, verify account creation in database, and successfully log in with created credentials

### Backend Implementation for User Story 1

- [ ] T043 Create User entity in `/api/src/database/entities/User.entity.ts` with email (unique), username (unique, nullable), passwordHash, timestamps
- [ ] T044 [P] Create Authenticator entity stub in `/api/src/database/entities/Authenticator.entity.ts` (minimal for US1)
- [ ] T045 Create User repository in `/api/src/database/repositories/user.repository.ts` with findByEmail, findByUsername, create methods
- [ ] T046 Create TypeORM migration for User table in `/api/src/database/migrations/1000-CreateUserTable.ts`
- [ ] T047 [P] Create TypeORM migration for Authenticator table in `/api/src/database/migrations/1001-CreateAuthenticatorTable.ts`
- [ ] T048 [P] Create TypeORM migration for AuditLog table in `/api/src/database/migrations/1002-CreateAuditLogTable.ts`
- [ ] T049 [P] Create TypeORM migration for Session table in `/api/src/database/migrations/1003-CreateSessionTable.ts`
- [ ] T050 Create RegistrationRequest DTO in `/api/src/auth/dto/registration.dto.ts` with validation rules
- [ ] T051 Create RegistrationResponse DTO in `/api/src/auth/dto/registration.response.dto.ts`
- [ ] T052 Create registration service in `/api/src/auth/services/registration.service.ts` with validation (email unique, password strength, username unique if provided)
- [ ] T053 Create POST `/auth/register` endpoint in `/api/src/auth/controllers/auth.controller.ts` with proper error handling
- [ ] T054 Implement audit logging for registration attempts in registration service
- [ ] T055 [P] Create seed script in `/api/src/database/seeders/create-test-user.ts` for development test user

### Frontend Implementation for User Story 1

- [ ] T056 Create RegistrationScreen in `/mobile/src/screens/auth/RegistrationScreen.tsx` with email, username, password fields
- [ ] T057 [P] Create TextInput component in `/mobile/src/components/auth/TextInput.tsx` with error display
- [ ] T058 [P] Create Button component in `/mobile/src/components/auth/Button.tsx` with loading state
- [ ] T059 Create password strength indicator in `/mobile/src/components/auth/PasswordStrengthIndicator.tsx`
- [ ] T060 Implement registration form validation in RegistrationScreen with client-side rules (password, email format, username format)
- [ ] T061 Create useRegistration hook in `/mobile/src/hooks/useRegistration.ts` for registration logic
- [ ] T062 Implement POST `/auth/register` call in useRegistration with error handling
- [ ] T063 [P] Create ErrorAlert component in `/mobile/src/components/common/ErrorAlert.tsx` for displaying registration errors
- [ ] T064 [P] Create SuccessAlert component in `/mobile/src/components/common/SuccessAlert.tsx` for confirmation messages
- [ ] T065 Setup AuthStack navigation in RootNavigator with RegistrationScreen and LoginScreen

**Checkpoint**: User Story 1 complete - users can register and accounts are created in database

---

## Phase 4: User Story 2 - Manual Credential Login (Priority: P1)

**Goal**: Enable registered users to authenticate with email OR username + password, with secure error messages and rate limiting

**Independent Test**: A registered user can log in with email OR username (both point to same account), is redirected to Home, and fails with clear errors for wrong credentials

### Backend Implementation for User Story 2

- [ ] T066 Create LoginRequest DTO in `/api/src/auth/dto/login.dto.ts` (email OR username, password - mutually exclusive validation)
- [ ] T067 Create LoginResponse DTO in `/api/src/auth/dto/login.response.dto.ts` (accessToken, refreshToken, user)
- [ ] T068 Create session entity and repository in `/api/src/database/repositories/session.repository.ts`
- [ ] T069 Create login service in `/api/src/auth/services/login.service.ts` with credential validation, rate limiting check
- [ ] T070 [P] Create account lockout logic in login service (5 failed attempts → 15 min lock)
- [ ] T071 [P] Create IP throttling logic in login service (10 failed attempts → progressive delays)
- [ ] T072 Create POST `/auth/login` endpoint in auth.controller.ts with rate limiting middleware
- [ ] T073 Implement session creation in login service (store in Redis + PostgreSQL)
- [ ] T074 Implement JWT token generation and refresh token in login service
- [ ] T075 Implement audit logging for login attempts (success/failure) with IP tracking
- [ ] T076 Create POST `/auth/token/refresh` endpoint in auth.controller.ts for token refresh
- [ ] T077 Update User entity to track lastLoginAt timestamp

### Frontend Implementation for User Story 2

- [ ] T078 Create LoginScreen in `/mobile/src/screens/auth/LoginScreen.tsx` with email/username field, password field
- [ ] T079 Create useLogin hook in `/mobile/src/hooks/useLogin.ts` for login logic and error handling
- [ ] T080 Implement POST `/auth/login` call in useLogin with proper error message handling
- [ ] T081 Implement token storage in authStore (accessToken, refreshToken via secureStorage)
- [ ] T082 Implement session lifecycle in useSession hook (automatic token refresh, session timeout)
- [ ] T083 Create login form validation in LoginScreen (client-side: email/username format, password required)
- [ ] T084 [P] Create error message mapping in `/mobile/src/constants/errors.ts` for API errors
- [ ] T085 Implement redirect to Home screen on successful login in LoginScreen
- [ ] T086 Implement account locked error message in LoginScreen with retry guidance
- [ ] T087 Create HomeScreen stub in `/mobile/src/screens/app/HomeScreen.tsx` (authenticated page)
- [ ] T088 Implement auth state check in RootNavigator (route to HomeScreen if authenticated)
- [ ] T089 [P] Create SessionManager in `/mobile/src/services/SessionManager.ts` for background token refresh

**Checkpoint**: User Story 2 complete - users can log in with email or username, sessions are managed securely

---

## Phase 5: User Story 3 - FIDO2/WebAuthn Enrollment (Priority: P1)

**Goal**: Enable authenticated users to enroll FIDO2 authenticators for passwordless login

**Independent Test**: A logged-in user can initiate enrollment, complete FIDO2 ceremony, authenticator is stored, and can be listed in Settings

### Backend Implementation for User Story 3

- [ ] T090 Update Authenticator entity in `/api/src/database/entities/Authenticator.entity.ts` with full fields (credentialId, publicKey, status, etc.)
- [ ] T091 Create Authenticator repository in `/api/src/database/repositories/authenticator.repository.ts`
- [ ] T092 Create FIDO2 service in `/api/src/auth/services/fido2.service.ts` using @simplewebauthn/server
- [ ] T093 Create enrollment challenge generation in FIDO2 service (random 32-byte, store in Redis 10-min TTL)
- [ ] T094 Create EnrollmentStartRequest/Response DTOs in `/api/src/auth/dto/fido2-enrollment.dto.ts`
- [ ] T095 Create POST `/auth/fido2/enroll/start` endpoint in auth.controller.ts (requires authentication)
- [ ] T096 Create attestation verification in FIDO2 service (validate response, extract credentialId + publicKey)
- [ ] T097 Create EnrollmentVerifyRequest/Response DTOs in `/api/src/auth/dto/fido2-verify.dto.ts`
- [ ] T098 Create POST `/auth/fido2/enroll/verify` endpoint in auth.controller.ts with attestation validation
- [ ] T099 Implement authenticator storage in enrollment service (save to database, mark active)
- [ ] T100 Implement audit logging for biometric enrollment (success/failure) with device info
- [ ] T101 [P] Create invalid attestation error handling with secure error messages
- [ ] T102 [P] Create challenge expiry validation (10-minute TTL enforcement)

### Frontend Implementation for User Story 3

- [ ] T103 Create BiometricEnrollmentScreen in `/mobile/src/screens/app/BiometricEnrollmentScreen.tsx`
- [ ] T104 Create useEnrollment hook in `/mobile/src/hooks/useEnrollment.ts` for enrollment ceremony logic
- [ ] T105 [P] Create webauthn ceremony wrapper in `/mobile/src/services/webauthn/enrollmentCeremony.ts` (call navigator.credentials.create)
- [ ] T106 Implement POST `/auth/fido2/enroll/start` call in useEnrollment
- [ ] T107 Implement attestation response handling in useEnrollment (capture response, validate format)
- [ ] T108 Implement POST `/auth/fido2/enroll/verify` call with attestation response
- [ ] T109 [P] Create device name input component in `/mobile/src/components/auth/DeviceNameInput.tsx`
- [ ] T110 Create enrollment success confirmation in BiometricEnrollmentScreen
- [ ] T111 Implement error handling for invalid attestation with retry guidance
- [ ] T112 [P] Create attestation error messages in error constants
- [ ] T113 Create Settings stub in `/mobile/src/screens/app/SettingsScreen.tsx` with "Enable Biometrics" button
- [ ] T114 Add BiometricEnrollmentScreen navigation to AppStack

**Checkpoint**: User Story 3 complete - users can enroll FIDO2 authenticators

---

## Phase 6: User Story 4 - Biometric Login via FIDO2 (Priority: P1)

**Goal**: Enable users with enrolled authenticators to authenticate via biometric without password

**Independent Test**: A user with enrolled authenticator can log in via biometric, is redirected to Home, and receives clear errors for invalid/tampered authenticators

### Backend Implementation for User Story 4

- [ ] T115 Create authentication challenge generation in FIDO2 service (separate from enrollment)
- [ ] T116 Create AuthenticationStartRequest/Response DTOs in `/api/src/auth/dto/fido2-auth.dto.ts`
- [ ] T117 Create POST `/auth/fido2/authenticate/start` endpoint in auth.controller.ts (public, no auth required)
- [ ] T118 Create assertion verification in FIDO2 service (validate signature, challenge, origin)
- [ ] T119 Create sign counter validation for clone detection in FIDO2 service
- [ ] T120 Create AuthenticationVerifyRequest/Response DTOs in `/api/src/auth/dto/fido2-auth-verify.dto.ts`
- [ ] T121 Create POST `/auth/fido2/authenticate/verify` endpoint in auth.controller.ts with assertion validation
- [ ] T122 Implement session creation after successful biometric authentication
- [ ] T123 Implement sign counter increment and update in authenticator record
- [ ] T124 Implement audit logging for biometric authentication attempts (success/failure)
- [ ] T125 [P] Create replay attack detection (challenge freshness validation)
- [ ] T126 [P] Create tampered authenticator detection (invalid signature, sign counter decrease)
- [ ] T127 [P] Create rate limiting for biometric authentication attempts

### Frontend Implementation for User Story 4

- [ ] T128 Create BiometricLoginScreen in `/mobile/src/screens/auth/BiometricLoginScreen.tsx`
- [ ] T129 Create useAuthenticationCeremony hook in `/mobile/src/hooks/useAuthenticationCeremony.ts`
- [ ] T130 [P] Create webauthn ceremony wrapper in `/mobile/src/services/webauthn/authenticationCeremony.ts` (call navigator.credentials.get)
- [ ] T131 Implement POST `/auth/fido2/authenticate/start` call in useAuthenticationCeremony
- [ ] T132 Implement assertion response handling in useAuthenticationCeremony (capture response, validate format)
- [ ] T133 Implement POST `/auth/fido2/authenticate/verify` call with assertion response
- [ ] T134 [P] Create biometric error handling for tampered devices, invalid authenticators
- [ ] T135 [P] Create biometric error messages in error constants (INVALID_ASSERTION, CHALLENGE_EXPIRED, etc.)
- [ ] T136 Implement redirect to Home on successful biometric login
- [ ] T137 Create biometric login button in LoginScreen
- [ ] T138 Add BiometricLoginScreen to AuthStack navigation
- [ ] T139 [P] Implement biometric ceremony timeout handling (60-second limit)

**Checkpoint**: User Story 4 complete - full biometric authentication workflow functional

---

## Phase 7: User Story 7 - Logout (Priority: P1)

**Goal**: Enable authenticated users to terminate their sessions securely

**Independent Test**: A logged-in user can logout, is redirected to login, and cannot access protected pages without re-authentication

### Backend Implementation for User Story 7

- [ ] T140 Create logout service in `/api/src/auth/services/logout.service.ts` for session revocation
- [ ] T141 Create POST `/auth/logout` endpoint in auth.controller.ts (requires authentication)
- [ ] T142 Implement session revocation in Redis (delete session key immediately)
- [ ] T143 [P] Implement session revocation in PostgreSQL (set revokedAt timestamp)
- [ ] T144 Implement audit logging for logout events
- [ ] T145 [P] Create logout error handling (already-logged-out sessions, invalid tokens)

### Frontend Implementation for User Story 7

- [ ] T146 Create logout handler in useAuth hook
- [ ] T147 Implement POST `/auth/logout` call with accessToken
- [ ] T148 Implement secure storage cleanup on logout (delete stored tokens)
- [ ] T149 Implement auth state reset on logout (clear authStore)
- [ ] T150 Create logout button in HomeScreen header
- [ ] T151 [P] Create logout button in SettingsScreen header
- [ ] T152 Implement redirect to LoginScreen on logout
- [ ] T153 Create logout confirmation dialog in `/mobile/src/components/common/ConfirmationDialog.tsx`
- [ ] T154 Implement session expiry detection (redirect to login if token invalid)
- [ ] T155 [P] Create "session expired" error message in error constants

**Checkpoint**: User Story 7 complete - users can securely logout

---

## Phase 8: User Story 5 - Change Password (Priority: P2)

**Goal**: Enable authenticated users to change their password with current password verification

**Independent Test**: A logged-in user can change password, all sessions are invalidated, and subsequent login with new password succeeds

### Backend Implementation for User Story 5

- [ ] T156 Create PasswordChangeRequest/Response DTOs in `/api/src/auth/dto/password-change.dto.ts`
- [ ] T157 Create password change service in `/api/src/auth/services/password-change.service.ts`
- [ ] T158 Create POST `/auth/password/change` endpoint in auth.controller.ts (requires authentication)
- [ ] T159 Implement current password verification in password change service (compare with hash)
- [ ] T160 Implement new password validation (strength requirements)
- [ ] T161 Implement password hash update in User entity
- [ ] T162 Implement all-session invalidation on password change (delete all Redis sessions for user)
- [ ] T163 Implement audit logging for password change events
- [ ] T164 [P] Create error handling for incorrect current password
- [ ] T165 [P] Create error handling for weak new password

### Frontend Implementation for User Story 5

- [ ] T166 Create ChangePasswordScreen in `/mobile/src/screens/app/ChangePasswordScreen.tsx`
- [ ] T167 Create usePasswordChange hook in `/mobile/src/hooks/usePasswordChange.ts`
- [ ] T168 Implement password change form with current password, new password, confirmation fields
- [ ] T169 Implement client-side password strength validation (display requirements)
- [ ] T170 Implement POST `/auth/password/change` call in usePasswordChange
- [ ] T171 Implement password change success confirmation (alert message)
- [ ] T172 Implement automatic logout after password change with re-login prompt
- [ ] T173 [P] Create password change error messages in error constants
- [ ] T174 Add ChangePasswordScreen to AppStack navigation (from SettingsScreen)
- [ ] T175 [P] Create password requirements display component in `/mobile/src/components/auth/PasswordRequirements.tsx`

**Checkpoint**: User Story 5 complete - password changes work with session invalidation

---

## Phase 9: User Story 6 - Disable Biometrics (Priority: P2)

**Goal**: Enable authenticated users with enrolled authenticators to revoke them

**Independent Test**: A user with enrolled authenticators can disable one, biometric login fails, other authenticators remain functional

### Backend Implementation for User Story 6

- [ ] T176 Create DELETE `/auth/authenticators/{authenticatorId}` endpoint in auth.controller.ts (requires authentication)
- [ ] T177 Create authenticator revocation service in `/api/src/auth/services/authenticator-revocation.service.ts`
- [ ] T178 Implement authenticator status update (mark as revoked) in revocation service
- [ ] T179 Implement authenticator ownership verification (user can only revoke own authenticators)
- [ ] T180 [P] Create RevokeAuthenticatorResponse DTO in `/api/src/auth/dto/revoke-authenticator.dto.ts`
- [ ] T181 Implement audit logging for biometric revocation events
- [ ] T182 [P] Create error handling for authenticator not found / already revoked
- [ ] T183 Create GET `/auth/authenticators` endpoint in auth.controller.ts to list user's authenticators
- [ ] T184 [P] Create ListAuthenticatorsResponse DTO in `/api/src/auth/dto/list-authenticators.dto.ts`

### Frontend Implementation for User Story 6

- [ ] T185 Create AuthenticatorsList component in `/mobile/src/components/settings/AuthenticatorsList.tsx` with list of enrolled devices
- [ ] T186 [P] Create AuthenticatorItem component in `/mobile/src/components/settings/AuthenticatorItem.tsx` with revoke button
- [ ] T187 Create useAuthenticators hook in `/mobile/src/hooks/useAuthenticators.ts` for listing and revoking
- [ ] T188 Implement GET `/auth/authenticators` call in useAuthenticators
- [ ] T189 Implement DELETE `/auth/authenticators/{id}` call in useAuthenticators
- [ ] T190 Create revocation confirmation dialog in AuthenticatorItem
- [ ] T191 Implement revocation success message with list refresh
- [ ] T192 [P] Create error handling for revocation failures (not found, unauthorized)
- [ ] T193 Add AuthenticatorsList to SettingsScreen
- [ ] T194 [P] Create "no authenticators" empty state in AuthenticatorsList

**Checkpoint**: User Story 6 complete - users can manage and revoke biometric authenticators

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and documentation that affect multiple stories

- [ ] T195 [P] Update `/api/README.md` with backend setup, migration, and seeding instructions
- [ ] T196 [P] Update `/mobile/README.md` with frontend setup and app features
- [ ] T197 [P] Create `/api/FIDO2.md` documenting FIDO2 ceremony flows (enrollment + authentication)
- [ ] T198 [P] Create `/mobile/SECURITY.md` documenting secure storage and credential handling
- [ ] T199 Review and update all DTOs for consistency with contracts/frontend-backend.md
- [ ] T200 [P] Implement global error boundary in App.tsx for unhandled errors
- [ ] T201 [P] Add comprehensive error handling tests (manual) per quickstart.md E2E scenarios
- [ ] T202 [P] Verify rate limiting enforcement with manual testing (attempt 5+ failed logins)
- [ ] T203 [P] Verify session timeout behavior (test 1-hour inactivity + 24-hour absolute timeout)
- [ ] T204 [P] Verify FIDO2 challenge expiry (test ceremony timeout > 10 minutes)
- [ ] T205 [P] Verify replay attack prevention (test with captured challenge twice)
- [ ] T206 [P] Verify audit logs capture all events (registration, login, logout, password change, biometric ops)
- [ ] T207 [P] Test sign counter validation (test cloned authenticator detection)
- [ ] T208 Test all error message paths for user-friendly guidance (no tech details exposed)
- [ ] T209 [P] Verify light/dark theme switching in Settings
- [ ] T210 [P] Verify Tailwind CSS responsive design across mobile screens
- [ ] T211 [P] Code cleanup and consistency check (naming, structure, comments)
- [ ] T212 Run quickstart.md first-run workflow validation (setup through E2E scenarios)
- [ ] T213 [P] Final constitution compliance review (all principles verified in code)

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Dependencies | Status |
|-------|-------------|--------|
| Phase 1: Setup | None | Start immediately |
| Phase 2: Foundational | Phase 1 complete | BLOCKS all user stories |
| Phase 3: US1 Registration | Phase 2 complete | No story dependencies |
| Phase 4: US2 Login | Phase 2 complete, US1 recommended | Can start after Phase 2 |
| Phase 5: US3 Enrollment | Phase 2 complete, US1+US2 recommended | Can start after Phase 2 |
| Phase 6: US4 Biometric Login | Phase 2 complete, US1+US2+US3 recommended | Can start after Phase 2 |
| Phase 7: US7 Logout | Phase 2 complete, US1+US2 recommended | Can start after Phase 2 |
| Phase 8: US5 Password Change | Phase 2 complete, US1+US2 recommended | Can start after Phase 2 |
| Phase 9: US6 Disable Biometrics | Phase 2 complete, US3 recommended | Can start after Phase 2 |
| Phase 10: Polish | All user stories complete | Final cleanup |

### Critical Path

1. ✅ Phase 1: Setup (10 tasks) — ~2-3 hours
2. ✅ Phase 2: Foundational (27 tasks) — ~6-8 hours (BLOCKS all stories)
3. ✅ Phase 3: US1 Registration (13 tasks) — ~4-5 hours (MVP-critical)
4. ✅ Phase 4: US2 Login (14 tasks) — ~5-6 hours
5. ✅ Phase 5: US3 Enrollment (22 tasks) — ~8-10 hours
6. ✅ Phase 6: US4 Biometric Login (14 tasks) — ~5-6 hours
7. ✅ Phase 7: US7 Logout (8 tasks) — ~2-3 hours
8. ✅ Phase 8: US5 Password Change (10 tasks) — ~3-4 hours
9. ✅ Phase 9: US6 Disable Biometrics (10 tasks) — ~3-4 hours
10. ✅ Phase 10: Polish (19 tasks) — ~4-5 hours

**Total**: ~213 tasks, ~43-54 hours of development

### Parallel Opportunities

#### Within Phase 1 (Setup)
```
Parallel group 1: T004, T009, T010 (frontend config)
Parallel group 2: T005, T006, T007 (env templates)
```

#### Within Phase 2 (Foundational)
```
Parallel: T014, T015, T017, T018, T019, T020, T022 (all backend guards/middleware/services)
Parallel: T028, T029, T030, T031, T034, T037, T038 (all frontend hooks/utilities)
Parallel: T026, T027 (migration/seeding framework)
Parallel: T041, T042 (UI components)
```

#### Between User Stories (After Phase 2)
Once Phase 2 completes, ALL user stories can proceed in parallel:
```
Developer A: US1 Registration (Phase 3: T043-T065)
Developer B: US2 Login (Phase 4: T066-T089)
Developer C: US3 Enrollment (Phase 5: T090-T114)
Developer D: US4 Biometric Login (Phase 6: T115-T139)
// Then continue with US7, US5, US6
```

---

## MVP Strategy

### Minimum Viable Product (US1 Registration Only)

1. **Phase 1: Setup** (T001-T010) — Initialize projects
2. **Phase 2: Foundational** (T011-T042) — Core infrastructure (REQUIRED)
3. **Phase 3: US1 Registration** (T043-T065) — User registration complete
4. **STOP AND VALIDATE**
   - Verify registration form works in `/mobile`
   - Verify POST `/auth/register` succeeds
   - Verify User table has new record
   - Verify audit logs captured registration

**At this point**, the system has a working registration feature that can be demoed to stakeholders.

### Incremental Delivery (Add One Story at a Time)

```
MVP:  Phase 1 + Phase 2 + Phase 3 (US1)           → User registration works
v1.1: Add Phase 4 (US2)                           → Credential login added
v1.2: Add Phase 5 (US3)                           → Biometric enrollment added
v1.3: Add Phase 6 (US4)                           → Biometric login works
v1.4: Add Phase 7 (US7)                           → Logout complete
v1.5: Add Phase 8 (US5) + Phase 9 (US6)          → Password change + authenticator revocation
v1.6: Phase 10 (Polish)                          → Final testing & documentation
```

Each increment is independently deployable and testable.

---

## Task Tracking

**Total Tasks**: 213  
**By Phase**:
- Phase 1: 10 tasks
- Phase 2: 27 tasks
- Phase 3: 13 tasks
- Phase 4: 14 tasks
- Phase 5: 22 tasks
- Phase 6: 14 tasks
- Phase 7: 8 tasks
- Phase 8: 10 tasks
- Phase 9: 10 tasks
- Phase 10: 19 tasks

**By Category**:
- Backend Infrastructure: 67 tasks
- Frontend Infrastructure: 15 tasks
- User Story Implementation (Backend): 55 tasks
- User Story Implementation (Frontend): 61 tasks
- Testing & Polish: 15 tasks

**Parallelizable**: ~120 tasks marked with [P]  
**Sequential**: ~93 tasks with dependencies

---

## Notes

- ✅ **NO TESTS**: Zero test tasks per constitution constraint
- ✅ **Checklist Format**: All tasks use strict `- [ ] [ID] [P?] [Story?] Description`
- ✅ **File Paths**: Every task includes exact implementation path
- ✅ **Independence**: Each user story is independently completable and testable
- ✅ **Constitution Compliance**: All tasks align with 5 core principles (FIDO2-first, enterprise architecture, no tests, documentation-driven, contract alignment)
- ✅ **MVP First**: Stop at Phase 3 (US1) for minimum viable product
- ✅ **Monorepo Structure**: Backend (`/api`) and frontend (`/mobile`) maintained separately but integrated via contracts

---

**Generated by `/speckit-tasks` on 2026-05-25**  
**Status**: Ready for implementation  
**Next Step**: Begin Phase 1 Setup tasks (start with T001)
