# Plan FAV-1 App foundation with auth shell and CI

## Canonical status

- Canonical FAV-1 plan for this branch/task.
- Merges original delivery plan with later feature-sliced refactor plan.
- Supersedes `docs/plan/Plan FAV-1 App foundation with auth shell and CI - feature-sliced structure refactor.md`.

## Goal

Deliver FAV-1 foundation by reusing FAV-17 groundwork and finishing four connected outcomes:

1. Public/protected TanStack Start route skeleton.
2. Better Auth + Drizzle + SQLite-compatible auth persistence.
3. Token-driven login shell and empty protected shell with runtime light/dark theme.
4. CI validation aligned to new foundation.

## Scope and dependencies

- Reuse FAV-17 assets. Do not replace token pipeline, test scaffolding, or baseline CI.
- Keep scope limited to login shell, protected shell chrome, auth/session flow, theme runtime, and CI alignment.
- Do not add bookmark-library features, provider X, install surfaces, or non-required design extras.
- Child-task dependency order stays:
  - FAV-21: route skeleton first.
  - FAV-22: auth + persistence on top of route skeleton.
  - FAV-23: themed UI shell on top of route + auth contracts.
  - FAV-24: CI verification/tuning on top of completed foundation.

## Architecture decisions

### Route layer

- Keep `src/routes/**` as TanStack Start file-based route entry layer.
- Route files stay thin adapters only. They import feature/shared modules and avoid owning product logic.
- Use pathless protected layout route (`_protected`) plus shared auth helpers for redirects/guards.

### Feature ownership

- `src/features/auth/**` owns:
  - login page UI
  - provider button UI
  - Better Auth client/server modules
  - auth env/provider availability helpers
  - route/session guard helpers
- `src/features/app-shell/**` owns:
  - protected shell chrome
  - protected home/empty state view
  - profile/sign-out surface
- `src/shared/theme/**` owns theme runtime, provider, toggle, and persistence helpers.
- `src/db/**` remains shared infrastructure. Auth schema lives under `src/db/schema/auth.ts` with shared export surface from `src/db/schema/index.ts`.
- Avoid catch-all ownership in root `src/components` and `src/lib` for feature code.
- Avoid barrel files, especially `export *`. Prefer direct imports.

### Testing ownership

- `test/features/auth/**` mirrors auth feature.
- `test/features/app-shell/**` mirrors protected shell feature.
- Shared route/setup/theme helpers stay in shared test areas only when truly cross-feature.
- E2E auth flows live under `e2e/tests/auth/**`.

## Implementation sequence

1. Baseline repo against FAV-1 acceptance and preserve FAV-17 groundwork.
2. Add/confirm required deps and env contract:
   - Better Auth
   - `@base-ui/react`
   - Drizzle ORM + Drizzle Kit
   - SQLite-compatible driver
   - required auth/OAuth env vars
3. Create auth DB baseline and shared DB entrypoints.
4. Add Better Auth server/client modules and TanStack auth API endpoint.
5. Introduce feature-sliced structure while keeping behavior stable:
   - auth code into `src/features/auth/**`
   - shell code into `src/features/app-shell/**`
   - theme runtime into `src/shared/theme/**`
   - auth schema into `src/db/schema/auth.ts`
6. Replace starter route tree with public `/login` + pathless `_protected` layout.
7. Build theme runtime and bootstrap persisted light/dark mode without flash.
8. Implement token-driven login shell, provider buttons, protected shell chrome, theme toggle, and profile/sign-out UI.
9. Wire Google OAuth as only active provider. Keep Facebook/GitHub/Apple as placeholders only.
10. Update unit/browser/E2E coverage for protected redirects, login shell, theme persistence, and sign-out.
11. Add env-gated Google OAuth E2E path outside default smoke lane.
12. Tune existing CI workflow to keep required gates green without forcing real OAuth secrets in default runs.
13. Run final layered verification.

## Guardrails

- Preserve route paths and Better Auth callback/API paths during refactor.
- Preserve current public component/function names where possible during moves.
- No behavior rewrites hidden inside structure cleanup.
- CSS Modules must consume existing design tokens; no new hardcoded shell colors/spacing/typography.
- Keep theme persistence client-side only for this epic.
- If `/signup` needed for completeness, make it alias/redirect to `/login` rather than separate product flow.

## Validation checklist

### Functional

- Logged-out `/` redirects to `/login` before protected UI renders.
- Authenticated `/login` redirects to `/`.
- Better Auth endpoint works.
- Auth tables exist and repeated Google login does not duplicate user.
- Session persists across reload.
- Sign-out clears session and blocks protected route access.
- Login shell and empty protected shell use existing token pipeline.
- Runtime theme toggles `data-theme` and persists across reload.
- Placeholder providers render as inactive/non-functional.

### Structural

- `src/routes/**` remains thin and path-stable.
- Feature-owned auth/shell code lives under `src/features/**`.
- Theme runtime lives under shared theme namespace.
- Shared DB infra remains under `src/db/**`.
- No new barrel-export indirection.
- Tests mirror feature ownership where applicable.

### Repo/CI

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- required smoke E2E path
- optional Google OAuth E2E only when env contract exists
- CI keeps required gates (`lint`, `typecheck`, `test`, `build`) on push + pull_request.

## Out of scope

- Bookmark dashboard/product features beyond empty protected shell.
- Additional working OAuth providers besides Google.
- Server-stored theme preference.
- Route-directory migration away from `src/routes/**`.
- Unrelated architecture cleanup outside auth, shell, theme, DB schema split, and test ownership needed for FAV-1.
