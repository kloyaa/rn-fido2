# rn-fido2 Development Guidance

## Constitution & Core Principles

All development MUST follow the **rn-fido2 Constitution** (`.specify/memory/constitution.md`). 

**Key principles**:
- **FIDO2-First Security**: All authentication MUST comply with FIDO2/WebAuthn standards
- **Enterprise-Grade Architecture**: NestJS backend + Expo frontend with proper patterns
- **No Testing**: Testing is explicitly excluded from development
- **Documentation-Driven**: Every feature, flow, and security decision must be documented
- **Contract Alignment**: Frontend/backend MUST follow strict API contracts

## Technology Stack

### Backend (`/api`)
- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Cache**: Redis
- **Language**: TypeScript (strict mode)

### Frontend (`/mobile`)
- **Framework**: React Native (Expo)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)
- **Storage**: Secure platform-native credential storage

## For Additional Context

For technical planning, implementation details, and design artifacts, refer to the current plan in `specs/003-local-network-dev/plan.md`.
