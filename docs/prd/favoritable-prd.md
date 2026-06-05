# Product Requirements Document (PRD)

## Project Name

**Favoritable** — A modern personal bookmark manager built as a full-stack TanStack Start application.

## 1. Purpose

Build a personal bookmark management application that allows users to:

- authenticate with secure social login
- save bookmarks manually or from a URL
- enrich bookmarks with scraped metadata
- organize bookmarks with labels and system collections
- search, sort, edit, archive, favorite, delete, import, and export bookmarks

This product should be rebuilt from scratch with a simpler, more cohesive architecture than the current project.

## 2. Product Goals

### Primary Goals

- Make saving and retrieving bookmarks fast and reliable
- Support rich bookmark metadata, not only raw URLs
- Provide strong organization through labels, favorites, and archived state
- Enable migration from other bookmark sources through import flows
- Keep architecture simple by using TanStack Start full-stack capabilities instead of a separate API framework

### Secondary Goals

- Prepare architecture for browser extension support later
- Prepare architecture for future mobile/share workflows
- Keep room for future AI-assisted label suggestions

## 3. Non-Goals for MVP

- Shared/team bookmark spaces
- Real-time collaboration
- Browser extension release
- Native mobile app release
- AI automation beyond optional future label suggestion
- Internationalization in first delivery unless prioritized separately

## 4. Target Users

- Individuals who want a personal bookmark library
- Users migrating bookmarks from browser exports, text files, or Omnivore
- Users who care about metadata, organization, and long-term retrieval

## 5. Target Platform

### MVP

- Web application

### Later

- Browser extension
- Mobile application or mobile share flow

## 6. Core User Stories

### Authentication

- As a user, I want to sign in with an OAuth provider so I can access my bookmark library securely.
- As a user, I want my session to persist so I do not need to log in repeatedly.

### Bookmark CRUD

- As a user, I want to add a bookmark manually by URL.
- As a user, I want the app to scrape bookmark metadata automatically when possible.
- As a user, I want to edit a bookmark after creation.
- As a user, I want to view a bookmark list and bookmark detail.
- As a user, I want to delete a bookmark I no longer need.

### Bookmark Organization

- As a user, I want to favorite bookmarks so I can find important ones quickly.
- As a user, I want to archive bookmarks so I can hide inactive items without deleting them.
- As a user, I want to create and manage labels so I can organize bookmarks.
- As a user, I want to filter bookmarks by labels and system collections.

### Discovery and Retrieval

- As a user, I want to search bookmarks by title, description, and URL.
- As a user, I want to sort bookmarks by recent activity or title.

### Import and Portability

- As a user, I want to import bookmarks from browser HTML exports.
- As a user, I want to import bookmarks from text files with line-separated URLs.
- As a user, I want to import bookmarks from Omnivore exports.
- As a user, I want to export my bookmarks as a backup.

## 7. Functional Requirements

## 7.1 Authentication

- The application must use Better Auth.
- The application must support OAuth login.
- MVP providers must include Google, Facebook, GitHub, and Apple.
- The first successful login should create the user automatically if needed.
- Protected pages and server functions must require authentication.
- Sessions must persist securely across browser reloads.
- Users must be able to sign out.

## 7.2 Bookmark Creation

- Users must be able to create bookmarks with at least a URL.
- The system must attempt to enrich bookmark metadata from the URL.
- The system should capture when available:
  - title
  - description
  - author
  - thumbnail/image
  - published date
- Users must be able to edit scraped values before saving.
- Users must be able to attach labels during or after creation.

## 7.3 Bookmark CRUD

- Users must be able to list bookmarks.
- Users must be able to view bookmark detail.
- Users must be able to edit bookmarks.
- Users must be able to delete bookmarks.
- Users should be able to perform bulk delete as part of bookmark management or import cleanup.

## 7.4 Bookmark State and Collections

- Each bookmark must support an active or archived state.
- Each bookmark must support favorite/unfavorite behavior.
- The UI must expose system collections:
  - All
  - Favorites
  - Archived

## 7.5 Labels

- Users must be able to create labels.
- Users must be able to rename labels.
- Users must be able to delete labels.
- A bookmark must support multiple labels.
- Users must be able to filter bookmarks by label.
- Label names must be unique per user.

## 7.6 Search and Sort

- Search must support title, description, and URL.
- Sort must support:
  - date added
  - date updated
  - title/alphabetical
- Search, sort, and filtering must work together.

## 7.7 Import and Export

- The application must support importing bookmarks from:
  - browser HTML export
  - line-separated text file
  - Omnivore export
- The application must preserve source metadata when available.
- The application must support exporting bookmarks for backup and portability.
- Import strategy should mirror the current implementation:
  - HTML imports: parse bookmark entries and folder names from exported HTML using `cheerio`, then scrape each imported URL for enriched metadata
  - text imports: parse non-empty lines as URLs, then scrape each imported URL for enriched metadata
  - Omnivore imports: map incoming bookmark data directly, preserving available metadata and labels without requiring a scrape pass

## 7.8 Bookmark Presentation

- The bookmark list must present useful metadata at a glance.
- Bookmark cards or rows should show:
  - title
  - description
  - author when available
  - thumbnail when available
  - labels
  - favorite/archive state
- The UI must work on desktop and mobile.

## 8. Technical Product Constraints

## 8.1 Required Stack

- React 19
- TanStack Start using full-stack capabilities
- TanStack Start server functions for backend logic
- Drizzle ORM
- Turso / SQLite-compatible database path
- Better Auth
- Base UI
- CSS Modules
- GitHub Actions

## 8.2 Architecture Direction

- Do not use Hono as a separate backend layer.
- Prefer TanStack Start server functions for mutations and server-side data access.
- Keep product architecture as one full-stack application unless a later extraction becomes necessary.
- Shared validation and types should be used across client and server boundaries where practical.

## 8.3 Styling

- CSS Modules must be the primary component styling approach.
- Design tokens must remain the source of truth for spacing, color, typography, radius, and shadows.
- The frontend visual design must follow `docs/design/favoritable.pen`.
- The Pencil design file is the source of truth for layout, hierarchy, component styling, and visual behavior.
- Implementation must use the project's generated design tokens to match the Pencil design.
- UI must support both light and dark themes.

## 9. Metadata Scraping Requirements

## Goal

When a user submits a URL, the application should enrich the bookmark automatically with useful metadata.

## Required Behavior

- Attempt to fetch metadata when a URL is added.
- Return best-effort fields for title, description, author, thumbnail, and published date.
- Fail gracefully when metadata cannot be extracted.
- Allow the user to continue saving even if scraping fails partially or completely.

## Recommended Approach

Recommended initial strategy for the new project should mirror the current working implementation.

Current implementation strategy to preserve:

- use `puppeteer` as the primary URL scraping engine
- open the target page in a headless browser
- wait for full page loading before extraction
- extract metadata through selector-based best-effort fallbacks
- normalize extracted strings and derive bookmark slug from title

Current extraction strategy includes:

- title from:
  - page title
  - `head > title`
  - `meta[property="title"]`
  - `meta[property="og:title"]`
- description from:
  - `meta[name="description"]`
  - `meta[property="og:description"]`
  - body/article text fallbacks
  - special-case social/tweet content selectors
- author from:
  - `meta[name="author"]`
  - article author attributes
  - common author selectors
  - social/tweet author selectors
- published date from:
  - `meta[property="article:published_time"]`
  - article `time[datetime]`
  - generic `[datetime]` selectors
  - text/date parsing fallback when needed
- thumbnail from:
  - `og:image`
  - image metadata fallbacks
  - `twitter:image`
  - article image fallback

Recommended library stack for parity with current implementation:

- `puppeteer` for URL metadata scraping
- `cheerio` for HTML bookmark file parsing
- native parsing/normalization helpers for cleanup and slug generation

Reason for keeping this strategy now:

- it is already more or less working in the current project
- it supports richer extraction than plain static HTML parsing alone
- it reduces migration risk by preserving proven behavior in the rebuild

Near-future improvements can still be explored later, but the new project should begin with the same functional scraping approach.

## 10. Data Model Requirements

## User

- id
- name
- email
- emailVerified
- image or avatarUrl
- auth provider data as needed by Better Auth
- createdAt
- updatedAt

## Bookmark

- id
- userId
- url
- slug
- title
- description optional
- author optional
- thumbnail optional
- publishedAt optional
- state (`active` or `archived`)
- favorite indicator
- createdAt
- updatedAt

## Label

- id
- userId
- name
- color optional
- createdAt
- updatedAt

## BookmarkLabel

- id
- bookmarkId
- labelId
- createdAt
- updatedAt

## Rules

- All bookmarks belong to one user.
- All labels belong to one user.
- Deleting a user should cascade cleanly.
- Same user may intentionally save same URL more than once unless product later decides otherwise.
- Label names must be unique per user.

## 11. TanStack Start Application Requirements

## Routing

- Public routes for auth entry points
- Protected routes for bookmark application areas
- Route structure should support:
  - library view
  - bookmark detail view
  - label-driven filtering
  - settings/account later

## Server Functions

Server functions should own:

- bookmark creation
- bookmark update
- bookmark delete
- bookmark listing queries
- bookmark detail queries
- label CRUD
- import workflows
- export workflows
- metadata scraping orchestration

## Security

- Server functions must validate authenticated user context.
- User-scoped access must be enforced in all data operations.
- Validation must run on all server inputs.

## 12. UX Requirements

## MVP UX Expectations

- Fast login flow
- Clear empty states for new users
- Quick add-bookmark workflow
- Useful feedback for scrape success/failure
- Clear confirmation or undo pattern for destructive actions where appropriate
- Responsive layout for desktop and mobile
- Keyboard-accessible interactions

## 13. Non-Functional Requirements

## Accessibility

- WCAG AA baseline
- keyboard navigation support
- visible focus states
- semantic landmarks and labels
- sufficient color contrast

## Performance

- Normal personal libraries should feel responsive in listing, filtering, and search
- Scraping must not freeze UI interaction
- Heavy import operations should provide progress or at least clear status feedback

## Reliability

- Import failures must report invalid entries clearly
- Scraping failures must degrade gracefully
- Export output must be trustworthy as a backup mechanism

## Maintainability

- strict TypeScript
- consistent feature boundaries
- test coverage for critical flows
- simple deployment story

## Delivery Quality

- GitHub Actions must run lint, typecheck, test, and build gates

## 14. MVP Scope

MVP includes:

- Better Auth login and session handling
- bookmark list
- bookmark detail
- add bookmark by URL
- edit bookmark
- delete bookmark
- favorite/unfavorite
- archive/unarchive
- label CRUD
- label filtering
- search and sort
- import from HTML, text, and Omnivore
- export/backup baseline
- metadata scraping during bookmark creation
- responsive accessible UI

## 15. Post-MVP Scope

- browser extension
- mobile share flow
- AI label suggestion
- internationalization
- advanced analytics
- collaboration features
- optional headless-browser scraping fallback if real-world metadata quality demands it

## 16. Success Criteria

The rebuild is successful when:

- a new user can log in and start saving bookmarks immediately
- bookmark CRUD works end-to-end through TanStack Start server functions
- imported bookmarks can be added from all required supported formats
- URL metadata enrichment works for common websites with graceful failure handling
- users can reliably organize bookmarks with labels, favorites, and archive state
- search and sort make retrieval fast enough for everyday use
- CI quality gates pass consistently in GitHub Actions

## 17. Recommended Delivery Order

1. App foundation: TanStack Start, auth, database, theming, CI
2. Bookmark core CRUD via server functions
3. Metadata scraping flow for add-by-URL
4. Labels, favorites, archived state, and collections
5. Search, sort, and bookmark detail UX
6. Import/export workflows
7. Hardening, observability, and performance tuning
