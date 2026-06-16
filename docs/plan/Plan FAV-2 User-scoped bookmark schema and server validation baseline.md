## Task Analysis

- Main objective: Deliver FAV-2 baseline by adding reusable bookmark and label schema, validation, and authenticated user-scoped server primitives without building UI or full CRUD flows yet.
- Identified dependencies:
  - Existing FAV-1 auth foundation already in repo: Better Auth user/session tables, `getServerAuthSession`, Drizzle client bootstrap, and temp-DB integration patterns.
  - PRD rules in `docs/prd/favoritable-prd.md`: bookmark fields (`url`, `slug`, `title`, optional metadata, `state`, `favorite`), label fields (`name`, optional `color`), bookmark-label join, duplicate bookmark URLs allowed, label names unique per user, authenticated TanStack Start server functions, and user-scoped data access.
  - Existing repo patterns to reuse: `src/db/client.ts`, `src/db/schema/auth.ts`, `src/features/auth/server/auth.server.ts`, `scripts/bootstrap-auth-db.mjs`, and Vitest temp-DB coverage in `test/features/auth/server/auth-bootstrap.test.ts`.
- System impact:
  - DB layer expands beyond Better Auth. To avoid future `pnpm auth:schema` regeneration overwriting app tables, app-owned bookmark tables should live outside `src/db/schema/auth.ts` and be aggregated at Drizzle runtime/tooling boundaries.
  - No route or UI files are required for this epic. Impact stays concentrated in `src/db/**`, new `src/features/bookmarks/**`, and auth server-function primitives.
  - Key risks: schema drift between Better Auth-managed and app-managed tables, cross-user attachment gaps if join helpers rely only on foreign keys, and structured validation errors losing shape if tied too tightly to framework-specific exception behavior.

## Chosen Approach

- Proposed solution:
  - Keep `src/db/schema/auth.ts` Better Auth-focused. Add `src/db/schema/bookmarks.ts` for `bookmark`, `label`, and `bookmarkLabel`, then add a small `src/db/schema/schema.ts` aggregator consumed by Drizzle config/runtime.
  - Add client-safe validation helpers under `src/features/bookmarks/lib/` using native TypeScript parsing and shared constants, not a new validation dependency.
  - Add opt-in authenticated TanStack Start server-function middleware under `src/features/auth/server/` plus bookmark-domain user-scope helpers under `src/features/bookmarks/server/`; later slices compose these into actual CRUD server functions.
- Justification for simplicity:
  - Avoids a full auth schema refactor and avoids stuffing app tables into `auth.ts`, which would create regeneration risk and muddle ownership.
  - Avoids adding `zod` or another schema library when repo already favors native guards, parser helpers, and focused tests.
  - Avoids premature CRUD/server route surface. This epic should ship reusable primitives only: schema, validation, auth middleware, and scoped DB helpers.
  - Rejects global `src/start.ts` auth middleware for now. Per-server-function auth stays more explicit and leaves room for future public server functions without exemption logic.
- Components to be modified/created:
  - Schema and migration:
    - `src/db/schema/bookmarks.ts` — new bookmark/label/join tables, indices, relations, and cascade rules.
    - `src/db/schema/schema.ts` — new explicit full-schema aggregator for Drizzle runtime/tooling.
    - `src/db/schema/auth.ts` — minimal touch only if relation exports or imports need alignment; Better Auth tables remain authoritative.
    - `src/db/client.ts` — switch from auth-only schema import to full schema aggregator.
    - `src/features/auth/server/auth.server.ts` — switch Drizzle adapter schema import to full schema aggregator.
    - `drizzle.config.ts` — point Drizzle Kit at the full schema entry.
    - `drizzle/0002_*.sql` + `drizzle/meta/*` — new migration and metadata.
  - Validation:
    - `src/features/bookmarks/lib/bookmark-validation.ts` — create/update bookmark validators, limits, and structured error types/results.
    - `src/features/bookmarks/lib/label-validation.ts` — create/update label validators, trimmed-name normalization, and shared label error shaping.
  - Auth + scope helpers:
    - `src/features/auth/server/authenticated-middleware.ts` — TanStack Start function middleware or equivalent authenticated wrapper based on `getServerAuthSession`.
    - `src/features/bookmarks/server/user-scope.server.ts` — user-scoped bookmark/label lookup, ownership assertions, and bookmark-label attach precheck.
  - Tests:
    - `test/db/bookmark-schema.test.ts` — temp-DB migration bootstrap, cascade, uniqueness, and duplicate-URL allowance checks.
    - `test/features/bookmarks/lib/bookmark-validation.test.ts`
    - `test/features/bookmarks/lib/label-validation.test.ts`
    - `test/features/auth/server/authenticated-middleware.test.ts`
    - `test/features/bookmarks/server/user-scope.server.test.ts`

## Implementation Steps

1. Baseline FAV-2 boundaries before touching code: confirm no existing bookmark/label runtime modules already own this domain, keep the FAV-1 auth tables intact, and lock the ownership split as `src/db/**` for shared DB infra, `src/features/auth/server/**` for session/auth middleware, and new `src/features/bookmarks/**` for bookmark-domain primitives. Pre-implementation checkpoint: do not introduce catch-all `src/lib` or `src/shared` bookmark modules.
2. FAV-29 schema foundation: create `src/db/schema/bookmarks.ts` with `bookmark`, `label`, and `bookmarkLabel` tables tied to existing `user.id`. Include required PRD fields, `state` default `active`, `favorite` default `false`, timestamp defaults matching current auth tables, `userId` foreign keys with `onDelete: 'cascade'`, and join-table cascade on both `bookmarkId` and `labelId`. Guardrail: do not add URL uniqueness because the PRD explicitly allows same-user duplicates.
3. FAV-29/FAV-28 schema wiring and migration: add `src/db/schema/schema.ts`, switch `src/db/client.ts`, `src/features/auth/server/auth.server.ts`, and `drizzle.config.ts` to the full schema entry, then generate a new Drizzle migration that creates only the bookmark tables, indexes, and constraints. Mitigation: the multi-file schema boundary keeps future `pnpm auth:schema` runs from wiping app tables; if Drizzle generation unexpectedly rewrites auth objects, stop and inspect before accepting the migration.
4. FAV-28 constraint verification: add DB-focused integration tests around the migration/bootstrap flow using a fresh temp SQLite database. Prove `(userId, name)` rejects duplicates for one user, allows the same label name across different users, and confirm cascade behavior for deleting a user, bookmark, or label. Checkpoint: uniqueness failure should be deterministic enough that later label CRUD can translate it predictably.
5. FAV-30 shared validation baseline: add client-safe validators in `src/features/bookmarks/lib/bookmark-validation.ts` and `src/features/bookmarks/lib/label-validation.ts`. Cover create/update bookmark payloads, required URL checks via native `URL` parsing, trimmed string normalization, explicit length-limit constants stored once, optional metadata fields, and non-empty label names. Return structured validation results (`fieldErrors`, optional form error, parsed data) so later server functions can reuse them without duplicating parsing logic.
6. FAV-30 validation coverage: add focused Vitest unit tests for valid bookmark/label payloads, invalid URLs, empty or whitespace-only label names, over-limit strings, and normalization edge cases such as trimmed names that would otherwise bypass the DB uniqueness rule. Risk note: if exact field limits are not already documented elsewhere, define them once in the validation modules and treat them as the reusable contract for later UI and server slices.
7. FAV-32 authenticated server-function pattern: introduce `src/features/auth/server/authenticated-middleware.ts` as one small TanStack Start auth middleware or wrapper that resolves the current session with `getServerAuthSession`, rejects anonymous requests, and injects trusted `userId` and session context into downstream server-function handlers. Simplicity rule: do not add global auth enforcement in `src/start.ts` for this slice.
8. FAV-32/FAV-31 user-scoped access helpers: add `src/features/bookmarks/server/user-scope.server.ts` with helpers such as `getBookmarkByIdForUser`, `getLabelByIdForUser`, and a relation precheck that refuses bookmark-label associations unless both records belong to the authenticated user. Mitigation: foreign keys alone do not prevent cross-user attachment when IDs are guessed; helper queries must scope by `userId` every time.
9. FAV-31 reusable helper surface cleanup: keep validation and DB helpers in concrete direct-import files only, avoid `export *` barrels, and add small test-driven examples that prove the intended downstream composition: `createServerFn` -> authenticated middleware -> validation helper -> user-scoped DB helper -> mutation logic. Optional safety valve: if a tiny example server function is needed to prove typing, keep it in tests rather than shipping unused runtime API surface.
10. Final verification and handoff: run targeted new tests first, run the existing DB bootstrap flow against a fresh database, then run `pnpm complete-check`. Final handoff should explicitly name the reusable seams for the next slices: full schema entrypoint, validation modules, auth middleware, and user-scope helpers. Rollback note: if the full repo check exposes unrelated flake, preserve green targeted suites plus migration verification before isolating the unrelated failure.

## Validation

- Success criteria:
  - Database schema contains PRD-backed bookmark, label, and bookmark-label tables tied to the existing user table, with cascade behavior and no unintended bookmark URL uniqueness.
  - Composite uniqueness on `(userId, name)` exists and behaves as required: duplicate label names fail within one user and pass across users.
  - Shared bookmark and label validation helpers exist, stay client-safe, enforce required fields and length limits, and return structured errors suitable for later server-function and UI reuse.
  - Shared authenticated server-function pattern exists, resolves the current user from Better Auth session, and bookmark-domain scope helpers reject cross-user reads and associations.
  - Reusable modules live in stable architecture locations and downstream slices can import them without copying logic.
- Checkpoints:
  - Pre-implementation assumptions check: confirm schema stays split between Better Auth-owned and app-owned tables; confirm no global server-function auth middleware is introduced; confirm validation remains dependency-light unless repo standards change.
  - During Steps 2-4: fresh DB bootstrap succeeds, migration SQL creates only new tables/indexes/constraints, same-user label duplicate fails, cross-user same name passes, and cascade deletes remove dependent bookmark-label rows.
  - During Steps 5-6: validator tests prove URL parsing, string trimming, explicit limit enforcement, and structured error output for both bookmark and label mutations.
  - During Steps 7-8: auth wrapper returns trusted user context when session exists, rejects anonymous calls, and scope helpers refuse bookmark/label access when IDs belong to a different user.
  - Post-implementation regression: direct unit/integration suites are green, existing auth bootstrap flow still passes, and `pnpm complete-check` completes successfully.
