# Suggested Commands

## Essential Development Commands

### Quality Assurance (MANDATORY before commits)
```bash
# Complete quality check - RUN BEFORE EVERY COMMIT
pnpm run complete-check

# Individual checks
pnpm typecheck          # TypeScript type checking
pnpm lint              # Biome linting
pnpm test:coverage     # Tests with coverage
pnpm build             # Build all packages
pnpm knip              # Check for unused dependencies
```

### Development
```bash
# Start development servers
pnpm dev               # Start all apps in development mode
pnpm build             # Build all packages for production

# Package management
pnpm install           # Install all dependencies
```

### Testing
```bash
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
```

### Code Quality
```bash
pnpm lint              # Check for linting issues
pnpm lint:fix          # Fix auto-fixable linting issues
pnpm format            # Check formatting
pnpm format:fix        # Fix formatting issues
pnpm check             # Run Biome check (lint + format)
pnpm check:fix         # Fix all auto-fixable issues
```

### Database (API specific)
```bash
cd apps/api
pnpm db:generate       # Generate database migrations
pnpm db:migrate        # Run database migrations
pnpm db:health         # Check database health
```

### System Utilities (Darwin/macOS)
```bash
date "+%Y-%m-%d_%H:%M:%S"  # Get current timestamp
ls -la                     # List files with details
find . -name "*.ts"        # Find TypeScript files
grep -r "pattern" src/     # Search for patterns (use ripgrep: rg)
git status                 # Check git status
git log --oneline         # View commit history
```

### Docker (API deployment)
```bash
cd apps/api
pnpm docker:build      # Build Docker image
pnpm docker:run        # Run container
pnpm docker:stop       # Stop and remove container
pnpm docker:logs       # View container logs
```

## Critical Notes
- **NEVER** commit without running `pnpm run complete-check` first
- All quality checks must pass (no warnings, no errors)
- Use `pnpm` exclusively (other package managers are blocked)
- Run commands from project root unless specified otherwise