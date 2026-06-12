---
title: FAV-1 App Foundation with Auth Shell and CI
type: development-log
permalink: docs/development-logs/task-FAV-1-app-foundation-with-auth-shell-and-ci
---

# Development Log: FAV-1

## Metadata

- Task ID: FAV-1
- Date (UTC): 2026-06-13T12:00:00Z
- Project: favoritable
- Branch: feature/FAV-1-app-foundation-with-auth-shell-and-ci
- Commit: uncommitted (staged, pending final commit)

## Objective

Deliver the full app foundation epic: public/protected TanStack Start routing, Better Auth + Drizzle/SQLite persistence with Google OAuth, themed Base UI login shell and empty protected shell, runtime light/dark theme switching, feature-sliced architecture, Playwright E2E smoke coverage with test-session bootstrap, and CI alignment.

The epic was decomposed into four child issues:

- **FAV-21**: Public/protected route skeleton with `beforeLoad` guard helpers
- **FAV-22**: Better Auth server/client, Drizzle schema, Google OAuth, session lifecycle
- **FAV-23**: Login page UI, protected app shell UI, theme runtime provider, Base UI integration, CSS Modules with design tokens
- **FAV-24**: CI workflow tuning, E2E smoke pipeline, build preview integration

A canonical plan was merged at `docs/plan/Plan FAV-1 App foundation with auth shell and CI.md`, superseding the original delivery plan and the later feature-sliced refactor plan.

## Implementation Summary

### FAV-21 — Routing / Public-Protected Shell

- Pathless `_protected` layout route (`src/routes/_protected.tsx`) with `beforeLoad` calling `redirectIfLoggedOut()`. Session fetched via isomorphic `getRouteAuthSession` (server uses `getRequest()` + Better Auth API; browser uses auth client singleton).
- `src/routes/login.tsx` with `redirectIfLoggedIn()` guard: authenticated users bounce to `/`, unauthenticated see login shell. Provider availability fetched isomorphically via `getRouteAuthProviderAvailability`.
- Auth guard helpers in `src/features/auth/routes/route-auth.ts`: `redirectIfLoggedOut`, `redirectIfLoggedIn`, `getRouteAuthSession` using `createIsomorphicFn`/`createServerOnlyFn`.
- Provider availability in `src/features/auth/routes/login-route.ts`: `getClientAuthProviderAvailability` and `getRouteAuthProviderAvailability`.
- Root `index.tsx` removed — all `/` traffic goes through `_protected` guard.

### FAV-22 — Better Auth + Drizzle/SQLite Persistence

- `drizzle.config.ts` and `src/db/schema/auth.ts` with four tables: `user`, `session`, `account`, `verification` — Better Auth compatible, SQLite column types, indexes (`session_userId_idx`, `account_userId_idx`, `verification_identifier_idx`), cascade deletes, timestamp defaults via `unixepoch('subsecond')`.
- `src/db/client.ts`: singleton `getDb()` for runtime, `createDb()` for test/override. Uses `@libsql/client`.
- `src/db/database-url.ts`: environment-aware database URL resolution (local file, Turso remote, test overrides).
- `src/features/auth/server/auth.server.ts`: `createAuth()` factory with Drizzle adapter, `tanstackStartCookies` plugin, configurable social providers, singleton `getAuth()`, `getServerAuthSession()` helper.
- `src/features/auth/lib/auth-client.ts`: browser-only `createAuthClient` singleton with origin-relative base URL and `credentials: 'include'`.
- `src/features/auth/server/env.server.ts`: environment configuration for `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, `GOOGLE_CLIENT_ID/SECRET`, trusted origins, secure cookie detection. Local/test fallback defaults, production guard rails.
- `src/features/auth/lib/auth-defaults.ts` and `src/features/auth/lib/auth-providers.ts`: shared auth constants and provider availability types.
- `src/routes/api/auth/$.ts` as Better Auth catch-all handler, `src/routes/api/auth/providers.ts` as JSON endpoint.
- Google OAuth wired with `prompt: 'select_account'`. Facebook, GitHub, Apple scaffolded but inactive.
- `.env.example` with Google Cloud setup guidance: authorized JavaScript origins, redirect URIs, partial-config warning.

### FAV-23 — Theme Runtime / Base UI Shell / Login UI

- `src/shared/theme/theme.ts`: `Theme` type, `getStoredTheme`, `getSystemTheme`, `getPreferredTheme`, `applyTheme`, inline `themeBootstrapScript` before hydration to prevent FOUC.
- `src/shared/theme/ThemeProvider.tsx`: React context with `setTheme`, `toggleTheme`, system media query listener, localStorage persistence.
- Root route injects `themeBootstrapScript` via `dangerouslySetInnerHTML` in `<head>`, wraps app in `<ThemeProvider>`, sets `suppressHydrationWarning` on `<html>`.
- **Login page pixel-perfect**: `src/features/auth/components/LoginPage.tsx` + `LoginPage.module.css` — three-breakpoint responsive grid (mobile stacked, 48rem stacked with sizing, 64rem side-by-side hero+panel). Full-viewport behavior via `100vh`/`100dvh`. Hero section with brand badge, heading, body copy, decorative shapes. Panel with heading, provider buttons, footnote. All spacing/typography/colors from design tokens.
- `src/features/auth/components/ProviderButton.tsx` + `ProviderButton.module.css`: reusable OAuth provider button with loading/disabled states, SVG icons.
- `src/features/app-shell/views/ProtectedAppShell.tsx` + `ProtectedAppShell.module.css`: top bar with app title, theme toggle, profile menu trigger. Content area renders `<Outlet />`.
- `src/features/app-shell/components/ProfileMenu.tsx` + `ProfileMenu.module.css`: Base UI Popover-based profile dropdown with user email and sign-out.
- `src/shared/theme/ThemeToggle.tsx` + `ThemeToggle.module.css`: sun/moon icon toggle consuming `useTheme()` context.
- `src/features/app-shell/views/ProtectedHomePage.tsx` + `ProtectedHomePage.module.css`: empty state body.
- **Base UI migration**: Package changed from `@base-ui-components/react` to `@base-ui/react@^1.5.0`. Imports use subpath exports (`@base-ui/react/popover`, `@base-ui/react/switch`).

### FAV-24 — CI/QA/Review/Fix Loops

- `.github/workflows/ci.yml`: three-job structure — `detect_changes` (docs-only classification), `full_checks` (knip, typecheck, lint, format, test, build, E2E smoke preview), `e2e_tests` (extended E2E with chromium+webkit, gated by label/actor).
- `build:e2e:preview` and `preview:e2e` scripts for E2E preview deployment.
- `src/routes/api/auth/test-session.ts`: secure E2E test-session endpoint gated by `E2E_PREVIEW=true`, localhost, `timingSafeEqual` secret. Uses Better Auth `testUtils()` plugin.
- `e2e/fixtures/test.ts` with `authenticateSession` Playwright fixture.
- `e2e/tests/auth/authenticated-smoke.spec.ts` (@smoke): session lifecycle, reload survival, sign-out redirect.
- `e2e/tests/smoke.spec.ts` (@smoke): logged-out redirect flow.
- `e2e/tests/auth/google-oauth.spec.ts`: env-gated full Google OAuth E2E.
- `scripts/bootstrap-auth-db.mjs` for local DB bootstrap.

### Post-Initial-Log Work

#### Local pnpm dev file-URL runtime fix

- `vite.config.ts`: Cloudflare plugin activation gated by `isCloudflareSsrBuild` (build + not-vitest + not-E2E-preview) instead of `!isVitest`. Prevents Cloudflare SSR env injection during local `pnpm dev`, which broke file-URL database connections.

#### Import-protection fixes

- Route files use feature-sliced path aliases (`@/features/auth/...`, `@/shared/theme/...`) instead of direct `src/lib/` paths.
- `__root.tsx` uses proper `ReactNode` type import.

#### Naming standard renames

- `src/components/HomePage.tsx` deleted. Replaced by `src/features/app-shell/views/ProtectedHomePage.tsx`.
- Component files follow PascalCase convention matching exported component names.
- Test files reorganized to mirror feature ownership.

#### Feature-sliced refactor

- Full migration from flat `src/components/` + `src/lib/` to feature-sliced structure:
  - `src/features/auth/components/` — LoginPage, ProviderButton
  - `src/features/auth/lib/` — auth-client, auth-defaults, auth-providers
  - `src/features/auth/routes/` — route-auth, login-route
  - `src/features/auth/server/` — auth.server, env.server
  - `src/features/app-shell/components/` — ProfileMenu
  - `src/features/app-shell/views/` — ProtectedAppShell, ProtectedHomePage
  - `src/shared/theme/` — theme, ThemeProvider, ThemeToggle
  - `src/db/schema/auth.ts` — auth schema (was `src/db/schema.ts`)
- Route files (`src/routes/**`) remain thin adapters importing from features.
- Tests mirror feature structure: `test/features/auth/**`, `test/features/app-shell/**`, `test/shared/theme/**`.
- E2E tests organized: `e2e/tests/auth/**`.

#### Barrel export removal

- No `export *` barrel files. All imports are direct from feature/shared paths.
- Canonical plan guardrails explicitly prohibit barrel-export indirection.

#### Base UI package migration

- Package: `@base-ui-components/react` → `@base-ui/react@^1.5.0`.
- Imports: `@base-ui/react/popover`, `@base-ui/react/switch` (subpath exports).

#### tanstack-start-architecture skill

- Created `.agents/skills/tanstack-start-architecture/SKILL.md`.
- Defines canonical project shape, feature ownership rules (`src/features/**`, `src/shared/**`, `src/routes/**`), testing ownership, file naming, and guardrails.
- Registered in AGENTS.md as `tanstack-start-architecture`.

#### Merged canonical plan

- `docs/plan/Plan FAV-1 App foundation with auth shell and CI.md` — merged original delivery plan with feature-sliced refactor plan.
- Documents architecture decisions (route layer, feature ownership, testing ownership), implementation sequence, guardrails, validation checklist, and out-of-scope boundaries.

## Files Changed

### Database & Schema

- `drizzle.config.ts` — Drizzle Kit configuration for SQLite
- `src/db/schema/auth.ts` — User, session, account, verification tables with relations and indexes
- `src/db/client.ts` — Singleton DB client with `@libsql/client`
- `src/db/database-url.ts` — Environment-aware database URL resolution
- `drizzle/0000_great_tigra.sql` — Initial migration SQL
- `drizzle/meta/_journal.json`, `drizzle/meta/0000_snapshot.json` — Migration metadata

### Auth Server & Client (feature-sliced)

- `src/features/auth/server/auth.server.ts` — Better Auth factory with Drizzle adapter, singleton cache
- `src/features/auth/server/env.server.ts` — Environment configuration with production guards
- `src/features/auth/lib/auth-client.ts` — Browser-only auth client singleton
- `src/features/auth/lib/auth-defaults.ts` — Shared auth constants
- `src/features/auth/lib/auth-providers.ts` — Provider availability types
- `src/features/auth/routes/route-auth.ts` — Isomorphic route auth helpers
- `src/features/auth/routes/login-route.ts` — Isomorphic provider availability
- `src/routes/api/auth/$.ts` — Better Auth catch-all handler
- `src/routes/api/auth/providers.ts` — JSON provider availability endpoint
- `src/routes/api/auth/test-session.ts` — Secure E2E test-session bootstrap endpoint

### Routing & Guards

- `src/routes/__root.tsx` — Root route with theme bootstrap script, ThemeProvider, suppressHydrationWarning
- `src/routes/_protected.tsx` — Pathless protected layout with `beforeLoad` session guard
- `src/routes/_protected/index.tsx` — Authenticated home page (empty shell)
- `src/routes/login.tsx` — Login route with auth redirect and provider availability

### UI Components & Theming (feature-sliced)

- `src/features/auth/components/LoginPage.tsx` / `LoginPage.module.css` — Login page with three-breakpoint responsive grid
- `src/features/auth/components/ProviderButton.tsx` / `ProviderButton.module.css` — Reusable OAuth provider button
- `src/features/app-shell/components/ProfileMenu.tsx` / `ProfileMenu.module.css` — Base UI Popover profile dropdown
- `src/features/app-shell/views/ProtectedAppShell.tsx` / `ProtectedAppShell.module.css` — Protected layout chrome
- `src/features/app-shell/views/ProtectedHomePage.tsx` / `ProtectedHomePage.module.css` — Empty protected body
- `src/shared/theme/theme.ts` — Theme types, helpers, bootstrap script
- `src/shared/theme/ThemeProvider.tsx` — Theme context provider
- `src/shared/theme/ThemeToggle.tsx` / `ThemeToggle.module.css` — Light/dark toggle button

### Tests (feature-mirrored)

- `test/features/auth/components/LoginPage.browser.test.tsx`
- `test/features/auth/components/ProviderButton.browser.test.tsx`
- `test/features/auth/lib/auth-client.test.ts`
- `test/features/auth/routes/route-auth.test.ts`
- `test/features/auth/server/auth-bootstrap.test.ts`
- `test/features/auth/server/auth.server.test.ts`
- `test/features/auth/server/env.server.test.ts`
- `test/features/app-shell/components/ProfileMenu.browser.test.tsx`
- `test/features/app-shell/views/ProtectedAppShell.browser.test.tsx`
- `test/features/app-shell/views/ProtectedHomePage.browser.test.tsx`
- `test/shared/theme/ThemeToggle.browser.test.tsx`
- `test/shared/theme/theme.test.ts`
- `test/db/database-url.test.ts`
- `test/routes/auth-routes.test.tsx`
- `test/router.test.ts`

### E2E Tests

- `e2e/tests/smoke.spec.ts` — Logged-out redirect smoke test (@smoke)
- `e2e/tests/auth/authenticated-smoke.spec.ts` — Authenticated session smoke test (@smoke)
- `e2e/tests/auth/google-oauth.spec.ts` — Full Google OAuth E2E (env-gated)
- `e2e/fixtures/test.ts` — Playwright fixtures with `authenticateSession`
- `e2e/utils/routes.ts` — Shared route constants

### CI & Configuration

- `.github/workflows/ci.yml` — Three-job CI pipeline with docs-only detection
- `.env.example` — Environment variables with Google OAuth setup guidance
- `vite.config.ts` — Cloudflare SSR build guard, coverage exclude updates
- `package.json` — Scripts, `@base-ui/react@^1.5.0`, better-auth, drizzle-orm, etc.
- `drizzle.config.ts` — Drizzle Kit migration configuration
- `scripts/bootstrap-auth-db.mjs` — Local auth DB bootstrap script
- `playwright.config.ts` — E2E configuration updates

### Documentation & Skills

- `docs/plan/Plan FAV-1 App foundation with auth shell and CI.md` — Merged canonical plan
- `.agents/skills/tanstack-start-architecture/SKILL.md` — Feature-sliced architecture skill

### Deleted (replaced by feature-sliced equivalents)

- `src/components/HomePage.tsx` — Replaced by `src/features/app-shell/views/ProtectedHomePage.tsx`
- `src/routes/index.tsx` — Replaced by `src/routes/_protected/index.tsx`
- `test/components/home_page.browser.test.tsx` — Replaced by feature-mirrored tests
- `test/utils/routes.ts` — Consolidated

## Key Decisions

1. **Feature-sliced architecture over flat structure**: Auth, app-shell, and theme code organized under `src/features/` and `src/shared/` with clear ownership boundaries. Route files remain thin adapters. Prevents flat-directory sprawl as features grow.

2. **No barrel exports**: Direct imports from feature paths only. Avoids circular dependency risk, tree-shaking degradation, and implicit coupling.

3. **Pathless `_protected` layout route with `beforeLoad` guard**: Prevents protected content from ever rendering without a session. Reusable for all future nested routes.

4. **Drizzle ORM from day one for auth tables**: SQLite-compatible via `@libsql/client` supports both local file and Turso remote.

5. **Isomorphic route auth helpers**: Server and browser share same API (`redirectIfLoggedOut`/`redirectIfLoggedIn`) via `createIsomorphicFn`/`createServerOnlyFn`.

6. **Environment-aware auth configuration with production guards**: Sensible defaults for local/test, throws in production if required values missing.

7. **Cloudflare plugin gated to SSR build only**: `isCloudflareSsrBuild` check prevents Cloudflare env injection during `pnpm dev` and E2E preview, which broke file-URL database connections.

8. **Base UI `@base-ui/react` with subpath imports**: Migrated from `@base-ui-components/react` to stable `@base-ui/react@^1.5.0` using subpath exports (`@base-ui/react/popover`, `@base-ui/react/switch`).

9. **E2E test-session bootstrap via secure API endpoint**: Creates ephemeral users with real Better Auth sessions. Gated by env + hostname + timing-safe secret.

10. **Theme bootstrap before hydration**: Inline `<script>` in `<head>` reads localStorage and sets `data-theme` + `colorScheme` before React hydrates, preventing FOUC.

11. **Canonical plan as single source of truth**: Merged original delivery plan and feature-sliced refactor plan into one document at `docs/plan/`.

12. **`tanstack-start-architecture` skill**: Codifies feature-sliced rules for future agents/tasks, ensuring consistent structure.

13. **Google-only active OAuth; others as placeholders**: Facebook, GitHub, Apple scaffolded but require no credentials.

## Validation Performed

- **Unit tests**: 15 test files covering auth server/client, env configuration, route guards, theme utilities, database URL resolution.
- **Browser tests**: 6 component browser test files with Vitest browser mode.
- **E2E smoke tests**: 2 `@smoke` specs — logged-out redirect flow and authenticated session lifecycle.
- **CI pipeline**: `pnpm complete-check` equivalent (knip, typecheck, lint, format, test, build, E2E smoke) passing green.
- **Build verification**: Production build succeeds; E2E preview build (`E2E_PREVIEW=true`) succeeds.
- **Local dev**: `pnpm dev` starts without Cloudflare runtime errors (file-URL DB works).
- **Manual QA**: Login page renders pixel-perfect at mobile/tablet/desktop breakpoints, theme toggle works, protected shell renders after auth.

## Risks and Follow-ups

- **Google OAuth E2E depends on external credentials**: `google-oauth.spec.ts` requires real Google OAuth client and test account. Not part of default CI. Needs credential management strategy for PR-based runs.
- **Test-session endpoint security**: Gated by env + hostname + timing-safe secret. May need more robust scoping if E2E requirements expand.
- **Placeholder providers may drift**: Facebook/GitHub/Apple scaffolding exists but untested. Verify provider-specific scopes, callback URLs, token handling when activating.
- **Database migration strategy**: Only one migration exists. Future bookmark tables extend same Drizzle schema. Migration tooling and versioning should be documented.
- **Feature-sliced boundaries need enforcement**: Architecture skill defines rules, but no automated lint/guard prevents violations. Consider structural lint rules later.
- **Session cookie security in production**: `useSecureCookies` derives from base URL scheme. Verify cookie flags in production deployment.
- **Theme provider is client-only**: No server-side theme preference. Bootstrap script approach must be extended if SSR-themed content needed.
