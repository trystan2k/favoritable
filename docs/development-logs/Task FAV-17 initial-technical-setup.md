---
title: FAV-17 Initial Technical Setup
type: development-log
permalink: docs/development-logs/task-FAV-17-initial-technical-setup
---

# Development Log: FAV-17

## Metadata

- Task ID: FAV-17
- Date (UTC): 2026-06-10T12:00:00Z
- Project: favoritable
- Branch: feature/FAV-17-initial-technical-setup
- Commit: e8b4371

## Objective

- Establish foundational technical infrastructure for the Favoritable bookmark manager: Playwright e2e smoke tests, Style Dictionary design-token pipeline derived from Pencil design source, shared dev-server config, Vitest/Cloudflare plugin workaround, and QA contract scripts.

## Implementation Summary

### FAV-18 — Playwright Smoke Test Setup

- Installed `@playwright/test` v1.60.0 as dev dependency.
- Created `e2e/` directory structure: `tests/`, `fixtures/`, `utils/`.
- Implemented smoke test contract: home route renders app shell (title matches `/favoritable/i`, visible h1, URL ends with `/`).
- Configured `playwright.config.ts` with `testDir: './e2e/tests'`, Chromium + WebKit projects, HTML + JSON reporters, screenshot on failure, trace on first retry, video on failure.
- Playwright webServer runs `pnpm preview:e2e` (Vite preview on port 4173) for deterministic test runs.
- Added npm scripts: `test:e2e`, `test:e2e:smoke` (grep `@smoke`), `test:e2e:setup` (install Chromium + WebKit with deps).

### FAV-19 — Style Dictionary Pipeline

- Installed `style-dictionary` v5.4.4 as dev dependency.
- Created `style-dictionary.config.mjs` with dual-theme build (light + dark).
- Light theme: `:root` selector, `outputReferences: true` for var() chaining.
- Dark theme: `:root[data-theme="dark"]` selector, raw values (no var references for dark overrides).
- Custom `dedupeThemeOverrides()` strips tokens from dark that are identical in light.
- Custom `stripGeneratedBanner()` removes Style Dictionary auto-comment.
- Output: `design-tokens/dist/variables.css` (316 lines, auto-generated).
- Added `tokens:build` npm script. `predev`, `prebuild`, `pretest` hooks auto-run token build.

### FAV-20 — Pencil-Derived Token Creation

- Source of truth: `docs/design/favoritable.pen` (Pencil design file).
- Manually extracted all design tokens into structured JSON under `design-tokens/`.
- Base tokens (7 files): color, typography, spacing, layout, border, shadow, radius.
- Semantic tokens: global (layout), light (color + component), dark (color + component).
- Token categories: palette colors, background, text, border, accent, state, status, gradient, component-specific (card, chip, banner, install, auth, provider).
- Full light + dark theme support via `data-theme="dark"` attribute.
- `src/styles.css` imports generated tokens via `@import url('../design-tokens/dist/variables.css')` and applies root-level styles using tokens.

### Vitest/Cloudflare Plugin Workaround

- `vite.config.ts` detects Vitest mode (`mode === 'test' || process.env.VITEST === 'true'`).
- When `isVitest` is true, `cloudflare()` plugin is excluded from plugins array.
- Prevents Cloudflare Workers runtime conflict with jsdom test environment.
- Vitest config inline in vite.config.ts: `environment: 'jsdom'`, `include: ['src/**/*.{test,spec}.{ts,tsx}']`.

### Shared Dev-Server Config

- `dev-server.config.ts` exports `devServerHost`, `devServerPort`, `devServerOrigin`.
- Used by both `vite.config.ts` (server + preview) and `playwright.config.ts` (baseURL + webServer url).
- Ensures consistent `localhost:4000` across Vite dev server and Playwright e2e runs.
- `strictPort: true` prevents silent port remapping.

### QA Contract and Script Arrangement

- `complete-check` script: typecheck → lint:fix → format → test → build (sequential).
- `postcomplete-check` hook: runs `test:e2e:smoke` after complete-check passes.
- Linting: oxlint (JS/TS) + stylelint (CSS) with separate scripts.
- Formatting: oxfmt with check mode.
- Stylelint configured for CSS Modules: ignores `composes`, allows CSS Module pseudo-classes (`:export`, `:global`, `:import`, `:local`), nullifies `selector-class-pattern`.

## Files Changed

### Playwright E2E (FAV-18)

- `playwright.config.ts` (Playwright config with shared dev-server)
- `e2e/fixtures/test.ts` (re-exports test + expect from @playwright/test)
- `e2e/utils/routes.ts` (app route constants)
- `e2e/tests/smoke.spec.ts` (smoke test: home route app shell contract)

### Style Dictionary Pipeline (FAV-19)

- `style-dictionary.config.mjs` (dual-theme build, dedupe, banner strip)
- `design-tokens/dist/variables.css` (auto-generated CSS custom properties)

### Design Tokens (FAV-20)

- `design-tokens/base/color.tokens.json` (palette + brand + overlay colors)
- `design-tokens/base/typography.tokens.json` (font families, sizes, weights, line-height, letter-spacing)
- `design-tokens/base/spacing.tokens.json` (space scale 025–300)
- `design-tokens/base/layout.tokens.json` (viewport breakpoints, shell/panel dimensions)
- `design-tokens/base/border.tokens.json` (border widths)
- `design-tokens/base/shadow.tokens.json` (elevation + backdrop blur)
- `design-tokens/base/radius.tokens.json` (border radius scale sm–full)
- `design-tokens/semantic/global/layout.tokens.json` (global layout tokens)
- `design-tokens/semantic/light/color.tokens.json` (light theme semantic colors)
- `design-tokens/semantic/light/component.tokens.json` (light theme component tokens)
- `design-tokens/semantic/dark/color.tokens.json` (dark theme semantic colors)
- `design-tokens/semantic/dark/component.tokens.json` (dark theme component tokens)

### Shared Infrastructure

- `dev-server.config.ts` (shared host/port/origin for Vite + Playwright)
- `vite.config.ts` (Vitest/Cloudflare conditional plugin, inline test config)
- `src/styles.css` (imports generated tokens, applies root styles)
- `.stylelintrc.json` (CSS Modules-compatible stylelint config)
- `package.json` (scripts, dependencies, devDependencies)
- `docs/design/favoritable.pen` (Pencil design source of truth)

## Key Decisions

1. **Playwright `e2e/` structure over `tests/e2e/`**: Keeps e2e tests isolated from unit tests (`src/`), avoids Vitest path conflicts, clearer separation.

2. **Token source of truth = Pencil file**: `docs/design/favoritable.pen` is the single source of truth. All tokens manually extracted from Pencil into JSON. Changes start in Pencil, propagate to JSON, then through Style Dictionary to CSS.

3. **Style Dictionary dual-theme build**: Light uses `outputReferences: true` (CSS var chaining). Dark uses raw hex values (no var references) to avoid circular dependency issues. `dedupeThemeOverrides()` prevents duplicate declarations.

4. **Generated CSS path `design-tokens/dist/variables.css`**: Imported by `src/styles.css` via `@import url()`. `dist/` is the build artifact; `base/` + `semantic/` are source. Build step required before dev/build/test.

5. **Vitest/Cloudflare conditional plugin**: Cloudflare Workers plugin incompatible with jsdom test env. `isVitest` flag conditionally excludes `cloudflare()` from plugin array during tests.

6. **Shared dev-server config**: Single `dev-server.config.ts` shared between Vite and Playwright. Prevents port mismatch between dev server and e2e test runner. `strictPort: true` ensures no silent fallback.

7. **QA contract via `complete-check` + `postcomplete-check`**: Full validation pipeline (typecheck → lint → format → test → build → e2e smoke). Post-hook ensures e2e runs only after full suite passes.

## Validation Performed

- `pnpm tokens:build` — generates `design-tokens/dist/variables.css` successfully.
- `pnpm test` — Vitest unit tests pass (jsdom environment, no Cloudflare plugin).
- `pnpm test:e2e:smoke` — Playwright smoke test validates home route app shell contract.
- `pnpm lint` — oxlint + stylelint pass with no errors.
- `pnpm format:check` — oxfmt formatting verified.
- `pnpm typecheck` — TypeScript strict mode passes.
- `pnpm build` — Vite production build succeeds.
- `pnpm complete-check` — full sequential pipeline passes.
- `postcomplete-check` — e2e smoke runs after complete-check.

## Risks and Follow-ups

- **Token drift risk**: Manual extraction from Pencil to JSON. If Pencil design changes, tokens must be re-extracted manually. No automated sync pipeline yet.
- **Cloudflare plugin workaround fragility**: `isVitest` flag relies on mode/env detection. If Vitest changes mode string convention, workaround breaks.
- **Single browser e2e**: Playwright config only includes Chromium. Firefox/WebKit projects not yet configured.
- **No dark theme runtime toggle**: CSS supports dark theme via `data-theme="dark"` attribute, but no UI toggle implemented yet.
- **Stylelint ignores dist/ and coverage/**: Generated CSS is not linted by design. If generated output has issues, fix is in Style Dictionary config or token JSON sources.
