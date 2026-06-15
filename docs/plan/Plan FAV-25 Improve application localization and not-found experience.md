## Task Analysis

- Main objective: Deliver FAV-25 by landing FAV-27 first and FAV-26 second: app-wide i18n with canonical locale persistence plus a shell-aware localized 404, without locale segments in URLs and without changing existing known route behavior.
- Identified dependencies:
  - New runtime dependencies: `i18next` and `react-i18next`.
  - Better Auth user additional field + Drizzle migration for canonical `locale` persistence.
  - Root optional session context in `src/routes/__root.tsx` so locale and 404 rendering can make authenticated vs anonymous decisions without disturbing existing route guards.
  - Existing surfaces and design sources already in repo: `src/routes/login.tsx`, `src/routes/_protected.tsx`, `src/routes/_protected/index.tsx`, `src/features/app-shell/views/ProtectedAppShell.tsx`, `src/features/app-shell/components/ProfileMenu.tsx`, `src/shared/theme/**`, and `docs/design/favoritable.pen`.
- System impact:
  - Add a shared i18n runtime under `src/shared/i18n/**`, intentionally mirroring current theme runtime patterns in `src/shared/theme/**`.
  - Auth persistence changes touch `src/features/auth/server/auth.server.ts`, `src/features/auth/lib/auth-client.ts`, `src/db/schema/auth.ts`, and new `drizzle` migration/meta files.
  - Visible-copy translation sweep touches current auth, shell, theme toggle, and new 404 surfaces; tests expand across unit, browser/component, route/integration, and Playwright smoke layers.
  - Key risks: anonymous first SSR request cannot know localStorage/browser locale; first-login locale seeding needs a client-to-server bridge during social auth; Better Auth client typing must stay aligned with the new `user.locale` field.

## Chosen Approach

- Proposed solution:
  - Add one shared i18n runtime centered on typed locale helpers, TS-based translation resources, and a `LocaleProvider` that mirrors the current theme provider/bootstrap model.
  - Store canonical locale on the Better Auth user via `user.additionalFields.locale`, infer that field on the client, and use Better Auth user updates as the only signed-in persistence path.
  - Seed locale for first auth bootstrap with a short-lived locale hint cookie written at Google sign-in start, then normalized and persisted server-side only when the server locale is missing or invalid.
  - Implement FAV-26 with one shared localized `NotFoundContent` component plus two thin wrappers: public standalone and protected shell wrapper. Choose wrapper from root optional-session context so current route structure stays intact.
- Justification for simplicity:
  - Reuses the existing `ThemeProvider` + bootstrap-script pattern instead of adding URL locale routing, cookie-first localization architecture, or a second global state store.
  - Keeps server-canonical locale inside Better Auth user data, avoiding a parallel profile/preferences table or custom API surface for locale persistence.
  - Uses root-level optional session and root-level not-found handling, so current routes remain thin and existing `/login` and protected-home behavior stays stable.
- Components to be modified/created:
  - Dependencies/config:
    - `package.json` — add `i18next` and `react-i18next`.
  - Shared i18n runtime:
    - `src/shared/i18n/locale.ts` — canonical locale type, validation, browser mapping, localStorage helpers, and `html lang` bootstrap/apply logic.
    - `src/shared/i18n/i18n.ts` — i18next init with English fallback and no-URL locale strategy.
    - `src/shared/i18n/LocaleProvider.tsx` — active locale state, server override, optimistic signed-in updates, rollback handling, and document sync.
    - `src/shared/i18n/resources/en.ts`, `src/shared/i18n/resources/pt-BR.ts`, `src/shared/i18n/resources/es.ts` — all current visible user-facing copy translated.
    - `src/shared/i18n/components/LanguageSwitcher.tsx` + `LanguageSwitcher.module.css` — shared Base UI-backed selector reused on login and profile surfaces.
  - Root/auth/persistence:
    - `src/routes/__root.tsx` — optional session load, locale bootstrap script, `html lang`, provider wiring, and root `notFoundComponent`.
    - `src/features/auth/server/auth.server.ts` — `locale` additional field, server normalization, and auth-bootstrap seeding hook.
    - `src/features/auth/lib/auth-client.ts` — Better Auth client additional-field inference and typed session/user locale access.
    - `src/db/schema/auth.ts` + `drizzle/*` migration/meta — persisted `user.locale` column.
  - Current copy surfaces to translate/wire:
    - `src/features/auth/components/LoginPage.tsx` + `LoginPage.module.css`
    - `src/features/auth/components/ProviderButton.tsx`
    - `src/features/auth/lib/auth-defaults.ts`
    - `src/features/auth/lib/auth-providers.ts`
    - `src/features/app-shell/views/ProtectedAppShell.tsx`
    - `src/features/app-shell/components/ProfileMenu.tsx` + `ProfileMenu.module.css`
    - `src/features/app-shell/views/ProtectedHomePage.tsx`
    - `src/shared/theme/ThemeToggle.tsx`
  - 404 feature:
    - `src/features/not-found/components/NotFoundContent.tsx` + `NotFoundContent.module.css`
    - `src/features/not-found/views/PublicNotFoundPage.tsx`
    - `src/features/not-found/views/ProtectedNotFoundPage.tsx`
  - Tests/helpers:
    - `test/shared/i18n/locale.test.ts`
    - `test/shared/i18n/LocaleProvider.browser.test.tsx`
    - `test/shared/i18n/TestI18nProvider.tsx` or equivalent render helper
    - updates/new tests under `test/features/auth/**`, `test/features/app-shell/**`, `test/routes/**`, and `test/router.test.ts`
    - updates/new smoke coverage under `e2e/tests/**`

## Implementation Steps

1. FAV-27 — Add i18n dependencies and establish the locale contract in `src/shared/i18n/locale.ts`: supported locales `en | pt-BR | es`, strict validators, browser base-language mapping (`pt-* -> pt-BR`, `es-* -> es`, `en-* -> en`, else `en`), localStorage key, safe English fallback rules, and an inline bootstrap helper for `html lang`. Pre-implementation checkpoint: lock this behavior down with unit tests before any UI wiring.
2. FAV-27 — Extend Better Auth to own canonical locale: add `user.additionalFields.locale` in `src/features/auth/server/auth.server.ts`, update/generate `src/db/schema/auth.ts`, create the Drizzle migration under `drizzle/`, and update auth bootstrap/migration tests. Mitigation: treat auth config as schema source of truth and regenerate from it, instead of hand-maintaining divergent auth/schema definitions.
3. FAV-27 — Add first-login locale seeding: when `LoginPage` starts Google sign-in, write a short-lived locale hint cookie from the resolved client locale; in Better Auth server hooks, normalize that value, seed user locale only when the current server locale is missing or invalid, and clear the hint after use. Risk note: OAuth callback timing can be tricky; keep this bridge isolated to auth config so fallback to a first-post-auth sync is possible without reworking the rest of the locale architecture.
4. FAV-27 — Create `src/shared/i18n/i18n.ts` and `LocaleProvider.tsx` to mirror the existing theme runtime: initialize `react-i18next`, sync `html lang`, resolve signed-out locale from `localStorage -> browser mapping -> en`, and immediately override stale client cache with normalized server locale once a signed-in session is known. Mitigation: because anonymous SSR cannot know browser/localStorage locale without URL or cookie state, keep SSR fallback English-safe and use bootstrap + provider initialization to correct client state as early as possible.
5. FAV-27 — Wire root session and document integration in `src/routes/__root.tsx`: add optional auth session `beforeLoad`, pass initial locale/session context into `LocaleProvider`, preserve `ThemeProvider` composition, and use the same root context later for auth-aware 404 selection. Checkpoint: authenticated SSR should emit canonical `html lang`; anonymous requests should remain stable with English fallback and no locale path changes.
6. FAV-27 — Translate all current visible user-facing copy and add signed-out locale switching: move literals from login/auth/provider/shell/theme surfaces into TS translation resources, add the shared language switcher to `LoginPage`, persist signed-out changes to localStorage only, and keep user-facing provider/auth error messages localized with English fallback interpolation where needed.
7. FAV-27 — Add signed-in locale switching in the protected shell: reuse the shared language switcher in `ProfileMenu`, update UI optimistically through `LocaleProvider`, persist immediately with Better Auth user update, rollback to the last confirmed server locale on failure, and show a non-blocking localized error without disrupting the rest of the shell. Mitigation: if Better Auth session hooks do not reflect the updated locale quickly enough, refetch session in the provider instead of adding a second persistence endpoint.
8. FAV-27 — Expand localization verification: update browser/component tests for login, provider buttons, theme toggle label, profile menu, protected shell, and locale provider behavior; add route/auth tests for schema/session locale availability and invalid server-locale fallback; add at least one Playwright smoke path that proves locale persistence across reload for anonymous or authenticated flow.
9. FAV-26 — Build the shared 404 feature from `docs/design/favoritable.pen`: implement `NotFoundContent` plus CSS Module using existing design tokens and Pencil’s mobile/tablet/desktop light/dark guidance, then add two thin wrappers—public standalone and protected shell wrapper—with localized heading/body/CTA copy. Risk note: 404 styling can drift from design if convenience wins; mitigation is to map only existing token variables first and avoid hard-coded colors, spacing, or typography.
10. FAV-26 — Wire shell-aware not-found behavior without changing URL structure: use the root optional-session context in `src/routes/__root.tsx` to choose the public or protected wrapper, point signed-out CTA to `/login`, point signed-in CTA to the current protected home `/`, and keep existing known routes and guards unchanged. Checkpoint: unknown anonymous path must not redirect into auth-guard flow, and unknown authenticated path must render inside `ProtectedAppShell`.
11. FAV-26 — Add 404 coverage at all layers: component tests for shared content and wrappers, route/integration tests for auth-aware wrapper selection, and Playwright smoke coverage for unknown public and authenticated routes. Final regression gate: run `pnpm complete-check`. Rollback note: if dedicated smoke specs prove unstable, fold the assertions into the existing smoke files first and split later only after stability is proven.

## Validation

- Success criteria:
  - FAV-27: app resolves locale with precedence `localStorage -> browser mapping -> en` before auth, persists canonical locale on the Better Auth user after auth, updates `<html lang>`, translates all current visible user-facing copy, and falls back to English on missing keys or invalid stored/server locales.
  - FAV-27: login switcher remains localStorage-only before auth; protected switcher updates optimistically, persists immediately, and rolls back with non-blocking localized error if save fails.
  - FAV-26: unknown public routes show a localized standalone 404; unknown authenticated routes show the same localized content inside `ProtectedAppShell`; CTA targets are `/login` and `/` respectively; current known routes keep current behavior.
  - Repo passes `pnpm complete-check` unchanged.
- Checkpoints:
  - Pre-implementation assumptions check: confirm Better Auth client additional-field inference and user-update API cover all signed-in persistence needs; confirm `docs/design/favoritable.pen` remains the 404 source of truth; confirm no locale-in-URL work is introduced.
  - During Steps 1-3: unit tests prove locale normalization/fallback behavior; migration/bootstrap tests prove `user.locale` exists; first-auth bootstrap seeds missing locale from resolved client value only.
  - During Steps 4-7: anonymous reload keeps chosen login locale; authenticated session immediately overrides stale localStorage; failed signed-in locale save restores the prior confirmed locale and leaves the app usable.
  - During Steps 9-10: unknown anonymous path renders standalone 404 without auth redirect; unknown authenticated path renders shell-wrapped 404 with protected CTA; Pencil-based 404 styling consumes design tokens only.
  - Post-implementation regression: unit, browser/component, route/integration, and Playwright coverage for i18n + 404 are green, and `pnpm complete-check` passes.
