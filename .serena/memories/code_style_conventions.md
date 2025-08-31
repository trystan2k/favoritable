# Code Style and Conventions

## General Conventions
- **Package Manager**: Always use `pnpm` (enforced by preinstall script)
- **Node Version**: >=22.14.0, pnpm >=10.8.0
- **Language**: TypeScript with strict mode enabled
- **Module System**: ES modules (`import/export`)

## Formatting (via Biome)
- **Indentation**: 2 spaces (no tabs)
- **Line Endings**: LF (Unix-style)
- **Line Width**: 80 characters
- **Semicolons**: Always required
- **Quotes**: Single quotes for JS/TS, double quotes for JSX attributes
- **Trailing Commas**: ES5 style
- **Arrow Functions**: Always use parentheses around parameters

## Naming Conventions
- **Variables & Functions**: camelCase (`getUserData`, `isValid`)
- **Types & Classes**: PascalCase (`BookmarkModel`, `UserService`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case for components, camelCase for utilities

## TypeScript Guidelines
- **Strict Mode**: Enabled with decorators support
- **Explicit Types**: Use explicit types, avoid `any`
- **Imports**: Use ES module syntax exclusively
- **Error Handling**: Prefer explicit error types over generic errors

## File Organization
- **Structure**: Organize by feature/module
- **Tests**: Use `.test.ts` extension (NEVER `.spec.ts`)
- **Test Location**: Place in `tests/` directories (NEVER `specs/`)
- **Imports**: Organize imports automatically via Biome

## Architecture Principles
- **Clean Architecture**: Separate concerns (Routes → Services → Repositories → Models)
- **Dependency Injection**: Use DI container for services
- **Type Safety**: End-to-end type safety from database to API to frontend
- **No Comments**: Avoid comments unless explicitly requested (self-documenting code)