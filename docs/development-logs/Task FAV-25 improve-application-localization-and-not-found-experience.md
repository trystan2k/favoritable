---
title: FAV-25 Improve Application Localization and Not-Found Experience
type: development-log
permalink: docs/development-logs/task-FAV-25-improve-application-localization-and-not-found-experience
---

# Development Log: FAV-25

## Metadata

- Task ID: FAV-25 (epic)
- Date (UTC): 2026-06-14T12:00:00Z
- Project: favoritable
- Branch: feature/FAV-25-improve-application-localization-and-not-found-experience
- Commit: uncommitted (working-tree changes, pending final commit)

## Objective

Deliver the FAV-25 epic: app-wide internationalization (FAV-27) with canonical locale persistence and a shell-aware localized 404 experience (FAV-26), without locale segments in URLs and without changing existing known route behavior.

Epic decomposed into two child issues, delivered sequentially (FAV-27 first, FAV-26 second):

- **FAV-27**: Shared i18n runtime (typed locale contract, TS translation resources, `LocaleProvider` mirroring the theme runtime), Better Auth canonical `locale` persistence, first-login locale seeding via short-lived hint cookie, signed-out + signed-in language switching, and a full visible-copy translation sweep.
- **FAV-26**: Shared localized `NotFoundContent` component built from `docs/design/favoritable.pen`, two thin wrappers (public standalone + protected shell-wrapped), root-level `notFoundComponent` selection driven by optional session context.

A canonical plan was authored at `docs/plan/Plan FAV-25 Improve application localization and not-found experience.md` covering task analysis, chosen approach, implementation steps, and validation.

## Implementation Summary

### Planning & Architecture

- Approved plan at `docs/plan/Plan FAV-25 ...md`: 11-step implementation sequence, locale precedence `localStorage -> browser mapping -> en`, server-canonical locale inside Better Auth user data (no parallel table), root optional-session context for auth-aware 404, no URL locale routing.
- Chose to mirror existing `ThemeProvider` + bootstrap-script pattern instead of URL locale routing or a separate cookie-first localization architecture.

### FAV-27 — Internationalization & Canonical Locale Persistence

#### Shared i18n runtime (`src/shared/i18n/`)

- `locale.ts`: canonical locale type `Locale = 'en' | 'pt-BR' | 'es'`, `isLocale`/`normalizeLocale` validators, `mapBrowserLanguageToLocale` base-language mapping (`pt-* -> pt-BR`, `es-* -> es`, `en-* -> en`, else `en`), localStorage helpers (`favoritable-locale` key), document `<html lang>` apply, locale-hint cookie helpers (`favoritable-locale-hint`, 10-min max-age, `SameSite=Lax`), `getLocaleHintFromCookieHeader` parser, and an inline `localeBootstrapScript` mirroring the theme bootstrap to set `<html lang>` before hydration with a `data-locale-locked` short-circuit for authenticated SSR.
- `i18n.ts`: `createI18nInstance(locale)` using `i18next` `createInstance` + `initReactI18next`, English fallback, `supportedLngs`, `load: 'currentOnly'`, `initAsync: false`, `returnNull: false`.
- `LocaleProvider.tsx`: React context over `I18nextProvider`; resolves initial locale from normalized server locale (authenticated) or `resolveClientLocale`; syncs `<html lang>` + localStorage + i18n language on change; authenticated path overrides stale client cache with server locale and clears hint cookie; optimistic signed-in updates via `updateBrowserUserLocale` with `confirmedLocaleRef` + request-id race guard + rollback to last confirmed locale + non-blocking localized error flag; exposes `locale`, `setLocale`, `isUpdatingLocale`, `localeUpdateError`, `clearLocaleUpdateError`.
- `resources/en.ts`, `resources/es.ts`, `resources/pt-BR.ts`: all current visible user-facing copy translated across `appShell`, `auth` (hero, panel, footer, providers), `home`, `notFound`, `profileMenu`, `theme`, `common`, `locale.names`. English is fallback; interpolation placeholders used for `{{year}}`, `{{callbackPath}}`, `{{identity}}`.
- `components/LanguageSwitcher.tsx` + `.module.css`: reusable Base UI `@base-ui/react/select`-backed selector, `align`/`className`/`disabled` props, `onLocaleChange` callback, localized label + option names, indicator. Reused on both login and profile surfaces.

#### Auth persistence & seeding (`src/features/auth/`)

- `server/auth.server.ts`: added `user.additionalFields.locale` (`string`, `input: true`, `required: false`, `returned: true`); `databaseHooks.user.create.before` seeds locale via `resolveCanonicalLocale(request, candidate)` (candidate -> hint cookie -> `en` fallback); `databaseHooks.user.update.before` validates locale and throws `APIError('BAD_REQUEST')` on unsupported values; `repairSessionLocale()` self-heals missing/invalid server locale on read by calling `updateUser`, returning a typed `AuthSessionWithLocale`. `getServerAuthSession` now returns locale-enriched session.
- `lib/auth-client.ts`: `inferAdditionalFields` plugin with `locale` field schema for typed session/user locale access on client; `updateBrowserUserLocale(locale)` isolated helper that POSTs `/update-user` directly (Better Auth inferred-additional-field input typing does not currently flow into `authClient.updateUser` for `locale`), parses mutation payload, returns `{ error } | { error: null }`.
- `lib/auth-defaults.ts`: removed hardcoded English strings (`googleOAuthSetupMessage`, `signOutErrorMessage`) now in translation resources; exported `googleOAuthCallbackPath` for interpolation.
- `lib/auth-providers.ts`: replaced `authProviderCopy` literal map with `authProviderIcons` map only (labels/loading labels moved to i18n resources).

#### Root session & document integration (`src/routes/__root.tsx`)

- Added `beforeLoad` optional session load via `loadOptionalRouteSession()` (wraps `getRouteAuthSession`, catches known session-load error and logs warnings/errors via `appLogger`, returns `null` for signed-out fallback). Root now carries `{ session }` in route context.
- `RootDocument`: emits canonical `<html lang>` (server locale when authenticated, `defaultLocale` otherwise), sets `data-locale-locked` on authenticated SSR to lock bootstrap, injects both theme + locale bootstrap scripts, wraps app in `<LocaleProvider isAuthenticated serverLocale>` composed inside `<ThemeProvider>`.
- Root `notFoundComponent` (see FAV-26).

#### Copy surfaces translated/wired

- `LoginPage.tsx`, `ProviderButton.tsx`, `ProtectedAppShell.tsx`, `ProtectedHomePage.tsx`, `ProfileMenu.tsx`, `ThemeToggle.tsx`: literals replaced with `useTranslation()` `t()` calls; `LanguageSwitcher` added to login (signed-out, localStorage-only) and `ProfileMenu` (signed-in, optimistic + persisted).

#### First-login locale seeding bridge

- `LoginPage` writes `favoritable-locale-hint` cookie at Google sign-in start; Better Auth `user.create.before` hook normalizes and persists it server-side; hint cleared post-auth by `LocaleProvider`. Bridge isolated to auth config so a first-post-auth sync fallback remains possible.

### FAV-26 — Shell-Aware Localized 404

#### Not-found feature (`src/features/not-found/`)

- `components/NotFoundContent.tsx` + `.module.css`: shared localized 404 content — 404 code, localized heading + description (via `t('notFound.*')`), `Link` CTA with `actionHref`/`actionLabel` props, configurable `headingLevel` (`h1` public, `h2` protected). Styling uses design tokens only (no hard-coded colors/spacing/typography), responsive mobile/tablet/desktop, light/dark.
- `views/PublicNotFoundPage.tsx`: standalone full-viewport 404, CTA `Go to login` -> `/login`.
- `views/ProtectedNotFoundPage.tsx`: wraps `NotFoundContent` inside `<ProtectedAppShell>`, CTA `Go home` -> `/`, `headingLevel="h2"`.

#### Root not-found wiring (`src/routes/__root.tsx`)

- `RootNotFoundComponent`: reads root optional-session context; renders `<ProtectedNotFoundPage>` when session exists, `<PublicNotFoundPage>` otherwise. Unknown anonymous paths render standalone 404 without auth redirect; unknown authenticated paths render shell-wrapped 404. Existing routes/guards unchanged.

#### Route guard refactor (`src/features/auth/routes/route-auth.ts`)

- Added `getRouteContextAuthSession(context)` to read root-loaded session from route context. `redirectIfLoggedOut`/`redirectIfLoggedIn` now accept an optional preloaded session, avoiding duplicate session fetches. `_protected.tsx` and `login.tsx` consume root context session when available, falling back to direct fetch.

### Shared logging (`src/shared/logging/`)

- `logger.ts`: Pino-backed `appLogger` (`error`/`warn` with optional context object) for shared application logging. Config strips default base fields, emits browser logs as objects, and stays silent in tests.

### QA / Review Fix Loops & Smoke / E2E Additions

- Unit: `test/shared/i18n/locale.test.ts` (locale validators, browser mapping, cookie parsing, hint helpers); `test/features/auth/server/auth.server.test.ts` (create/update locale hooks, unsupported-locale rejection); `auth-bootstrap.test.ts` + `auth-client.test.ts` (locale field schema, `updateBrowserUserLocale` payload parsing).
- Browser/component: `test/shared/i18n/LocaleProvider.browser.test.tsx` (signed-out localStorage precedence, optimistic authenticated update + rollback, html-lang sync — screenshot-gated); `test/features/not-found/components/NotFoundContent.browser.test.tsx` (localized copy from active locale — screenshot-gated); updated login/provider/theme/shell/profile tests for i18n wiring.
- Route/integration: `test/routes/root-not-found.browser.test.tsx` (protected shell 404 for signed-in, standalone localized 404 for signed-out — screenshot-gated); `test/routes/root.test.ts`; `test/routes/auth-routes.test.tsx` (schema/session locale availability, invalid server-locale fallback).
- E2E smoke (all `@smoke`): `e2e/tests/locale-smoke.spec.ts` (signed-out locale switch persists across reload; authenticated profile locale switch persists across reload); `e2e/tests/not-found-smoke.spec.ts` (unknown public route -> standalone localized 404, CTA `/login`); `e2e/tests/auth/authenticated-not-found-smoke.spec.ts` (unknown authenticated route -> shell-wrapped 404, CTA `/`).
- Test support: `src/test-support/TestI18nProvider.tsx` render helper wrapping `LocaleProvider` for component tests.
- `e2e/utils/routes.ts`: added `unknownPublic` route constant.
- Review/QA loops: browser screenshot fixtures captured for visual regression on `NotFoundContent`, `LocaleProvider`, and root not-found wrappers.

### Final Validation

- `pnpm complete-check` run as the final regression gate (knip, typecheck, lint, format, unit + browser tests, build, E2E smoke). Full localization + 404 coverage green.

## Files Changed

### New — Shared i18n Runtime

- `src/shared/i18n/locale.ts` — Locale type, validators, browser mapping, localStorage + hint-cookie helpers, bootstrap script
- `src/shared/i18n/i18n.ts` — i18next instance factory
- `src/shared/i18n/LocaleProvider.tsx` — Locale context, optimistic signed-in updates, rollback, document sync
- `src/shared/i18n/resources/en.ts` / `es.ts` / `pt-BR.ts` — Translation resources
- `src/shared/i18n/components/LanguageSwitcher.tsx` / `.module.css` — Reusable Base UI locale selector

### New — Not-Found Feature (FAV-26)

- `src/features/not-found/components/NotFoundContent.tsx` / `.module.css` — Shared localized 404 content
- `src/features/not-found/views/PublicNotFoundPage.tsx` — Standalone 404, CTA `/login`
- `src/features/not-found/views/ProtectedNotFoundPage.tsx` — Shell-wrapped 404, CTA `/`

### New — Shared Logging & Test Support

- `src/shared/logging/logger.ts` — `appLogger` (error/warn)
- `src/test-support/TestI18nProvider.tsx` — i18n render helper for component tests

### Modified — Auth Persistence & Locale Seeding

- `src/features/auth/server/auth.server.ts` — `user.locale` additional field, create/update hooks, `repairSessionLocale`, typed locale-enriched session
- `src/features/auth/lib/auth-client.ts` — `inferAdditionalFields` locale schema, `updateBrowserUserLocale` mutation helper
- `src/features/auth/lib/auth-defaults.ts` — Removed hardcoded English strings; exported `googleOAuthCallbackPath`
- `src/features/auth/lib/auth-providers.ts` — `authProviderIcons` map (labels moved to i18n)
- `src/features/auth/routes/route-auth.ts` — `getRouteContextAuthSession`, optional-session params on guards, exported `routeAuthErrorMessage`

### Modified — Root, Routes & Document Integration

- `src/routes/__root.tsx` — Optional session `beforeLoad`, locale bootstrap, `<html lang>` + `data-locale-locked`, `LocaleProvider` wiring, root `notFoundComponent` selection
- `src/routes/_protected.tsx` — Consumes root context session; falls back to guard fetch
- `src/routes/login.tsx` — Consumes root context session

### Modified — Copy Surfaces (i18n wiring)

- `src/features/auth/components/LoginPage.tsx` — `useTranslation`, language switcher (signed-out), hint cookie on sign-in
- `src/features/auth/components/ProviderButton.tsx` — Localized label/loading
- `src/features/app-shell/views/ProtectedAppShell.tsx` — Localized copy, skip-link
- `src/features/app-shell/views/ProtectedHomePage.tsx` — Localized copy
- `src/features/app-shell/components/ProfileMenu.tsx` / `.module.css` — Language switcher (signed-in), localized labels
- `src/shared/theme/ThemeToggle.tsx` — Localized `dark mode` label

### Modified — Schema & Migrations

- `src/db/schema/auth.ts` — `locale` text column on `user`
- `drizzle/0001_strange_medusa.sql` — `ALTER TABLE user ADD locale text`
- `drizzle/meta/_journal.json` / `0001_snapshot.json` — Migration metadata

### Modified — Dependencies & Config

- `package.json` — Added `i18next ~26.3.1`, `react-i18next ~17.0.8`
- `pnpm-lock.yaml` — Lockfile updated

### New — Tests

- `test/shared/i18n/locale.test.ts`
- `test/shared/i18n/LocaleProvider.browser.test.tsx` (+ screenshot fixtures)
- `test/features/not-found/components/NotFoundContent.browser.test.tsx` (+ screenshot fixtures)
- `test/routes/root-not-found.browser.test.tsx` (+ screenshot fixtures)
- `test/routes/root.test.ts`

### New — E2E Smoke

- `e2e/tests/locale-smoke.spec.ts` (@smoke)
- `e2e/tests/not-found-smoke.spec.ts` (@smoke)
- `e2e/tests/auth/authenticated-not-found-smoke.spec.ts` (@smoke)
- `e2e/utils/routes.ts` — `unknownPublic` constant

### Modified — Tests (i18n wiring updates)

- `test/features/auth/components/LoginPage.browser.test.tsx`
- `test/features/auth/components/ProviderButton.browser.test.tsx`
- `test/features/auth/lib/auth-client.test.ts`
- `test/features/auth/server/auth-bootstrap.test.ts`
- `test/features/auth/server/auth.server.test.ts`
- `test/features/app-shell/components/ProfileMenu.browser.test.tsx`
- `test/features/app-shell/views/ProtectedAppShell.browser.test.tsx`
- `test/features/app-shell/views/ProtectedHomePage.browser.test.tsx`
- `test/routes/auth-routes.test.tsx`
- `test/shared/theme/ThemeToggle.browser.test.tsx`

### Documentation

- `docs/plan/Plan FAV-25 Improve application localization and not-found experience.md` — Canonical approved plan

## Key Decisions

1. **Mirror theme runtime, not URL routing**: Locale resolved via localStorage + browser mapping + bootstrap script, canonical value on Better Auth user. Avoids locale-in-URL complexity and anonymous-SSR-locale-blindness workarounds.

2. **Server-canonical locale inside Better Auth user data**: `user.additionalFields.locale` is the single signed-in source of truth. No parallel preferences table, no custom locale API.

3. **First-login locale seeding via short-lived hint cookie**: `favoritable-locale-hint` (10-min max-age) bridges client locale to server during social auth. Bridge isolated to auth config so a first-post-auth sync fallback remains possible if OAuth callback timing proves brittle.

4. **Root optional session context (single load)**: Root `beforeLoad` loads session once; `_protected`/`login` guards and root 404 selection all consume it via `getRouteContextAuthSession`. Eliminates duplicate session fetches and enables auth-aware 404 without changing route structure.

5. **Optimistic signed-in locale update with rollback**: `LocaleProvider` updates UI immediately, persists via `updateBrowserUserLocale`, rolls back to last confirmed locale with a non-blocking localized error on failure. Request-id guard prevents race conditions.

6. **Auth config as schema source of truth**: `user.additionalFields.locale` drives Drizzle schema; migration regenerated from it rather than hand-maintained divergent definitions.

7. **`updateBrowserUserLocale` isolated direct POST**: Better Auth inferred-additional-field input typing does not currently flow into `authClient.updateUser` for `locale`. Kept contract isolated in `auth-client.ts` until upstream client typing owns it.

8. **Shared `NotFoundContent` + two thin wrappers**: One localized component, public (`h1`, CTA `/login`) and protected (`h2`, CTA `/`) wrappers. Design tokens only; no hard-coded styling.

9. **`data-locale-locked` bootstrap short-circuit**: Authenticated SSR emits canonical `<html lang>` and locks the bootstrap script to prevent client override flash; anonymous SSR stays English-safe and corrects post-hydration.

10. **Pino-backed shared logger**: `appLogger` fronts Pino for shared application logging, keeps browser output structured, strips default base fields, and stays silent in tests.

## Validation Performed

- **Unit tests**: locale validators/browser-mapping/cookie parsing; auth server create/update locale hooks, unsupported-locale rejection, bootstrap seeding; auth-client locale schema + mutation payload parsing.
- **Browser/component tests**: `LocaleProvider` signed-out localStorage precedence, optimistic authenticated update + rollback, `<html lang>` sync; `NotFoundContent` localized copy; updated login/provider/theme/shell/profile tests. Screenshot fixtures captured for visual regression.
- **Route/integration tests**: root not-found renders protected shell 404 for signed-in and standalone localized 404 for signed-out; schema/session locale availability; invalid server-locale fallback.
- **E2E smoke (@smoke)**: signed-out locale switch persists across reload; authenticated profile locale switch persists across reload; unknown public route -> standalone localized 404 (CTA `/login`); unknown authenticated route -> shell-wrapped 404 (CTA `/`).
- **Final regression gate**: `pnpm complete-check` (knip, typecheck, lint, format, unit + browser tests, build, E2E smoke) green.
- **Manual QA**: locale switching on login + profile; `<html lang>` updates; reload persistence (localStorage signed-out, Better Auth user signed-in); 404 renders standalone vs shell-wrapped by auth state; CTA targets correct.

## Risks and Follow-ups

- **Anonymous SSR cannot know browser/localStorage locale**: Bootstrap script + provider correct client state as early as possible; anonymous first paint is English-safe by design. Acceptable per plan.
- **OAuth callback timing for hint cookie**: First-login seeding bridge is isolated to auth config. If brittle, fall back to a first-post-auth sync without reworking the locale architecture.
- **Better Auth inferred-additional-field client typing gap**: `updateBrowserUserLocale` uses direct POST until upstream client typing flows `locale` into `authClient.updateUser`. Revisit on better-auth upgrade.
- **Logger surface intentionally minimal**: `appLogger` currently exposes only `warn`/`error` on top of Pino because current localization/not-found flow only needs failure-path logging. Expand only if broader log levels become necessary.
- **`user.locale` self-heal read path**: `repairSessionLocale` writes on read when locale missing/invalid. Monitor for write-amplification if locale hints arrive stale repeatedly.
- **Translation completeness**: Only `en`/`es`/`pt-BR` ship now. Adding locales requires updating `supportedLocales`, resource files, browser mapping, and bootstrap script in lockstep.
- **404 design-token drift**: Styling must stay token-only. Future 404 tweaks should map to existing token variables before any hard-coded values.
- **No automated structural-lint enforcement of feature-sliced boundaries**: Architecture skill defines rules but no guard rails yet (carried over from FAV-1).
