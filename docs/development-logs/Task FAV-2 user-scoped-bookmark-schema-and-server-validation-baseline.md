---
title: FAV-2 User-scoped Bookmark Schema and Server Validation Baseline
type: development-log
permalink: docs/development-logs/task-FAV-2-user-scoped-bookmark-schema-and-server-validation-baseline
---

# Development Log: FAV-2

## Metadata

- Task ID: FAV-2
- Date (UTC): 2026-06-16T13:59:54Z
- Project: favoritable
- Branch: feature/FAV-2-user-scoped-bookmark-schema-and-server-validation-baseline
- Commit: uncommitted (working tree, pending commit)

## Objective

Deliver the FAV-2 baseline: reusable bookmark and label DB schema, client-safe validation helpers, and authenticated user-scoped server primitives — without building UI or full CRUD flows. This epic establishes the reusable seams that later bookmark CRUD slices compose.

The epic was decomposed into five child issues executed in dependency order:

- **FAV-29** — Schema foundation: bookmark, label, and bookmark-label tables tied to existing Better Auth `user.id`
- **FAV-28** — Schema wiring + migration + constraint verification (temp-DB integration tests)
- **FAV-30** — Shared client-safe validation baseline for bookmarks and labels
- **FAV-32** — Authenticated TanStack Start server-function middleware
- **FAV-31** — User-scoped bookmark/label DB helpers + reusable composition proof

A canonical plan lives at `docs/plan/Plan FAV-2 User-scoped bookmark schema and server validation baseline.md`.

## Implementation Summary

### Execution Order and Breakdown

The plan defined a strict bottom-up dependency chain: schema first (FAV-29), then wiring/migration + DB-level verification (FAV-28), then validation (FAV-30), then auth middleware (FAV-32), then user-scope helpers that compose auth + validation + DB (FAV-31). Each layer is independently importable and testable. No CRUD/server-route surface was shipped — only reusable primitives.

### FAV-29 — Schema Foundation

- `src/db/schema/bookmarks.ts` — three tables: `bookmark`, `label`, `bookmarkLabel`.
  - `bookmark`: PRD fields (`id`, `userId`, `url`, `slug`, `title`, `description?`, `author?`, `thumbnail?`, `publishedAt?`, `state`, `favorite`, `createdAt`, `updatedAt`). `state` defaults `active`, `favorite` defaults `false`. Timestamps use `unixepoch('subsecond')` matching auth tables. `userId` FK → `user.id` with `onDelete: 'cascade'`. CHECK constraint on `state` (`active`/`archived`). `bookmark_userId_idx` index. **No URL uniqueness** — PRD explicitly allows same-user duplicate URLs.
  - `label`: `id`, `userId`, `name`, `color?`, timestamps. `label_userId_idx` index. **Composite unique index `label_userId_name_unique` on `(userId, name)`** — label names unique per user, allowed across users. `userId` FK → `user.id` cascade.
  - `bookmarkLabel`: join table with `id` (auto-generated `lower(hex(randomblob(16)))`), `bookmarkId`, `labelId`, timestamps. Cascade delete on both `bookmarkId` and `labelId`. Unique index `bookmarkLabel_bookmarkId_labelId_unique` on `(bookmarkId, labelId)` prevents duplicate associations. `bookmarkLabel_labelId_idx` index.
- `src/db/schema/bookmark-state.ts` — extracted state constants: `bookmarkStates = ['active', 'archived']`, `defaultBookmarkState`, `BookmarkState` type, `isBookmarkState` type guard. Kept separate so validation modules import a lightweight constant module (no Drizzle dependency).
- Full Drizzle relations defined (`bookmarkRelations`, `labelRelations`, `bookmarkLabelRelations`).

### FAV-28 — Schema Wiring, Migration, and Constraint Verification

- `src/db/schema/schema.ts` — new explicit full-schema aggregator re-exporting both `auth.ts` and `bookmarks.ts`. This is the single entrypoint consumed by Drizzle runtime and tooling.
- Switched all schema imports from `auth`-only to `schema.ts` aggregator:
  - `src/db/client.ts` — `import * as schema from '@/db/schema/schema'`
  - `src/features/auth/server/auth.server.ts` — Drizzle adapter now uses full schema
  - `drizzle.config.ts` — `schema: './src/db/schema/schema.ts'`
- `drizzle/0002_violet_union_jack.sql` — migration creates only `bookmark`, `label`, `bookmark_label` tables, indexes, and constraints. `drizzle/meta/_journal.json` and `drizzle/meta/0002_snapshot.json` updated.
- **Temp-DB integration tests** (`test/db/bookmark-schema.test.ts`, 7 tests): fresh bootstrapped SQLite DB proves table/column presence, composite label unique index columns, state CHECK enforcement (`SQLITE_CONSTRAINT` rawCode 275), state/favorite defaults, same-user label duplicate rejection (rawCode 2067), cross-user same name allowed, duplicate bookmark URLs allowed, and full cascade behavior (delete user → all dependent rows gone; delete bookmark → join rows gone; delete label → join rows gone; duplicate join rejected).
- Extracted shared test helper `test/lib/bootstrapped-temp-db.ts` — `createBootstrappedTempDatabase` / `disposeBootstrappedTempDatabase`. Runs `scripts/bootstrap-db.mjs` against a fresh temp DB file, enables `PRAGMA foreign_keys = ON`, returns `{ client, databaseUrl, tempDirectory }`. Reused by schema, user-scope, and auth-bootstrap tests.

### FAV-30 — Shared Validation Helpers

- `src/features/bookmarks/lib/validation.ts` — generic validation primitives: `ValidationResult` discriminated union (success/failure with `fieldErrors` + optional `formError`), `ValidationFieldErrors`, `invalidValue` sentinel symbol, normalize helpers (`normalizeRequiredString`, `normalizeOptionalString`, `normalizeRequiredUrl`, `normalizeOptionalUrl`, `normalizeOptionalBoolean`, `normalizeOptionalDate` with calendar-date validation), unwrap helpers, `addFieldError`, `createValidationSuccess`/`createValidationFailure`, `hasFieldErrors`, `isRecord`, `hasOwnProperty`. URL validation uses native `new URL()` restricted to `http:`/`https:`. No external validation dependency (no `zod`).
- `src/features/bookmarks/lib/bookmark-validation.ts` — `bookmarkValidationLimits` constants (url 2048, slug 200, title 512, description 4096, author 256, thumbnail 2048). `validateCreateBookmarkInput` and `validateUpdateBookmarkInput`. Create enforces required URL/slug/title, normalizes optional fields, applies defaults (`state` → `active`, `favorite` → `false`). Update requires at least one known field, allows clearing optionals via whitespace-only values. Returns structured `{ fieldErrors, formError?, data?, success }`.
- `src/features/bookmarks/lib/label-validation.ts` — `labelValidationLimits` (name 64, color 32). `validateCreateLabelInput` / `validateUpdateLabelInput`. Trimmed-name normalization so whitespace-bypassed names can't slip past DB uniqueness. Color optional.
- **Unit tests**: `bookmark-validation.test.ts` (10 tests) — valid create with normalization + defaults, impossible calendar date rejection, invalid URL rejection, blank/invalid state rejection, over-limit rejection, valid update with field clearing, "at least one field required" form error, blank/invalid state on update. `label-validation.test.ts` (10 tests) — valid normalization, whitespace-only name rejection, over-limit name, update requires a field, normalized update names, color-only update, over-limit color, colorless create, non-string color rejection (create + update).

### FAV-32 — Authenticated Middleware

- `src/features/auth/server/authenticated-middleware.ts` — TanStack Start `createMiddleware().server(...)` that resolves session via `getServerAuthSession(request)`. Anonymous calls throw a real 401 `Response.json` (status 401, `Unauthorized`) with structured error body `{ code: 'UNAUTHORIZED', message, statusCode: 401 }`. On success, injects trusted `{ session, userId }` context into `next()`. Also exports `requireAuthenticatedServerSession` (standalone throw-on-anonymous helper) and `createAuthenticatedServerFn` factory that pre-binds the middleware for downstream slices. **No global `src/start.ts` middleware** — per-server-function auth stays explicit, leaves room for future public server functions without exemption logic.
- **Unit tests** (`authenticated-middleware.test.ts`, 5 tests) — mocks `getServerAuthSession`: requires session / rejects anonymous before handler, injects trusted context + passes request through, `createAuthenticatedServerFn` wires middleware, full protected server-function path throws 401 when anonymous.

### FAV-31 — User-scoped DB Helpers

- `src/features/bookmarks/server/user-scope.server.ts` — scoped lookup helpers: `getBookmarkByIdForUser` (returns record or null), `requireBookmarkByIdForUser` (throws `UserScopeAccessError` if not found), `getLabelByIdForUser`, `assertBookmarkLabelOwnership` (single join query: left-joins label scoped by `userId` onto bookmark scoped by `userId`; throws if either record is missing or belongs to a different user). All queries scope by `userId` every time — foreign keys alone don't prevent cross-user attachment when IDs are guessed.
- `UserScopeAccessError` custom error class for predictable downstream handling.
- **Integration tests** (`user-scope.server.test.ts`, 6 tests) against bootstrapped temp DB: bookmarks/labels returned only for owner, cross-user reads rejected with scoped error, ownership assertion allows same-user attach, rejects cross-user label attach, and a **full composition proof**: `createAuthenticatedServerFn({ method })` → `.validator(parseUpdateBookmarkPayload)` → `.handler(runUpdateBookmarkMutation)` — demonstrates auth middleware + validation + scoped DB helper composing without duplication, and proves cross-user mutation rejection.

### Review/QA Fix Loops

The implementation went through multiple review and QA iterations before reaching green state:

- **Schema boundary hardening**: Initial instinct to add app tables to `auth.ts` was rejected — would create `pnpm auth:schema` regeneration overwrite risk and muddle ownership. Resolved by keeping `auth.ts` Better Auth-focused and adding the `schema.ts` aggregator.
- **Migration cleanliness**: Drizzle generation verified to produce only new bookmark tables/indexes/constraints without rewriting auth objects. Migration journal entry (idx 2) clean.
- **Label uniqueness edge cases**: Whitespace-only label names and trailing/leading spaces addressed by trimming before uniqueness checks. DB composite unique index verified at constraint level with stable SQLite error codes (rawCode 2067).
- **Validation shape stability**: Structured result objects (`{ fieldErrors, formError?, data?, success }`) chosen over exception-based validation so server functions and UI can reuse parsing without duplicating logic.
- **Auth middleware testability**: Middleware's internal `server` function accessed via `authenticatedMiddleware.options.server` in tests to verify anonymous short-circuit and trusted context injection without booting a full TanStack server.
- **Temp-DB helper extraction**: Originally the auth-bootstrap test inlined temp-DB setup; refactored into reusable `test/lib/bootstrapped-temp-db.ts` to serve all temp-DB tests consistently (foreign_keys pragma enabled, clean dispose).

### Migration Squash/Cleanup

- Migration history stays linear and clean: `0000_great_tigra` (initial auth tables), `0001_strange_medusa` (locale column), `0002_violet_union_jack` (bookmark/label/join tables). No squashing needed — the new migration is additive only and creates no auth-side changes. Drizzle snapshot metadata verified consistent.

### Bootstrap Alias / Canonical Command Cleanup

- `scripts/bootstrap-db.mjs` — new canonical bootstrap script (migrates the full Drizzle schema, not auth-only).
- `scripts/bootstrap-auth-db.mjs` — reduced to a deprecated compatibility alias (`await import('./bootstrap-db.mjs')`) with deprecation comment.
- `package.json` script renames: `pnpm db:bootstrap` is the canonical command (`node ./scripts/bootstrap-db.mjs`); `pnpm db:bootstrap:auth` aliased to `pnpm db:bootstrap` for backward compat. `predev`, `pretest`, and `preview:e2e` all switched to `pnpm db:bootstrap`.
- `.github/workflows/migrate-production-db.yml` — production migration step switched from `pnpm db:bootstrap:auth` to `pnpm db:bootstrap`.
- `README.md` — bootstrap docs updated to canonical `pnpm db:bootstrap`.
- Existing auth-bootstrap test refactored to use `createBootstrappedTempDatabase` (no more inlined temp-dir/execFile logic).

## Files Changed

### New — Schema & Migration

- `src/db/schema/bookmarks.ts` — bookmark, label, bookmarkLabel tables, indexes, relations, cascade rules
- `src/db/schema/bookmark-state.ts` — state constants, type guard (no Drizzle dependency)
- `src/db/schema/schema.ts` — full-schema aggregator (auth + bookmarks)
- `drizzle/0002_violet_union_jack.sql` — bookmark/label/join migration
- `drizzle/meta/0002_snapshot.json` — migration snapshot metadata
- `drizzle/meta/_journal.json` — journal entry idx 2 (modified)

### New — Validation Helpers

- `src/features/bookmarks/lib/validation.ts` — generic validation primitives (no zod)
- `src/features/bookmarks/lib/bookmark-validation.ts` — create/update bookmark validators + limits
- `src/features/bookmarks/lib/label-validation.ts` — create/update label validators + limits

### New — Server Primitives

- `src/features/auth/server/authenticated-middleware.ts` — auth middleware + `createAuthenticatedServerFn` factory
- `src/features/bookmarks/server/user-scope.server.ts` — scoped DB helpers + `UserScopeAccessError`

### New — Tests

- `test/db/bookmark-schema.test.ts` — migration/cascade/uniqueness/duplicate-URL integration tests (7 tests)
- `test/db/database-url.test.ts` — database URL resolution tests (5 tests)
- `test/features/bookmarks/lib/bookmark-validation.test.ts` — bookmark validation unit tests (10 tests)
- `test/features/bookmarks/lib/label-validation.test.ts` — label validation unit tests (10 tests)
- `test/features/auth/server/authenticated-middleware.test.ts` — auth middleware unit tests (5 tests)
- `test/features/bookmarks/server/user-scope.server.test.ts` — user-scope integration + composition tests (6 tests)
- `test/lib/bootstrapped-temp-db.ts` — reusable temp-DB bootstrap helper

### New — Bootstrap Script

- `scripts/bootstrap-db.mjs` — canonical full-schema DB bootstrap script

### Modified

- `drizzle.config.ts` — schema entry switched to `schema.ts`
- `src/db/client.ts` — schema import switched to `schema.ts`
- `src/features/auth/server/auth.server.ts` — Drizzle adapter schema import switched to `schema.ts`
- `scripts/bootstrap-auth-db.mjs` — reduced to deprecated alias of `bootstrap-db.mjs`
- `test/features/auth/server/auth-bootstrap.test.ts` — refactored to use shared temp-DB helper
- `package.json` — `db:bootstrap` canonical command, `db:bootstrap:auth` alias, `predev`/`pretest`/`preview:e2e` switched
- `.github/workflows/migrate-production-db.yml` — prod migration switched to `pnpm db:bootstrap`
- `README.md` — bootstrap docs updated

### New — Plan

- `docs/plan/Plan FAV-2 User-scoped bookmark schema and server validation baseline.md` — canonical epic plan

## Key Decisions

1. **Schema split: `auth.ts` Better Auth-owned, `bookmarks.ts` app-owned, `schema.ts` aggregator**: Keeps future `pnpm auth:schema` regeneration from wiping app tables. Aggregator is the single Drizzle runtime/tooling entrypoint.

2. **No URL uniqueness on bookmark table**: PRD explicitly allows same-user duplicate bookmark URLs. Only `(bookmarkId, labelId)` join uniqueness and `(userId, name)` label uniqueness enforced.

3. **Composite unique index `label_userId_name_unique` on `(userId, name)`**: Label names unique per user, allowed across users. Verified at DB constraint level with stable SQLite error codes.

4. **No validation library (no zod)**: Repo favors native guards, parser helpers, and focused tests. Validation stays client-safe and dependency-light.

5. **Structured validation results over exceptions**: `{ fieldErrors, formError?, data?, success }` discriminated union lets server functions and UI reuse parsing without duplicating logic or losing error shape to framework exception behavior.

6. **Per-server-function auth middleware, no global `src/start.ts` enforcement**: `createAuthenticatedServerFn` factory pre-binds `authenticatedMiddleware`. Explicit per-function auth leaves room for future public server functions without exemption logic.

7. **User-scope helpers query by `userId` every time**: Foreign keys alone don't prevent cross-user attachment when IDs are guessed. `assertBookmarkLabelOwnership` uses a single scoped join query.

8. **401 `Response` throw for anonymous calls**: Middleware throws a real HTTP `Response` (status 401) rather than a custom error, so TanStack Start's server-function pipeline handles it natively.

9. **`bookmark-state.ts` extracted from `bookmarks.ts`**: Validation modules import a lightweight constant module (no Drizzle dependency), keeping validation client-safe and tree-shakeable.

10. **Reusable temp-DB helper**: `test/lib/bootstrapped-temp-db.ts` centralizes fresh-DB bootstrap for all integration tests with `foreign_keys = ON` and clean disposal.

11. **Bootstrap script canonicalization**: `pnpm db:bootstrap` (`bootstrap-db.mjs`) is canonical; `bootstrap-auth-db.mjs` deprecated to alias. All scripts, CI, and docs aligned.

## Validation Performed

- **Targeted unit + integration suites** (run in this session): 6 test files, **43 tests passing**:
  - `test/db/database-url.test.ts` — 5 tests
  - `test/db/bookmark-schema.test.ts` — 7 tests (migration, cascades, uniqueness, defaults)
  - `test/features/bookmarks/lib/bookmark-validation.test.ts` — 10 tests
  - `test/features/bookmarks/lib/label-validation.test.ts` — 10 tests
  - `test/features/auth/server/authenticated-middleware.test.ts` — 5 tests
  - `test/features/bookmarks/server/user-scope.server.test.ts` — 6 tests
- **Regression check**: existing `test/features/auth/server/auth-bootstrap.test.ts` — 1 test passing (refactored to shared temp-DB helper, still green).
- **Fresh DB bootstrap**: temp-DB tests prove migration applies cleanly to a fresh SQLite database with all tables, indexes, and constraints present.
- **Cascade verification**: user delete → bookmark/label/join rows gone; bookmark delete → join rows gone; label delete → join rows gone.
- **Composition proof**: `user-scope.server.test.ts` demonstrates full `createAuthenticatedServerFn` → validator → handler → scoped DB mutation chain working and cross-user rejection working.
- **State**: all targeted suites green. Full `pnpm complete-check` pending commit (changes uncommitted in working tree).

## Risks and Follow-ups

- **Commit pending**: All FAV-2 changes are uncommitted in the working tree. Commit + PR + AI review + full `pnpm complete-check` (knip, typecheck, lint, format, test, build, E2E) still required before merge.
- **No CRUD/server-route surface shipped**: This epic delivers primitives only. Next slices must compose `createAuthenticatedServerFn` + validation + user-scope helpers into actual bookmark/label CRUD server functions and routes.
- **Bookmark id generation**: `bookmark` and `label` tables use text PK without a DB default (unlike `bookmarkLabel` which auto-generates). CRUD slices must supply UUIDs/slug-based ids on insert.
- **No index on bookmark slug**: PRD includes `slug` but no uniqueness or index yet. If slug-based lookups are needed, add an index in a future migration.
- **Validation limits are the reusable contract**: `bookmarkValidationLimits` / `labelValidationLimits` are defined once; UI and future server slices must reuse them rather than hardcoding.
- **`scripts/bootstrap-auth-db.mjs` deprecated alias**: Should be removed in a future cleanup once all references confirmed migrated.
- **`assertBookmarkLabelOwnership` returns records but does not insert**: The actual bookmark-label attach mutation is deferred to CRUD slices.
