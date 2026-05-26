# HYPERSTACKS rn-fido2

A React Native FIDO2/WebAuthn authentication system with a NestJS backend and Expo mobile frontend.

## Quick Start

### Installation

```bash
# Install dependencies for all workspaces
npm install
```

### Starting Development Services

#### Start All Services
Start both API and mobile development servers concurrently:
```bash
npm start
```

Both services will start in parallel with colored log output:
- `[api]` prefix for NestJS API (port 3000)
- `[mobile]` prefix for Expo (port 8081)

#### Start API Only
```bash
npm run start:api
```

Launches the NestJS API server on port 3000. Useful for backend-only development.

#### Start Mobile Only
```bash
npm run start:mobile
```

Launches the Expo development server on port 8081. Useful for mobile UI development.

#### Configure for Physical Device (Local Network)
```bash
npm run setup:network
```

Detects your machine's local IP and configures both API and mobile for physical device connection. Run this once before `npm start` when testing on a physical device. Re-run whenever your IP changes (e.g., after reconnecting to WiFi).

#### Install All Dependencies
```bash
npm run install:all
```

Installs dependencies in both `api/` (via pnpm) and `mobile/` (via npm).

> **Note**: `api/` uses pnpm and `mobile/` uses npm. Scripts invoke each service directly rather than using npm workspaces to avoid package manager conflicts.

## Project Structure

```
.
├── api/                 # NestJS backend (TypeScript)
├── mobile/              # Expo mobile app (React Native + TypeScript)
├── specs/               # Feature specifications and documentation
└── package.json         # Root workspace configuration
```

## Technology Stack

### Backend (`/api`)
- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Cache**: Redis
- **Language**: TypeScript (strict mode)
- **Authentication**: FIDO2/WebAuthn

### Frontend (`/mobile`)
- **Framework**: React Native (Expo)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)
- **Storage**: Secure platform-native credential storage

## Development Guidelines

- **FIDO2-First Security**: All authentication MUST comply with FIDO2/WebAuthn standards
- **Enterprise Architecture**: Follow production-grade patterns (strict typing, validation, error handling)
- **Documentation-Driven**: All features, flows, and decisions must be documented
- **Contract Alignment**: Frontend/backend communication follows strict API contracts

For complete guidance, see [CLAUDE.md](./CLAUDE.md) and the project constitution at `.specify/memory/constitution.md`.

## Available Commands

For detailed command usage, troubleshooting, and development workflows, see [specs/002-root-dev-scripts/USAGE.md](./specs/002-root-dev-scripts/USAGE.md).

## Environment Setup

Create `.env` files in respective directories:

**`/api/.env`**:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/fido2_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-dev-secret
FIDO2_ORIGIN=http://localhost:8081
```

**`/mobile/.env`**:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENVIRONMENT=development
```

## Troubleshooting

### Services fail to start on "Port already in use"

```bash
# Free port 3000 (API)
lsof -ti:3000 | xargs kill -9

# Free port 8081 (Mobile)
lsof -ti:8081 | xargs kill -9
```

### Missing dependencies

```bash
npm install
# or for specific workspace
npm --workspace=api install
npm --workspace=mobile install
```

For more troubleshooting, see the [USAGE.md](./specs/002-root-dev-scripts/USAGE.md) guide.

## Documentation

- **Features & Specifications**: `specs/` directory
- **Development Guidance**: [CLAUDE.md](./CLAUDE.md)
- **Project Constitution**: `.specify/memory/constitution.md`
- **Root Scripts Usage**: [specs/002-root-dev-scripts/USAGE.md](./specs/002-root-dev-scripts/USAGE.md)

## Getting Help

- Check [USAGE.md](./specs/002-root-dev-scripts/USAGE.md) for command reference and workflows
- Review service logs when services fail (start individually for clearer output)
- Check `.env` configuration for missing or incorrect values
- Review FIDO2/WebAuthn documentation for authentication-related issues

---

**Last Updated**: 2026-05-25 | **Node Version**: 18 LTS+ (24 LTS recommended) | **npm**: 7+
