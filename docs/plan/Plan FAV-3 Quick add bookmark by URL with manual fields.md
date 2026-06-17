## Task Analysis

- Main objective: Deliver FAV-3 as first end-to-end bookmark creation slice: authenticated user opens a protected quick-add flow, submits a required URL with optional title/description edits, saves through a validated server function, then lands on a minimal library page that shows the saved bookmark.
- Identified dependencies:
  - Existing protected-route/auth seams already in repo: `src/features/auth/routes/route-auth.ts`, `src/routes/_protected.tsx`, and `src/features/auth/server/authenticated-middleware.ts`.
  - Existing bookmark baseline from FAV-2: `src/db/schema/bookmarks.ts`, `drizzle/0002_violet_union_jack.sql`, `src/features/bookmarks/lib/bookmark-validation.ts`, and `src/features/bookmarks/server/user-scope.server.ts`.
  - Existing protected landing route is still placeholder-only: `src/routes/_protected/index.tsx` + `src/features/app-shell/views/ProtectedHomePage.tsx`.
  - Existing test harnesses to reuse: temp DB bootstrap helpers under `test/lib/**`, bookmark schema/validation tests, route tests, browser tests, and Playwright authenticated-session fixture.
  - Design source `docs/design/favoritable.pen` currently exposes home/login/not-found shells only; no dedicated bookmark add/library frame exists yet, so FAV-3 must stay visually minimal and reuse current protected-shell token patterns.
- System impact:
  - FAV-3 intentionally changes one FAV-2 baseline rule: duplicate bookmark URLs move from “allowed” to “blocked per user”. That affects schema, migration, tests, and server-side error mapping.
  - This slice introduces first live bookmark runtime path across DB schema constraint, bookmark feature validation, authenticated mutation, protected route data loading, and protected UI.
  - Key risks: migration failure if any existing local DB already contains same-user duplicate URLs, route-data refresh after client navigation if loader caching is stale, and accidental scope creep into scraping or full FAV-4 library polish.

## Chosen Approach

- Proposed solution:
  - Repurpose the existing protected index route `/` into the minimal library page for this slice, and add one new protected route at `/bookmarks/new` for the quick-add form.
  - Keep FAV-3 input contract small by adding a dedicated quick-add validator in `src/features/bookmarks/lib/bookmark-validation.ts` that accepts `{ url, title?, description? }`, while preserving current broader create/update validators. Derive fallback title and slug on the server from the normalized URL/title instead of asking the client for `slug` or requiring `title`.
  - Enforce duplicate blocking at two layers: optimistic same-user duplicate lookup before insert, plus a DB unique index on `(userId, url)` so race conditions or double-submit cannot create false success.
- Justification for simplicity:
  - Reusing `/` as the library avoids introducing both a new `/library` route and later redirect cleanup. Current protected home copy already describes the shell as the future library, so replacing the placeholder is the cleanest next move.
  - A dedicated quick-add validator isolates FAV-3 form rules from the lower-level persistence contract already established in FAV-2, avoiding a risky semantic rewrite of `validateCreateBookmarkInput`.
  - A minimal empty-state/list page is enough to prove redirect visibility without drifting into FAV-4 card/grid/filter polish.
  - A DB unique index is small, deterministic, and safer than a precheck-only approach, which would still allow concurrent duplicate inserts.
  - Rejected approach: keep placeholder `/` and add separate `/library`. More files, more redirects, less value.
  - Rejected approach: put add form directly inside current home page and skip separate route. Short-term smaller, but mixes create/list concerns and leaves no stable add URL for future flows.
- Components to be modified/created:
  - Routing and page views:
    - `src/routes/_protected/index.tsx` — switch protected landing route from placeholder home to minimal bookmark library page.
    - `src/routes/_protected/bookmarks/new.tsx` — new protected route adapter for quick add.
    - `src/features/bookmarks/views/BookmarkLibraryPage.tsx` + `BookmarkLibraryPage.module.css` — minimal authenticated library page with heading, empty state, add CTA, and bookmark rows.
    - `src/features/bookmarks/views/QuickAddBookmarkPage.tsx` + `QuickAddBookmarkPage.module.css` — URL/title/description form, inline errors, save state, success navigation.
  - Bookmark feature helpers/server modules:
    - `src/features/bookmarks/lib/bookmark-validation.ts` — add `QuickAddBookmarkInput`, quick-add validator, and related exported types.
    - `src/features/bookmarks/lib/bookmark-derived-fields.ts` (or equivalent focused helper) — derive fallback title from `hostname + pathname` and build a bounded slug from final title/URL.
    - `src/features/bookmarks/server/user-scope.server.ts` — add `getBookmarkByUrlForUser` and `listBookmarksForUser` helpers scoped by `userId`.
    - `src/features/bookmarks/server/create-bookmark.server.ts` — authenticated POST server function, duplicate mapping, bookmark insert logic.
    - `src/features/bookmarks/routes/route-library.ts` (or equivalent feature-side route helper) — server-only data loader for the library page so route files stay thin.
  - Schema + migration:
    - `src/db/schema/bookmarks.ts` — add unique bookmark URL index per user.
    - `drizzle/0003_*.sql` + `drizzle/meta/*` — migration for the new unique index.
  - Copy + tests:
    - `src/shared/i18n/resources/en.ts`, `src/shared/i18n/resources/es.ts`, `src/shared/i18n/resources/pt-BR.ts` — add minimal library/quick-add copy and remove placeholder protected-home messaging that would become false.
    - `test/db/bookmark-schema.test.ts`
    - `test/features/bookmarks/lib/bookmark-validation.test.ts`
    - `test/features/bookmarks/lib/bookmark-derived-fields.test.ts` (if helper is extracted)
    - `test/features/bookmarks/server/create-bookmark.server.test.ts`
    - `test/features/bookmarks/server/user-scope.server.test.ts`
    - `test/features/bookmarks/views/BookmarkLibraryPage.browser.test.tsx`
    - `test/features/bookmarks/views/QuickAddBookmarkPage.browser.test.tsx`
    - `test/routes/bookmark-routes.test.tsx` or a targeted extension of the existing route suite
    - `e2e/tests/auth/authenticated-smoke.spec.ts`
    - `e2e/tests/bookmarks/quick-add-smoke.spec.ts`

## Implementation Steps

1. Lock FAV-3 boundaries before editing code: keep scope to manual URL add only, no scraping, no labels, no favorites/archive, no detail page, and no FAV-4 responsive-card polish. Confirm protected index `/` becomes the minimal library page for this slice, and document that `docs/design/favoritable.pen` has no dedicated bookmark add/library frame, so implementation should reuse existing shell spacing/token language instead of inventing a larger new design system surface.
2. Reverse the duplicate-URL rule at the data layer: update `src/db/schema/bookmarks.ts` to add a unique index on `(userId, url)`, generate the next Drizzle migration, and rewrite schema integration assertions in `test/db/bookmark-schema.test.ts` from “same-user duplicate URLs allowed” to “same-user duplicate URLs rejected, cross-user same URL allowed”. Risk note: if any local database already contains duplicate bookmark URLs for one user, the migration can fail; mitigation is to verify/clean local seed data before treating the migration as final.
3. Add a dedicated quick-add input contract in `src/features/bookmarks/lib/bookmark-validation.ts`: accept only `url` required plus optional `title` and `description`, trim values, reuse existing max-length limits, keep URL validation on native `http/https` parsing, and return the same structured validation shape already used elsewhere. In the same slice, add a focused pure helper for derived fields so blank titles become a deterministic `hostname + pathname` fallback and a non-empty slug is always generated server-side from the final title/URL. Checkpoint: do not widen this slice into URL canonicalization beyond the repo’s current trimmed validated string contract unless tests or product direction explicitly require it.
4. Extend user-scoped bookmark server helpers instead of inventing a new server abstraction layer: add `getBookmarkByUrlForUser` for duplicate detection and `listBookmarksForUser` ordered newest-first inside `src/features/bookmarks/server/user-scope.server.ts`. Update or add temp-DB integration tests so these helpers prove same-user scope, cross-user isolation, and sort order needed for post-save visibility.
5. Create `src/features/bookmarks/server/create-bookmark.server.ts` as the first real bookmark mutation: use `createAuthenticatedServerFn({ method: 'POST' })`, validate incoming quick-add payload, derive final title + slug, perform optimistic duplicate lookup with trusted `context.userId`, insert bookmark with a generated id, and return a small discriminated result the page can consume (`success` plus bookmark id on pass; structured field/form errors on fail). Mitigation: catch the DB unique-index violation too and map it back to the same inline URL field error so a race condition cannot produce a false success.
6. Add a feature-side route data helper for the library page using the repo’s current route-helper pattern: keep `src/routes/_protected/index.tsx` thin, and move user-scoped bookmark loading into `src/features/bookmarks/routes/route-library.ts` (or equivalent) using a server-only request/session-aware helper. The loader should return only current-user bookmarks and keep output minimal for FAV-3: id, url, title, description, createdAt/updatedAt only if the view needs them.
7. Replace the placeholder protected home with the minimal real library page: build `BookmarkLibraryPage.tsx` to render a heading, concise empty state with CTA to `/bookmarks/new`, and a simple newest-first list of the user’s saved bookmarks showing title, URL, and description when present. Keep styling in a local CSS Module using existing design tokens and current shell/panel patterns; do not extract a reusable bookmark card component yet because FAV-3 only needs one minimal presentation surface. Also update the protected-shell and route copy in i18n resources so users no longer see placeholder “library shell later” messaging after FAV-3 lands.
8. Add the quick-add route/page at `/bookmarks/new`: implement a simple accessible form with URL, title, and description; submit through the authenticated server function; render inline field errors plus a generic form-level failure state; disable duplicate submissions while saving; and navigate to `/` only after a confirmed success response. Rollback/mitigation note: if TanStack route data stays stale after client navigation, explicitly invalidate the router around the post-save navigation rather than adding a heavier client-state solution.
9. Expand automated coverage at the same seams as the implementation: unit tests for quick-add validation and derived-field fallback logic, server integration tests for create success/duplicate failure/ownership persistence, browser tests for empty-state and inline-error rendering on the new pages, route tests for protected wiring/data loading where valuable, and Playwright coverage with at least one `@smoke` happy-path spec that authenticates, creates a bookmark, redirects, and verifies it appears in the library. Update the existing authenticated smoke assertions so the protected landing page checks the new minimal library, not the old placeholder home copy.
10. Run verification in widening rings: targeted bookmark schema + validation + server + browser tests first, then Playwright bookmark smoke, then `pnpm complete-check`. Final manual QA pass should cover: invalid URL stays on add page with visible inline error; blank title saves with hostname/path fallback; duplicate URL for same user stays on add page with inline URL error and no new row; successful save lands on `/` and the new bookmark is visible at the top of the minimal library.

## Validation

- Success criteria:
  - Authenticated user can open the quick-add page, submit a valid URL with optional title/description edits, and a bookmark is stored with the authenticated `userId` only.
  - Blank title does not block save; server derives a deterministic hostname/path fallback title and a non-empty slug.
  - Duplicate bookmark URLs are blocked per user, surfaced as inline URL errors, and do not navigate away or imply success; the same URL can still exist for a different user.
  - Protected index `/` now behaves as the minimal library page and visibly shows the newly created bookmark after the success redirect.
  - FAV-3 ships only the manual add + minimal library slice: no scraping, no label attach flow, no favorites/archive controls, no detail route, and no FAV-4 UI polish.
- Checkpoints:
  - Pre-implementation assumptions check: confirm `/` is acceptable as the first library route, confirm `docs/design/favoritable.pen` still has no bookmark add/library frame to mirror directly, and confirm the user’s duplicate-per-user rule supersedes the earlier FAV-2 duplicate-allowed baseline.
  - During Steps 2-4: migration adds only the bookmark URL uniqueness contract, temp-DB tests prove same-user duplicates fail and cross-user duplicates pass, and quick-add validation tests prove optional title/description plus deterministic fallback derivation.
  - During Steps 5-8: the create server function always uses trusted auth context for ownership, failure paths return structured errors without partial success UX, and library data loading returns only the current user’s bookmarks in newest-first order.
  - Post-implementation regression: bookmark-specific unit/integration/browser suites are green, Playwright smoke proves end-to-end create -> redirect -> visible bookmark, and `pnpm complete-check` passes unchanged.
