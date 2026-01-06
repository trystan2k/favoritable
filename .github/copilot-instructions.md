# Copilot Coding Agent Instructions

## Review Philosophy
- Only comment when you have HIGH CONFIDENCE (>80%) that an issue exists
- Be concise: one sentence per comment when possible
- Focus on actionable feedback, not observations
- When reviewing text, only comment on clarity issues if the text is genuinely confusing or could lead to errors.

### Security & Safety
- Unsafe code blocks without justification
- Command injection risks (shell commands, user input)
- Path traversal vulnerabilities
- Credential exposure or hardcoded secrets
- Missing input validation on external data
- Improper error handling that could leak sensitive info

### Correctness Issues
- Logic errors that could cause panics or incorrect behavior
- Race conditions in async code
- Resource leaks (files, connections, memory)
- Off-by-one errors or boundary conditions
- Optional types that don’t need to be optional
- Error context that doesn’t add useful information (e.g., `.context("Failed to do X")` when error already says it failed)
- Overly defensive code that adds unnecessary checks
- Unnecessary comments that just restate what the code already shows (remove them)

### Architecture & Patterns
- Code that violates existing patterns in the codebase
- Missing error handling
- Async/await misuse or blocking operations in async contexts
- Improper trait implementations

*Important**: You review PRs immediately, before CI completes. Do not flag issues that CI will catch.

### What Our CI Checks (`.github/workflows/ci.yml`)

**App checks:**
- `pnpm install --frozen-lockfile` - Fresh dependency install 
- `pnpm lint` - Biome linting
- `pnpm typecheck` - TypeScript type checking
- `pnpm test:coverage` - Vitest tests 
- `pnpm build` - Astro build (production)

**Key insight**: Commands like `npx` check local `node_modules` first, which CI installs via `pnpm install --frozen-lockfile`. 
Don’t flag these as broken unless you can explain why CI setup wouldn't handle it.

## Skip These (Low Value)

Do not comment on:
- **Style/formatting** - CI handles this
- **Test failures** - CI handles this (full test suite)
- **Missing dependencies** - CI handles this (pnpm install)
- **Minor naming suggestions** - unless truly confusing
- **Suggestions to add comments** - for self-documenting code
- **Refactoring suggestions** - unless there’s a clear bug or maintainability issue
- **Multiple issues in one comment** - choose the single most critical issue
- **Logging suggestions** - unless for errors or security events (the codebase needs less logging, not more)
- **Pedantic accuracy in text** - unless it would cause actual confusion or errors. No one likes a reply guy

## Response Format

When you identify an issue:
1. **State the problem** (1 sentence)
2. **Why it matters** (1 sentence, only if not obvious)
3. **Suggested fix** (code snippet or specific action)

Example:
This could panic if the vector is empty. Consider using `.get(0)` or add a length check.

## When to Stay Silent

If you’re uncertain whether something is an issue, don’t comment. False positives create noise and reduce trust in the review process.

## Repository Overview
This project is a **monorepo** managed by **Turbo** and **pnpm**, containing:

- **apps/api**: A Node.js API built with **Hono**, **Drizzle ORM**, and **SQLite/LibSQL**. It features a custom Dependency Injection (DI) system and uses **Better Auth** for authentication.
- **apps/frontend**: A React 19 application built with **Rsbuild** and **TanStack Router**. It uses **React Aria Components** for UI primitives and **CSS Modules** for styling.
- **packages/**: Shared configuration packages (`lint-config`, `test-config`, `typescript-config`, `themes`).

### Critical Dependencies
- **Monorepo Tools**: `pnpm`, `turbo`, `knip`
- **Linting/Formatting**: `biome`
- **API**: `hono`, `drizzle-orm`, `better-auth`, `zod`, `puppeteer`, `vitest`
- **Frontend**: `react`, `@tanstack/react-router`, `rsbuild`, `react-aria-components`, `lucide-react`

## Code Style Guidelines

### Formatting & Linting (Biome)
- **Indentation**: 2 spaces (enforced by .editorconfig and biome.json)
- **Line width**: 100 characters
- **Quote style**: Single quotes for JavaScript/TypeScript
- **Trailing commas**: ES5 style (arrays, objects, not function params)
- **Line endings**: LF (Unix style)
- **Final newline**: Required in all files
- **Trailing whitespace**: Automatically trimmed

### TypeScript Conventions
- **Strict Mode**: Enabled.
- **Validation**: Use **Zod** for schema validation.
- **Types**: Prefer `type` over `interface` for models and DTOs.
- **Return Types**: Explicit return types are required for Services and Public APIs.
- **Dependency Injection**: Use `@Service` and `@Inject` decorators (in API).
- **Path Aliases**: Use absolute imports where configured, or relative imports consistent with the project structure.

### API Patterns (Node/Hono)
- **Architecture**: Layered architecture (Routes → Services → Repositories).
- **Dependency Injection**:
  - Use `@Service({ name: '...' })` to register classes.
  - Use `@Inject('Token')` for constructor injection.
  - Dependencies flow: Repository → Service → Route.
- **Routing**:
  - Class-based routes (e.g., `export class BookmarkRoutes`).
  - Encapsulate `Hono` instance in the class.
  - Use `zCustomValidator` for Zod validation on `query`, `param`, and `json`.
- **Data Access**:
  - **Interface-First**: Define repository interfaces (e.g., `BookmarkRepository`).
  - **Implementation**: Implement with Drizzle ORM (e.g., `SQLiteBookmarkRepository`).
  - Use Drizzle's `query` builder for relations and `returning()` for mutations.
- **Error Handling**:
  - Throw custom `APIError` or subclasses (`NotFoundError`, `NotAuthorizedError`).
  - Global error handler standardizes responses (JSON with error code and timestamp).
  - Production error messages are sanitized.
- **Logging**:
  - Use `logger` (Pino) with context (`logger.child({ context: '...' })`).

### Testing Conventions (CRITICAL)
- **Framework**: **Vitest** for all tests.
- **API Tests**:
  - **Integration**: Use `app.request()` to test endpoints (`tests/auth/auth-integration.test.ts`).
  - **Structure**: Use `describe`, `test`, `expect`.
  - **Error Handling**: Verify standardized error responses (code, message, timestamp).
- **Frontend Tests**:
  - Use **@testing-library/react** and **jsdom**.
- **Coverage**: 100% coverage thresholds enforced for critical paths (or set to 0 to verify config).
- **Mocking**: Mock external dependencies and database calls in unit tests.

### React Component Patterns
- **Framework**: React 19 with Functional Components.
- **Routing**: **TanStack Router** (file-based routing in `routes/`).
- **Styling**: **CSS Modules** (`*.module.css`) combined with a `cx` utility.
- **UI Library**: **React Aria Components** for accessible primitives.
- **Hooks**: Custom hooks for logic reuse (e.g., `useTheme`).
- **Structure**:
  - Components: `src/components/`
  - Routes: `src/routes/`
  - Contexts: `src/contexts/`

### File Naming
- **General**: `kebab-case` for most files (e.g., `auth-integration.test.ts`, `bookmark.services.ts`).
- **React Components**: `PascalCase` (e.g., `ThemeSwitcher.tsx`).
- **API Layers**:
  - Services: `*.services.ts`
  - Repositories: `*.repository.ts`
  - Models: `*.models.ts`
  - Mappers: `*.mappers.ts`
  - Schemas: `*.schema.ts`
  - Routes: `*.routes.ts`
- **Frontend Routes**: Follow TanStack Router conventions (`__root.tsx`, `index.tsx`, `route.tsx`).

## Additional Resources
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html)
- [Biome Documentation](https://biomejs.dev/)

### Documentation Files (Read First)
- `docs/PRD/PRD.md`: Complete product requirements, game rules, data models, technical stack
- `docs/DEV_WORKFLOW.md`: Mandatory development workflow (authorization, quality gates, commits)
- `docs/TESTING.md`: Testing guidelines and coverage requirements
- `AGENTS.md`: Agent-specific instructions and onboarding checklist

## Trust These Instructions

These instructions are comprehensive and validated. Trust them and only perform additional searches if:
1. Information here is incomplete for your specific task
2. You encounter errors not covered by these instructions
3. You need implementation details beyond architectural guidance

Always refer to `docs/DEV_WORKFLOW.md` for the complete mandatory workflow before starting any task.
