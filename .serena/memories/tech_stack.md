# Tech Stack

## Backend (API)
- **Framework**: Hono - Ultrafast web framework for the Edge
- **Runtime**: Node.js (>=22.14.0)
- **Language**: TypeScript (strict mode)
- **Database ORM**: Drizzle ORM with type-safety
- **Database**: SQLite/PostgreSQL (configurable)
- **Authentication**: Auth.js (better-auth) for OAuth providers
- **Validation**: Zod for schema validation
- **API Documentation**: OpenAPI (Swagger) auto-generated
- **Logging**: Pino for high-performance logging
- **Web Scraping**: Puppeteer for metadata extraction

## Frontend
- **Framework**: React 19 SPA
- **Routing**: TanStack Router (type-safe routing)
- **Bundler**: Rsbuild for fast build performance
- **UI Library**: Radix UI (unstyled components) + CSS modules
- **Language**: TypeScript
- **Testing**: Vitest + React Testing Library + jsdom

## Development Tools
- **Package Manager**: pnpm (>=10.8.0)
- **Monorepo**: Turborepo for task orchestration
- **Linting & Formatting**: Biome (unified tool)
- **Testing**: Vitest for unit and integration tests
- **Dependency Analysis**: Knip for unused code detection
- **Git Hooks**: Husky with lint-staged

## Deployment & Infrastructure
- Under evaluation for database hosting (Neon, Turso, Xata, CockroachDB, Supabase)
- API deployment options (Vercel, Northflank, Zeabur, Render)
- Client deployment (Vercel, Netlify)