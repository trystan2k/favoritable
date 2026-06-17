---
title: FAV-3 Quick Add Bookmark by URL With Manual Fields
type: development-log
permalink: docs/development-logs/task-FAV-3-quick-add-bookmark-by-url-with-manual-fields
---

# Development Log: FAV-3

## Metadata

- Task ID: FAV-3
- Date (UTC): 2026-06-17T10:02:46Z
- Project: favoritable
- Branch: feature/FAV-3-quick-add-bookmark-by-url-with-manual-fields
- Commit: uncommitted (working tree, pending commit)

## Objective

Deliver FAV-3 as the first end-to-end bookmark creation slice: an authenticated user opens a protected quick-add flow at `/bookmarks/new`, submits a required URL with optional title/description edits, saves through a validated POST server function, then lands on a minimal library page at `/` that shows the saved bookmark newest-first. This is the first live bookmark runtime path stitching DB constraint → feature validation → authenticated mutation → protected route data loading → protected UI.

A canonical plan lives at `docs/plan/Plan FAV-3 Quick add bookmark by URL with manual fields.md`.

### Approved Product Rules / Scope Boundaries

- Manual URL add only. No scraping, no labels, no favorites/archive controls, no detail route, no FAV-4 responsive-card polish.
- Reverse the FAV-2 baseline rule: duplicate bookmark URLs move from "allowed" to "blocked per user". Same URL may still exist for a different user.
- Repurpose the existing protected index route `/` as the minimal library page; add one new protected route `/bookmarks/new` for quick add.
- `docs/design/favoritable.pen` exposes no dedicated bookmark add/library frame, so styling reuses existing shell/token patterns (CSS Modules + design tokens), not a new design surface.
- FAV-3 changes one FAV-2 baseline rule (duplicate URLs) and one FAV-2 data-shape decision (server now derives slug + fallback title instead of requiring them client-side).

## Implementation Summary

### Execution Order and Breakdown

Bottom-up dependency chain from the plan: data-layer uniqueness first, then validation/derived-field contracts, then user-scoped helpers, then the authenticated mutation, then feature-side route data loading, then the two page views, then full test coverage, then widening-ring verification. The create server function was intentionally split into three files so the pure mutation logic is testable without a TanStack request context.

### Schema + Migration — Duplicate-URL Uniqueness

- `src/db/schema/bookmarks.ts` — added `uniqueIndex('bookmark_userId_url_unique').on(table.userId, table.url)`. Same-user duplicate URLs now rejected at the DB layer; cross-user same URL allowed.
- `drizzle/0003_giant_expediter.sql` + `drizzle/meta/0003_snapshot.json` + `drizzle/meta/_journal.json` — migration is not a naive `CREATE UNIQUE INDEX`. It runs a **preflight safety guard**: builds a temp `__bookmark_url_uniqueness_preflight` table with `PRIMARY KEY (user_id, url)`, copies existing rows, and drops it so any legacy same-user duplicate URLs surface as a constraint failure before the unique index is created. This prevents a migration failure masking data corruption.
- `test/db/bookmark-schema.test.ts` — rewrote FAV-2 "same-user duplicate URLs allowed" assertions into "same-user duplicate URLs rejected". Added fail-loud coverage for legacy duplicate states (plain dupes and overlapping-label dupes) and bootstrap-upgrade canonicalization paths. **11 tests**.

### URL Canonicalization (duplicate-detection robustness)

- `src/features/bookmarks/lib/bookmark-url.ts` — new module: `canonicalizeBookmarkUrl` (returns `new URL(value).href`) and `isValidHttpUrl` (http/https protocol check, extracted from validation.ts).
- `src/features/bookmarks/lib/validation.ts` — `normalizeRequiredUrl` / `normalizeOptionalUrl` now return the canonicalized URL so trailing-slash / case variants cannot bypass duplicate detection. `isValidHttpUrl` deleted from validation.ts (moved to bookmark-url.ts).
- `test/features/bookmarks/lib/bookmark-url.test.ts` — **2 tests**.

### Quick-Add Validation + Derived Fields

- `src/features/bookmarks/lib/bookmark-validation.ts` — added `validateQuickAddBookmarkInput`, `QuickAddBookmarkInput`, `QuickAddBookmarkField`, `QuickAddBookmarkValidationResult`. Accepts required `url` + optional `title`/`description`; trims values; reuses existing max-length limits; reuses the same structured `{ fieldErrors, formError?, data?, success }` shape. Preserves the broader `validateCreateBookmarkInput` / `validateUpdateBookmarkInput` untouched.
- `src/features/bookmarks/lib/bookmark-derived-fields.ts` — `deriveBookmarkTitleFromUrl` (deterministic `hostname + pathname` fallback, trailing slash trimmed, clamped to title limit) and `deriveBookmarkSlug` (NFKD slugify with title-or-URL fallback, never returns empty — falls back to `'bookmark'`).
- `test/features/bookmarks/lib/bookmark-derived-fields.test.ts` — **3 tests**.
- `test/features/bookmarks/lib/bookmark-validation.test.ts` — **49 tests** (includes quick-add coverage).
- `test/features/bookmarks/lib/validation.test.ts` — **47 tests** (includes canonicalization cases).

### User-Scoped Server Helpers

- `src/features/bookmarks/server/user-scope.server.ts` — added `getBookmarkByUrlForUser` (duplicate detection, canonicalizes lookup URL first), `listBookmarksForUser` (newest-first by `createdAt` then `updatedAt`), and `listLibraryBookmarksForUser` (selects only the minimal library projection). Switched all helpers from static imports of `getDb`/`bookmark`/`label` to **dynamic imports** to break the circular dependency between the validation layer (which imports from bookmarks schema) and the server layer. Kept the optional `database` injection parameter for temp-DB tests.
- `test/features/bookmarks/server/user-scope.server.test.ts` — **9 tests**: by-url owner scope, canonical root URL matching, newest-first ordering, cross-user read rejection, ownership checks, full `createAuthenticatedServerFn` composition proof.

### Create-Bookmark Server Function (first real bookmark mutation)

- Split into three files for request/transport isolation:
  - `src/features/bookmarks/server/create-bookmark.ts` — `createServerFn({ method: 'POST' }).validator(...).handler(...)` shell; dynamically imports the request handler so the TanStack transport layer stays thin.
  - `src/features/bookmarks/server/create-bookmark.server.ts` — request/session bridge: resolves `getRequest()`, runs `requireAuthenticatedServerSession`, delegates to impl with trusted `userId`.
  - `src/features/bookmarks/server/create-bookmark-impl.ts` — pure, request-independent mutation: validates quick-add payload → optimistic duplicate lookup via `getBookmarkByUrlForUser` → derives final title (client title or URL fallback) + slug → inserts with `crypto.randomUUID()` id → returns discriminated `CreateBookmarkResult` (`success` + bookmarkId, or structured `fieldErrors`/`formError`).
- **Dual duplicate enforcement**: optimistic same-user lookup before insert PLUS catch of the DB unique-index violation (`SQLITE_CONSTRAINT` / rawCode 2067, message contains `bookmark.user_id` + `bookmark.url`) mapped back to the same inline URL error. A race condition or double-submit cannot produce false success.
- `src/features/bookmarks/lib/bookmark-messages.ts` — single source of truth for i18n message keys + `isBookmarkMessageKey` guard so the UI can localize returned keys without the server knowing translations.
- `test/features/bookmarks/server/create-bookmark.server.test.ts` — **11 tests**: success with derived title/slug, long-URL title clamping, inline duplicate error, duplicate after canonicalization, cross-user same URL allowed, missing-url validation, non-record input, unique-constraint catch during insert, persistence, non-duplicate DB error re-throw, structured duplicate result.

### Auth Lib Extraction (shared, transport-safe)

- `src/features/auth/lib/auth-session.ts` — `AuthenticatedServerSession` / `MaybeAuthenticatedServerSession` types extracted so server helpers and middleware share one typed session shape without importing the full auth factory.
- `src/features/auth/lib/unauthorized-error.ts` — `unauthorizedErrorCode` / `unauthorizedErrorMessage` / `unauthorizedErrorStatusCode` constants + `unauthorizedServerFunctionError` object.
- `src/features/auth/lib/is-unauthorized-error.ts` — defensive detector that recognizes auth failures across the many wrapped shapes they take (raw `Response` status, `.status`, `.statusCode`, `.code`, `.message`, nested `.data`, `.cause`). Used by route loaders and the quick-add view to redirect to `/login` on expired sessions.
- `src/features/auth/server/auth.server.ts` + `authenticated-middleware.ts` — refactored to import the extracted session types and unauthorized-error constants (middleware now dynamic-imports `getServerAuthSession` to avoid eager auth-env coupling).
- `test/features/auth/lib/is-unauthorized-error.test.ts` — **3 tests**.
- `test/features/auth/server/authenticated-middleware.test.ts` — **5 tests** (regression-safe after refactor).

### Routes + Feature-Side Route Data Loading

- `src/routes/_protected/index.tsx` — switched from placeholder `ProtectedHomePage` to `BookmarkLibraryPage`, with a thin `loader: () => loadLibraryBookmarks()`.
- `src/routes/_protected/bookmarks/new.tsx` — new protected route adapter mounting `QuickAddBookmarkPage` (route file kept 7 lines).
- `src/features/bookmarks/routes/route-library.ts` — `createServerFn({ method: 'GET' })` library loader; `loadLibraryBookmarks` catches unauthorized via `isUnauthorizedError` and `redirect({ to: '/login' })`.
- `src/features/bookmarks/routes/route-library.server.ts` — request/session-aware server-only loader returning the minimal per-user library projection.
- `test/routes/bookmarks/quick-add-route.test.ts` — route wiring smoke.

### Page Views

- `src/features/bookmarks/views/BookmarkLibraryPage.tsx` + `.module.css` — heading, eyebrow/body, "Add bookmark" CTA to `/bookmarks/new`, empty-state block, and newest-first `<ol>` of bookmark rows (title, URL link opening in new tab with visually-hidden "opens in a new tab" label, optional description). No reusable bookmark card extracted (deferred to FAV-4).
- `src/features/bookmarks/views/QuickAddBookmarkPage.tsx` + `.module.css` — accessible quick-add form: URL (required), title (optional + hint), description (optional textarea); `aria-invalid`/`aria-describedby`/`role="alert"` inline errors; `aria-busy` save state; `fieldset disabled` + cancel-link guard while saving; **duplicate-submit guard** via `saveRequestRef` + `activeRequestIdRef` (stale-response protection); success path `router.invalidate()` then `navigate({ to: '/' })` to refresh library data after client navigation; unauthorized path redirects to `/login`. Injected `submitBookmark`/`onSuccess` props make the form browser-testable without the real server fn.
- `test/features/bookmarks/views/BookmarkLibraryPage.browser.test.tsx` — **2 tests**.
- `test/features/bookmarks/views/QuickAddBookmarkPage.browser.test.tsx` — **8 tests**: inline field errors, error clearing on edit, success handler, route invalidation + navigation, duplicate-submit guard, disable-while-saving, default server-fn path, form error on throw.

### i18n + Shell Copy

- `src/shared/i18n/resources/en.ts`, `es.ts`, `pt-BR.ts` — added `bookmarks.library.*` and `bookmarks.quickAdd.*` copy (headings, eyebrows, body, field labels/placeholders/hints, save/cancel/saving actions, empty state, inline validation messages, duplicate + generic save errors). Removed the now-false placeholder protected-home messaging and reworded the protected shell sidebar/caption to reflect the live library.
- Deleted `src/features/app-shell/views/ProtectedHomePage.tsx` + `.module.css` and its browser test; updated `test/features/app-shell/views/ProtectedAppShell.browser.test.tsx` caption assertion.

### Bootstrap / Migration Hardening + DB Client Decoupling

- `scripts/lib/bookmark-url-canonicalization.ts` — canonicalization engine: `canonicalizeBookmarkUrls` (dry-run + apply modes), `shouldCanonicalizeBookmarkUrlsBeforeMigrate` (only runs when a `bookmark` table exists), `formatCanonicalDuplicateGroup`, `BookmarkUrlCanonicalizationError` (fail-loud on canonical-equivalent duplicates that would collide post-canonicalization).
- `scripts/bootstrap-db.mjs` — now canonicalizes stored bookmark URLs **before** running migrations so the new unique index cannot fail on legacy same-user duplicates that only differ by trailing slash / case.
- `scripts/canonicalize-bookmark-urls.ts` — standalone `pnpm db:canonicalize-bookmark-urls` operator script (dry-run default, `--apply` to write).
- `package.json` — `db:migrate` now runs `bootstrap-db.mjs` (canonicalize + migrate) instead of bare `drizzle-kit migrate`; added `db:canonicalize-bookmark-urls`.
- `src/db/client.ts` — `getDb`/`createDb` now resolve `DATABASE_URL` / `DATABASE_AUTH_TOKEN` directly with a `file:./data/favoritable.db` default, decoupling DB access from the Better Auth environment so bootstrap/canonicalization scripts and server helpers resolve a client without auth-env coupling.

## Files Changed

### New — Schema & Migration

- `drizzle/0003_giant_expediter.sql` — preflight guard + unique index `(userId, url)`
- `drizzle/meta/0003_snapshot.json` — migration snapshot
- `drizzle/meta/_journal.json` — journal entry idx 3 (modified)

### New — Bookmark Feature Lib

- `src/features/bookmarks/lib/bookmark-url.ts` — canonicalize + valid-URL helpers
- `src/features/bookmarks/lib/bookmark-derived-fields.ts` — fallback title + slug derivation
- `src/features/bookmarks/lib/bookmark-messages.ts` — i18n message keys + key guard
- `src/features/bookmarks/lib/bookmark-library.ts` — `LibraryBookmarkListItem` type

### New — Bookmark Feature Server / Routes

- `src/features/bookmarks/server/create-bookmark.ts` — TanStack POST server fn shell
- `src/features/bookmarks/server/create-bookmark.server.ts` — request/session bridge
- `src/features/bookmarks/server/create-bookmark-impl.ts` — pure mutation + dual duplicate enforcement
- `src/features/bookmarks/routes/route-library.ts` — library GET server fn + redirect-on-unauthorized
- `src/features/bookmarks/routes/route-library.server.ts` — server-only per-user loader

### New — Bookmark Feature Views

- `src/features/bookmarks/views/BookmarkLibraryPage.tsx` + `.module.css` — minimal library page
- `src/features/bookmarks/views/QuickAddBookmarkPage.tsx` + `.module.css` — quick-add form

### New — Routes

- `src/routes/_protected/bookmarks/new.tsx` — quick-add route adapter

### New — Auth Lib

- `src/features/auth/lib/auth-session.ts` — shared session types
- `src/features/auth/lib/unauthorized-error.ts` — unauthorized constants
- `src/features/auth/lib/is-unauthorized-error.ts` — defensive unauthorized detector

### New — Scripts

- `scripts/lib/bookmark-url-canonicalization.ts` — canonicalization engine
- `scripts/canonicalize-bookmark-urls.ts` — operator CLI

### New — Tests

- `test/features/bookmarks/lib/bookmark-derived-fields.test.ts` — 3 tests
- `test/features/bookmarks/lib/bookmark-url.test.ts` — 2 tests
- `test/features/bookmarks/server/create-bookmark.server.test.ts` — 11 tests
- `test/features/bookmarks/views/BookmarkLibraryPage.browser.test.tsx` — 2 tests
- `test/features/bookmarks/views/QuickAddBookmarkPage.browser.test.tsx` — 8 tests
- `test/features/auth/lib/is-unauthorized-error.test.ts` — 3 tests
- `test/routes/bookmarks/quick-add-route.test.ts` — route wiring smoke

### Modified

- `src/db/schema/bookmarks.ts` — added `bookmark_userId_url_unique` unique index
- `src/features/bookmarks/lib/bookmark-validation.ts` — quick-add validator + types
- `src/features/bookmarks/lib/validation.ts` — URL canonicalization on normalize, `isValidHttpUrl` extracted
- `src/features/bookmarks/server/user-scope.server.ts` — by-url / list / library helpers, dynamic imports
- `src/features/auth/server/auth.server.ts` — extracted session types
- `src/features/auth/server/authenticated-middleware.ts` — extracted types/constants, dynamic import
- `src/routes/_protected/index.tsx` — placeholder home → library page + loader
- `src/db/client.ts` — decoupled DB resolution from auth env
- `scripts/bootstrap-db.mjs` — canonicalize-before-migrate
- `package.json` — `db:migrate` + `db:canonicalize-bookmark-urls`
- `src/shared/i18n/resources/en.ts`, `es.ts`, `pt-BR.ts` — library/quick-add copy, removed placeholder home copy
- `e2e/utils/routes.ts` — `quickAddBookmark` route
- `e2e/tests/auth/authenticated-smoke.spec.ts` — assert new library copy + Add bookmark link
- `test/features/app-shell/views/ProtectedAppShell.browser.test.tsx` — caption assertion
- `test/db/bookmark-schema.test.ts` — 11 tests (duplicate rejection + preflight + canonicalization)
- `test/features/bookmarks/lib/bookmark-validation.test.ts` — 49 tests
- `test/features/bookmarks/lib/validation.test.ts` — 47 tests
- `test/features/bookmarks/server/user-scope.server.test.ts` — 9 tests

### Deleted

- `src/features/app-shell/views/ProtectedHomePage.tsx` + `.module.css` — replaced by BookmarkLibraryPage
- `test/features/app-shell/views/ProtectedHomePage.browser.test.tsx` — removed with placeholder home

### New — E2E

- `e2e/tests/bookmarks/quick-add-smoke.spec.ts` — 3 `@smoke` specs

## Key Decisions

1. **Duplicate enforcement at two layers (optimistic lookup + DB unique index)**: Precheck gives a clean inline error; the unique-index catch guarantees correctness under race conditions or double-submit. Both map to the same inline URL error.

2. **Migration preflight guard instead of naive `CREATE UNIQUE INDEX`**: Temp primary-key table surfaces legacy same-user duplicate URLs as a constraint failure before the index is created, avoiding a silent partial migration on corrupted local/prod data.

3. **Canonicalize-before-migrate in bootstrap**: Normalizes stored URLs so trailing-slash/case-equivalent duplicates cannot break the new unique index. Fail-loud on canonical-equivalent duplicates that would collide post-canonicalization.

4. **URL canonicalization centralized**: `bookmark-url.ts` is the single canonicalize + validate source; validation and duplicate lookup both route through it so duplicate detection is canonical-stable.

5. **Create server fn split (impl / server / fn)**: Pure mutation logic in `create-bookmark-impl.ts` is fully testable without a TanStack request context (injectable `database` + `idGenerator`); the request/session bridge and transport shell stay thin. Continues the FAV-2 composition-proof pattern.

6. **Quick-add validator isolated from create/update validators**: Dedicated `validateQuickAddBookmarkInput` keeps FAV-3 form rules (`url` required + optional `title`/`description`) separate from the lower-level FAV-2 persistence contract, avoiding a risky rewrite of `validateCreateBookmarkInput`.

7. **Server derives slug + fallback title**: Client never sends slug; blank title falls back to deterministic `hostname + pathname`. Keeps the quick-add input contract small.

8. **Dynamic imports in user-scope helpers**: Breaks the validation ↔ server ↔ schema circular dependency without restructuring module ownership.

9. **Defensive `isUnauthorizedError`**: Auth failures propagate through TanStack transport in multiple wrapped shapes (Response, `.status`, `.statusCode`, `.code`, `.message`, nested `.data`/`.cause`). One detector handles them all so loaders and the view can reliably redirect to `/login`.

10. **DB client decoupled from auth env**: `getDb`/`createDb` read `DATABASE_URL`/`DATABASE_AUTH_TOKEN` directly with a sane default, so bootstrap/canonicalization scripts and server helpers resolve a client without Better Auth env coupling.

11. **Router invalidation on success nav**: `router.invalidate()` before `navigate({ to: '/' })` ensures the library loader refetches after client-side post-save navigation rather than serving stale route data.

12. **No reusable bookmark card yet**: FAV-3 needs only one minimal presentation surface; card extraction deferred to FAV-4 to avoid premature abstraction.

## Review / QA Fix Loops

The implementation went through several review/QA iterations before reaching green state (inferred from the structural evidence — each loop below is reflected in code/migrations/tests):

- **Duplicate-URL rule reversal migration safety**: Reversing FAV-2's "duplicate URLs allowed" rule risked breaking the unique index on existing same-user dupes. Resolved with the preflight temp-table guard + canonicalize-before-migrate.
- **Canonicalization-equivalent duplicate bypass**: Naive duplicate detection missed `https://x/` vs `https://x` variants. Resolved by canonicalizing in both validation and `getBookmarkByUrlForUser`, plus a `canonicalizeBookmarkUrls` pass with fail-loud on collisions.
- **Server fn testability**: Initial single-file mutation was hard to unit-test (required request context). Resolved by splitting impl/server/fn so the mutation runs against an injected temp DB.
- **Circular import (validation ↔ server)**: user-scope helpers eagerly importing `bookmark` schema created a cycle. Resolved with dynamic imports inside each helper.
- **Auth failure shape variance**: View/loader redirect logic missed wrapped auth errors. Resolved with the multi-shape `isUnauthorizedError` detector.
- **Stale library data after save**: Client navigation served cached loader data. Resolved with `router.invalidate()` before navigate.
- **Double-submit / stale response**: Rapid submits could create duplicates or apply an old response. Resolved with `saveRequestRef` + `activeRequestIdRef` guards.
- **DB client ↔ auth env coupling**: Bootstrap/canonicalization scripts couldn't resolve a client cleanly. Resolved by decoupling `createDb` to read env vars directly.
- **`db:migrate` correctness**: Bare `drizzle-kit migrate` skipped canonicalization. Resolved by pointing `db:migrate` at `bootstrap-db.mjs`.

## Validation Performed

- **Schema integration** (`test/db/bookmark-schema.test.ts`, 11 tests): fresh bootstrapped temp DB proves columns/indexes/constraints, state CHECK, defaults, label uniqueness, bookmark URL uniqueness per user + cross-user allowed, preflight fail-loud on legacy dupes, and bootstrap canonicalization (incl. fail-loud on canonical-equivalent collisions).
- **Validation unit** (`bookmark-validation.test.ts` 49, `validation.test.ts` 47): quick-add + create/update validators, normalization, canonicalization, limits.
- **Derived fields** (`bookmark-derived-fields.test.ts` 3) + URL helpers (`bookmark-url.test.ts` 2).
- **Create mutation** (`create-bookmark.server.test.ts` 11): success + fallback derivation, title clamping, inline duplicate, duplicate-after-canonicalization, cross-user allowed, validation failures, unique-constraint catch, persistence, non-duplicate re-throw, structured result.
- **User scope** (`user-scope.server.test.ts` 9): by-url owner scope, canonical root match, newest-first ordering, cross-user rejection, ownership, full server-fn composition proof.
- **Browser views** (`QuickAddBookmarkPage.browser.test.tsx` 8, `BookmarkLibraryPage.browser.test.tsx` 2): inline errors, error clearing, success handler, route invalidation + nav, duplicate-submit guard, disable-while-saving, default server-fn path, form error on throw, library rendering.
- **Auth lib** (`is-unauthorized-error.test.ts` 3, `authenticated-middleware.test.ts` 5): detector shapes + middleware regression after refactor.
- **E2E** (`e2e/tests/bookmarks/quick-add-smoke.spec.ts`, 3 `@smoke`): happy-path create → redirect → bookmark visible at top of library; duplicate URL shows inline error and stays on add page; invalid URL shows alert and stays on add page.
- **E2E regression** (`authenticated-smoke.spec.ts`): updated to assert new library copy (`Your bookmarks`) + `Add bookmark` link across reload + sign-out.
- **State**: all targeted suites green. Full `pnpm complete-check` (knip, typecheck, lint, format, test, build, E2E) pending commit (changes uncommitted in working tree).

## Risks and Follow-ups

- **Commit pending**: All FAV-3 changes are uncommitted in the working tree. Commit + PR + AI review + full `pnpm complete-check` required before merge.
- **Production migration ordering**: Prod deploy must run canonicalize-before-migrate (bootstrap) or the unique index can fail on pre-existing same-user duplicate URLs. The standalone `pnpm db:canonicalize-bookmark-urls` dry-run should be run against prod data first to detect canonical-equivalent collisions.
- **No reusable bookmark card component**: Deferred to FAV-4 card/grid/filter polish. Library currently renders inline row markup.
- **No slug uniqueness/index**: `slug` still has no DB uniqueness or index. Add in a future migration if slug-based lookups/links are needed.
- **No auto-metadata/scraping**: Out of FAV-3 scope; title/description are manual or URL-derived only.
- **`bookmarkValidationLimits` is the reusable contract**: UI and future server slices must reuse the shared limits rather than hardcoding.
- **`listBookmarksForUser` vs `listLibraryBookmarksForUser`**: Two list helpers exist; consolidate if the full/projection split is no longer needed.
- **`scripts/bootstrap-auth-db.mjs` deprecated alias** (from FAV-2) remains; remove once all references confirmed migrated.
