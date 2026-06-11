# Favoritable PRD Issue Breakdown

Source: `docs/prd/favoritable-prd.md`

Goal: break MVP into thin vertical slices that can later become Linear issues.

## Proposed Slices

### 1. App foundation with auth shell and CI

- Title: App foundation with auth shell and CI
- Type: AFK
- Blocked by: None
- User stories covered:
  - As a user, I want to sign in with an OAuth provider so I can access my bookmark library securely.
  - As a user, I want my session to persist so I do not need to log in repeatedly.

#### What to build

Establish the new TanStack Start application foundation with React 19, Base UI, CSS Modules, design tokens, Better Auth wiring, protected route shell, light and dark theming, and GitHub Actions quality gates. Users should be able to authenticate, keep a secure session across reloads, sign out, and land in an empty protected app shell.

#### Acceptance criteria

- [ ] React 19 + TanStack Start app runs with protected and public route structure.
- [ ] Better Auth supports Google, Facebook, GitHub, and Apple sign-in for MVP.
- [ ] First successful login creates the user if missing and persists a secure session.
- [ ] Authenticated users can sign out and are redirected out of protected areas.
- [ ] Base UI, CSS Modules, design tokens, and light/dark themes are wired into the shell.
- [ ] GitHub Actions runs lint, typecheck, test, and build successfully.

### 2. User-scoped bookmark schema and server validation baseline

- Title: User-scoped bookmark schema and server validation baseline
- Type: AFK
- Blocked by: 1. App foundation with auth shell and CI
- User stories covered:
  - Supports all bookmark and label stories as foundational data slice.

#### What to build

Add the MVP data model for bookmarks, labels, and bookmark-label relations with user scoping, cascade behavior, uniqueness rules, shared validation, and authenticated TanStack Start server function patterns that other slices can build on.

#### Acceptance criteria

- [ ] Database schema includes User, Bookmark, Label, and BookmarkLabel fields required by the PRD.
- [ ] Label names are unique per user.
- [ ] User-scoped access checks are enforced in shared server-side patterns.
- [ ] Input validation exists for bookmark and label mutations.
- [ ] Database and validation helpers are ready for reuse by later slices.

### 3. Quick add bookmark by URL with manual fields

- Title: Quick add bookmark by URL with manual fields
- Type: AFK
- Blocked by: 2. User-scoped bookmark schema and server validation baseline
- User stories covered:
  - As a user, I want to add a bookmark manually by URL.

#### What to build

Deliver the first end-to-end bookmark creation flow. An authenticated user can submit a URL, optionally adjust basic fields, and save a bookmark into their library through validated server functions.

#### Acceptance criteria

- [ ] Authenticated users can create a bookmark with at least a URL.
- [ ] Create flow validates URL input and stores bookmark ownership correctly.
- [ ] User can edit title and description before final save even without scraping.
- [ ] Successful creation redirects or updates the library so the new bookmark is visible.
- [ ] Failure states are visible and do not leave partial user-facing success.

### 4. Bookmark library list with empty state and responsive cards

- Title: Bookmark library list with empty state and responsive cards
- Type: AFK
- Blocked by: 3. Quick add bookmark by URL with manual fields
- User stories covered:
  - As a user, I want to view a bookmark list and bookmark detail.

#### What to build

Build the main library view for authenticated users with responsive bookmark presentation, empty states for new users, and core metadata at a glance using the Pencil design and tokens.

#### Acceptance criteria

- [ ] Library route lists current user's bookmarks only.
- [ ] Empty state guides a new user toward adding bookmarks.
- [ ] Bookmark cards or rows show title, description, URL context, and state affordances.
- [ ] Layout works on desktop and mobile and follows design tokens.
- [ ] Keyboard navigation and visible focus states work in the library view.

### 5. Bookmark detail and edit flow

- Title: Bookmark detail and edit flow
- Type: AFK
- Blocked by: 4. Bookmark library list with empty state and responsive cards
- User stories covered:
  - As a user, I want to edit a bookmark after creation.
  - As a user, I want to view a bookmark list and bookmark detail.

#### What to build

Add bookmark detail and edit capabilities so users can inspect a single bookmark and update saved fields through protected server functions.

#### Acceptance criteria

- [ ] Users can open a bookmark detail view from the library.
- [ ] Detail view shows saved metadata including optional fields when present.
- [ ] Users can edit bookmark fields and persist changes.
- [ ] Updated values are reflected in both detail and library views.
- [ ] User cannot access or edit another user's bookmark.

### 6. Delete and bulk-delete bookmark management

- Title: Delete and bulk-delete bookmark management
- Type: AFK
- Blocked by: 5. Bookmark detail and edit flow
- User stories covered:
  - As a user, I want to delete a bookmark I no longer need.

#### What to build

Implement single-delete and bulk-delete bookmark management with safe destructive-action UX for routine cleanup and import cleanup.

#### Acceptance criteria

- [ ] Users can delete a single bookmark from detail or library contexts.
- [ ] Users can select multiple bookmarks and bulk delete them.
- [ ] Destructive actions require clear confirmation or equivalent safe UX.
- [ ] Deleted bookmarks disappear from the user's library without affecting other users.
- [ ] Failure feedback is shown when deletion cannot complete.

### 7. Metadata scraping orchestration on add-by-URL

- Title: Metadata scraping orchestration on add-by-URL
- Type: AFK
- Blocked by: 3. Quick add bookmark by URL with manual fields
- User stories covered:
  - As a user, I want the app to scrape bookmark metadata automatically when possible.

#### What to build

Integrate best-effort URL metadata enrichment into the add-bookmark flow using Puppeteer-based scraping parity with the current system. Users should see scraped values, be able to edit them before save, and still save when scraping fails.

#### Acceptance criteria

- [ ] Add-by-URL attempts metadata extraction for title, description, author, thumbnail, and published date.
- [ ] Scrape uses Puppeteer-driven page loading and best-effort extraction strategy.
- [ ] User can review and edit scraped values before saving.
- [ ] Partial or full scrape failure does not block bookmark creation.
- [ ] UI communicates scrape success, partial success, or failure clearly.

### 8. Favorites, archive state, and system collections

- Title: Favorites, archive state, and system collections
- Type: AFK
- Blocked by: 4. Bookmark library list with empty state and responsive cards
- User stories covered:
  - As a user, I want to favorite bookmarks so I can find important ones quickly.
  - As a user, I want to archive bookmarks so I can hide inactive items without deleting them.
  - As a user, I want to filter bookmarks by labels and system collections.

#### What to build

Add favorite and archive behavior plus system collections for All, Favorites, and Archived so users can move between active working sets quickly.

#### Acceptance criteria

- [ ] Users can favorite and unfavorite bookmarks from library and detail contexts.
- [ ] Users can archive and unarchive bookmarks from library and detail contexts.
- [ ] Library exposes All, Favorites, and Archived collections.
- [ ] Collection switching updates results correctly while preserving user scoping.
- [ ] Bookmark presentation reflects favorite and archived state clearly.

### 9. Label CRUD with attach flow

- Title: Label CRUD with attach flow
- Type: AFK
- Blocked by: 5. Bookmark detail and edit flow
- User stories covered:
  - As a user, I want to create and manage labels so I can organize bookmarks.

#### What to build

Implement user label management and bookmark-label attachment so labels become usable organization units during create and edit flows.

#### Acceptance criteria

- [ ] Users can create, rename, and delete their labels.
- [ ] Label names remain unique per user.
- [ ] A bookmark can have multiple labels.
- [ ] Users can attach and remove labels during bookmark create or edit.
- [ ] Deleted labels are removed cleanly from bookmark associations.

### 10. Combined label filtering, search, and sort

- Title: Combined label filtering, search, and sort
- Type: AFK
- Blocked by: 8. Favorites, archive state, and system collections; 9. Label CRUD with attach flow
- User stories covered:
  - As a user, I want to filter bookmarks by labels and system collections.
  - As a user, I want to search bookmarks by title, description, and URL.
  - As a user, I want to sort bookmarks by recent activity or title.

#### What to build

Deliver retrieval tooling in the library so users can combine system collection selection, label filtering, text search, and sort controls in one responsive workflow.

#### Acceptance criteria

- [ ] Search matches title, description, and URL.
- [ ] Sort supports date added, date updated, and title.
- [ ] Users can filter by one or more labels.
- [ ] Search, sort, label filters, and system collections work together without conflicting behavior.
- [ ] Query state is stable enough for routine navigation and refresh.

### 11. HTML import with folder parsing and enrichment

- Title: HTML import with folder parsing and enrichment
- Type: AFK
- Blocked by: 7. Metadata scraping orchestration on add-by-URL; 10. Combined label filtering, search, and sort
- User stories covered:
  - As a user, I want to import bookmarks from browser HTML exports.

#### What to build

Support browser bookmark HTML import using Cheerio-based parsing of entries and folder names, followed by metadata enrichment for imported URLs and clear reporting for invalid rows.

#### Acceptance criteria

- [ ] Users can upload a browser bookmark HTML export.
- [ ] Import parses bookmark entries and folder names.
- [ ] Imported bookmarks are created for the current user only.
- [ ] Imported URLs go through enrichment flow where applicable.
- [ ] Invalid entries and import status are reported clearly.

### 12. Text import with line-by-line enrichment

- Title: Text import with line-by-line enrichment
- Type: AFK
- Blocked by: 7. Metadata scraping orchestration on add-by-URL; 10. Combined label filtering, search, and sort
- User stories covered:
  - As a user, I want to import bookmarks from text files with line-separated URLs.

#### What to build

Support plain text import for line-separated URLs, skip empty lines, enrich valid URLs, and report invalid rows clearly.

#### Acceptance criteria

- [ ] Users can upload a text file of line-separated URLs.
- [ ] Non-empty valid lines are imported as bookmarks for the current user.
- [ ] Imported URLs go through enrichment flow where applicable.
- [ ] Empty and invalid lines are skipped and reported clearly.
- [ ] Import progress or clear status feedback is shown during processing.

### 13. Omnivore import preserving metadata and labels

- Title: Omnivore import preserving metadata and labels
- Type: AFK
- Blocked by: 9. Label CRUD with attach flow; 10. Combined label filtering, search, and sort
- User stories covered:
  - As a user, I want to import bookmarks from Omnivore exports.

#### What to build

Add Omnivore import that maps incoming bookmark data directly, preserves available metadata and labels, and avoids unnecessary scrape passes when source metadata already exists.

#### Acceptance criteria

- [ ] Users can upload the supported Omnivore export format.
- [ ] Available Omnivore metadata maps directly into bookmark fields.
- [ ] Available Omnivore labels are preserved or created for the current user.
- [ ] Import avoids scrape dependency for records that already include sufficient metadata.
- [ ] Invalid or unsupported entries are reported clearly.

### 14. Export and backup baseline

- Title: Export and backup baseline
- Type: AFK
- Blocked by: 10. Combined label filtering, search, and sort
- User stories covered:
  - As a user, I want to export my bookmarks as a backup.

#### What to build

Provide a trustworthy export flow so users can back up their library and move their bookmarks out of the system when needed.

#### Acceptance criteria

- [ ] Users can export their bookmarks from the protected application.
- [ ] Export contains enough bookmark and label data to serve as a reliable backup.
- [ ] Export is scoped to the authenticated user only.
- [ ] Export format and status messaging are documented in the UI.
- [ ] Basic validation or tests cover export correctness.

### 15. Accessibility and responsive UX hardening

- Title: Accessibility and responsive UX hardening
- Type: AFK
- Blocked by: 10. Combined label filtering, search, and sort; 11. HTML import with folder parsing and enrichment; 12. Text import with line-by-line enrichment; 13. Omnivore import preserving metadata and labels; 14. Export and backup baseline
- User stories covered:
  - Covers MVP UX and non-functional accessibility requirements across slices.

#### What to build

Harden the end-to-end MVP UX for keyboard access, focus management, color contrast, responsive layouts, clear empty and error states, and import/scrape status feedback.

#### Acceptance criteria

- [ ] MVP routes meet WCAG AA baseline for keyboard access, focus visibility, landmarks, and contrast.
- [ ] Desktop and mobile layouts are verified across library, detail, add, and import flows.
- [ ] Scrape and import flows expose clear loading, success, partial-failure, and failure messaging.
- [ ] New-user and no-results states are clear and actionable.
- [ ] Accessibility and responsive coverage exists in automated or documented QA checks.

### 16. Observability, reliability, and performance pass

- Title: Observability, reliability, and performance pass
- Type: AFK
- Blocked by: 15. Accessibility and responsive UX hardening
- User stories covered:
  - Supports PRD success criteria and hardening requirements across all stories.

#### What to build

Add final MVP hardening for logging, error handling, reliability of long-running import and scrape workflows, and performance checks so the rebuilt product is stable for real personal-library use.

#### Acceptance criteria

- [ ] Critical bookmark, import, export, and scrape paths emit useful structured logs.
- [ ] Import and scrape failures degrade gracefully without freezing the UI.
- [ ] Listing, filtering, and search feel responsive for normal personal libraries.
- [ ] Critical flows have test coverage and pass the project quality gate.
- [ ] MVP is ready to validate against the PRD success criteria.

## Dependency Summary

1. App foundation with auth shell and CI
2. User-scoped bookmark schema and server validation baseline
3. Quick add bookmark by URL with manual fields
4. Bookmark library list with empty state and responsive cards
5. Bookmark detail and edit flow
6. Delete and bulk-delete bookmark management
7. Metadata scraping orchestration on add-by-URL
8. Favorites, archive state, and system collections
9. Label CRUD with attach flow
10. Combined label filtering, search, and sort
11. HTML import with folder parsing and enrichment
12. Text import with line-by-line enrichment
13. Omnivore import preserving metadata and labels
14. Export and backup baseline
15. Accessibility and responsive UX hardening
16. Observability, reliability, and performance pass

## Review Questions

1. Granularity right, or split further?
2. Dependencies right, or reorder any slices?
3. Any slice should be merged with another?
4. Any slice should be marked HITL instead of AFK?
