# Codebase Structure

## Monorepo Organization
```
favoritable/
├── apps/
│   ├── api/                 # Backend Hono API
│   └── frontend/            # React frontend
├── packages/
│   └── development/
│       ├── lint-config/     # Biome configuration
│       ├── test-config/     # Vitest configuration
│       └── typescript-config/ # TypeScript configurations
├── docs/                    # Documentation and ADRs
└── turbo.json              # Turborepo configuration
```

## API Structure (Clean Architecture)
```
apps/api/src/
├── core/                    # Core utilities and dependencies
│   ├── dependency-injection/ # DI container and decorators
│   ├── logger.ts           # Pino logging setup
│   └── puppeteer.scrapper.ts # Web scraping
├── features/               # Feature-based modules
│   ├── bookmarks/          # Bookmark domain
│   │   ├── bookmark.models.ts
│   │   ├── bookmark.repository.ts
│   │   ├── bookmark.services.ts
│   │   └── bookmark.routes.ts
│   ├── labels/             # Label domain
│   └── common/auth/        # Authentication
├── db/                     # Database layer
│   ├── schema/             # Drizzle schemas
│   ├── migrations/         # Database migrations
│   └── index.ts           # Database connection
├── middleware/             # HTTP middleware
├── utils/                  # Shared utilities
└── errors/                 # Error handling
```

## Frontend Structure
```
apps/frontend/src/
├── routes/                 # TanStack Router routes
├── components/             # Reusable UI components
├── hooks/                  # React hooks
├── utils/                  # Frontend utilities
└── index.tsx              # Application entry point
```

## Architectural Layers (API)

### 1. Routes/Controllers (Hono Handlers)
- Handle HTTP requests/responses
- Parse incoming requests
- Call appropriate services
- Located in `*.routes.ts` files

### 2. Services
- Core application logic and use cases
- Orchestrate data flow
- Convert DTOs to Models
- Business-specific operations
- Located in `*.services.ts` files

### 3. Repositories  
- Abstract data source access
- Database queries and operations
- Return DTOs to services
- Database-agnostic interface
- Located in `*.repository.ts` files

### 4. Models & DTOs
- **Models**: Core domain entities
- **DTOs**: Data transfer objects between layers
- Type-safe data structures

## Key Patterns
- **Dependency Injection**: Services receive dependencies via DI container
- **Feature-Based Organization**: Group related functionality together
- **Type Safety**: End-to-end TypeScript with Drizzle ORM
- **Separation of Concerns**: Clear layer responsibilities
- **Repository Pattern**: Abstract database access