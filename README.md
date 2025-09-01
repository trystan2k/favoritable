# Favoritable

A modern bookmark management application built with TypeScript, featuring a Fastify API backend and React frontend, powered by OAuth authentication and comprehensive bookmark organization tools.

## Architecture

This monorepo contains:

### Apps and Packages

- `apps/api`: Fastify backend API with Drizzle ORM, Better Auth, and comprehensive testing
- `apps/frontend`: React frontend with TanStack Router and Rsbuild
- `packages/development/lint-config`: Biome configuration for linting and formatting
- `packages/development/test-config`: Vitest configuration for testing
- `packages/development/typescript-config`: TypeScript configurations

## Features

### Authentication
- **OAuth Integration**: Support for 5 OAuth providers (GitHub, Google, Facebook, Twitter/X, Apple)  
- **Email/Password**: Traditional authentication with secure session management
- **JWT Support**: Apple OAuth with JWT client secret generation
- **PKCE Security**: Enhanced OAuth security with Proof Key for Code Exchange

### Bookmark Management  
- Create, read, update, and delete bookmarks
- Label-based organization system
- URL metadata extraction and validation
- Advanced search and filtering capabilities

### Technology Stack
- **Backend**: Fastify, Drizzle ORM, Better Auth, Zod validation
- **Frontend**: React, TanStack Router, Rsbuild
- **Database**: SQLite with libSQL (Turso) support
- **Testing**: Vitest with comprehensive test coverage
- **Quality Tools**: Biome for linting/formatting, Knip for unused code detection

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd favoritable

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
# Configure your OAuth providers and database settings

# Push database schema 
pnpm --filter @favoritable/api db:push

# Start development servers
pnpm dev
```

### OAuth Provider Setup

The application supports five OAuth providers. See `apps/api/README.md` for detailed setup instructions:

- **GitHub**: Developer Settings → OAuth Apps
- **Google**: Cloud Console → OAuth 2.0 Client IDs  
- **Facebook**: Meta for Developers → Facebook Login
- **Twitter/X**: Developer Portal → OAuth 2.0 App
- **Apple**: Developer Portal → Sign in with Apple (requires JWT configuration)

Each provider requires registration and callback URL configuration pointing to your API endpoints.

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm dev:api          # Start API server only
pnpm dev:frontend     # Start frontend server only

# Building
pnpm build            # Build all packages
pnpm build:api        # Build API only
pnpm build:frontend   # Build frontend only

# Quality Assurance
pnpm typecheck        # Type checking across all packages
pnpm lint             # Lint all packages with Biome
pnpm format           # Format code with Biome
pnpm knip             # Detect unused code
pnpm test             # Run all tests
pnpm test:coverage    # Run tests with coverage reports
pnpm complete-check   # Run all QA checks (typecheck + lint + knip + test + build)

# Database
pnpm --filter @favoritable/api db:push     # Push schema to database
pnpm --filter @favoritable/api db:generate # Generate migration files
pnpm --filter @favoritable/api db:health   # Test database connection
```

### API Endpoints

#### Authentication
- `POST /api/auth/sign-up` - Create new user account  
- `POST /api/auth/sign-in` - Email/password authentication
- `GET /api/auth/session` - Get current user session
- `POST /api/auth/sign-out` - Sign out current user
- `GET /api/auth/{provider}` - Initiate OAuth flow (github, google, facebook, twitter, apple)
- `GET /api/auth/callback/{provider}` - OAuth callback endpoints

#### Bookmarks  
- `GET /api/bookmarks` - List user bookmarks with filtering
- `POST /api/bookmarks` - Create new bookmark
- `GET /api/bookmarks/:id` - Get bookmark details
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark

#### Labels
- `GET /api/labels` - List user labels
- `POST /api/labels` - Create new label  
- `PUT /api/labels/:id` - Update label
- `DELETE /api/labels/:id` - Delete label

### Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Core business logic and utilities
- **Integration Tests**: Database operations and API endpoints  
- **Error Handling Tests**: Authentication and validation errors
- **OAuth Configuration Tests**: Provider setup verification

Run tests with detailed coverage reports:

```bash
pnpm test:coverage
```

### Code Quality

Automated code quality enforcement using:

- **Biome**: Unified linting and formatting (replaces ESLint + Prettier)
- **TypeScript**: Strict type checking across all packages
- **Knip**: Dead code elimination and unused dependency detection
- **Vitest**: Fast testing with comprehensive coverage reporting

Pre-commit hooks ensure all code meets quality standards before commits.

## Deployment

### Environment Configuration

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_TYPE=local|turso
LOCAL_DATABASE_URL=file:./dev.db
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# OAuth Providers (configure as needed)  
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# ... (see .env.example for all providers)

# Security
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com
```

### Production Deployment

1. **Database**: Set up Turso database and configure connection
2. **OAuth Apps**: Register applications with each OAuth provider  
3. **Environment**: Configure all required environment variables
4. **Build**: Run `pnpm build` to create production builds
5. **Deploy**: Deploy API and frontend to your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the established code style
4. Run quality checks (`pnpm complete-check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.