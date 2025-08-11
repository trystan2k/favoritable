# AGENTS.md – Coding Agent Guide for favoritable

## Project context

### API

For context about the API project (apps/api), see document [CONTEXT.md](apps/api/docs/CONTEXT.md)

## Build, Lint, and Test Commands

- **API**
  - Build: `pnpm build` (TypeScript)
  - Dev: `pnpm dev`
  - Typecheck: `pnpm typecheck`
  - Lint: `pnpm lint` (no linting configured)
- **Frontend**
  - Build: `pnpm build` (Rsbuild)
  - Dev: `pnpm dev`
  - Typecheck: `pnpm typecheck`
  - Lint: `pnpm lint` (ESLint)
  - Format: `pnpm format` (Prettier)
- **Testing**: No test runner configured; add Jest/Vitest for tests if needed.

## Code Style Guidelines

- **Indentation**: 2 spaces (see .editorconfig)
- **Line endings**: LF, final newline, trim trailing whitespace
- **Imports**: Use ES module syntax (`import ... from ...`)
- **TypeScript**: Strict mode, use explicit types, enable decorators
- **Naming**: camelCase for variables/functions, PascalCase for types/classes
- **Formatting**: Use Prettier (`pnpm format`)
- **Linting**: Use ESLint (frontend only, recommended configs)
- **Error Handling**: Prefer explicit error types, use TypeScript safety
- **File structure**: Organize by feature/module, keep related files together
- **No Cursor/Copilot rules present**

_Refer to this guide for agentic coding in this repository. Update if new tools or rules are added._
