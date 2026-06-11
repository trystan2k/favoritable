## Task Analysis

- Main objective: Establish foundation for FAV-17 by adding minimal Playwright smoke coverage, a Style Dictionary CSS-variables pipeline, and initial light/dark design tokens sourced from `docs/design/favoritable.pen`.
- Identified dependencies:
  - FAV-18 is independent and should land first because it only needs the current starter route and Vite dev server on port `4000`.
  - FAV-19 defines the token build pipeline and must land before FAV-20.
  - FAV-20 depends on `docs/design/favoritable.pen`, `src/styles.css`, and the generated output path `design-tokens/dist/variables.css`.
- System impact:
  - `package.json` changes for new scripts and dev dependencies; new `playwright.config.ts`, `e2e/` tree, `style-dictionary.config.mjs`, `design-tokens/` source files, and `src/styles.css` import wiring.
  - `.gitignore` already ignores `dist`, so generated token CSS should be treated as a build artifact and auto-produced before app/dev builds instead of manually committed.
  - Risks/assumptions: no GitHub Actions workflow is required in this epic; “CI-ready” means headless, scriptable commands. Pen variables already cover many colors/radius/space/text sizes, but typography families/weights/line-heights plus gradients and shadow recipes still need extraction from design nodes.

## Chosen Approach

- Proposed solution:
  - Use a thin Playwright baseline: one shared fixture export, one route utility, and one smoke spec against the current public `/` route.
  - Use a root `style-dictionary.config.mjs` that reads layered token source files under `design-tokens/` and emits a single CSS variables file with light `:root` values and dark-theme overrides.
  - Model tokens in two layers: foundation scale tokens first, then semantic/component tokens mapped from the Pencil design so later CSS Modules and Base UI components consume only generated CSS custom properties.
- Justification for simplicity:
  - Reuses the current starter page and existing Vite port `4000`, so the smoke test adds confidence without waiting for auth-shell work.
  - Keeps one token pipeline and one generated CSS entrypoint, avoiding extra preprocessors, multiple output formats, or component-specific generators.
  - Uses the approved directory layout and only the minimum automation required to prevent missing generated CSS; if built-in Style Dictionary theming proves insufficient, register one custom format in the same config instead of adding a second build step or tool.
- Components to be modified/created:
  - `package.json`
  - `playwright.config.ts`
  - `e2e/fixtures/*`, `e2e/tests/*`, `e2e/utils/*`
  - `style-dictionary.config.mjs`
  - `design-tokens/**/*`
  - `src/styles.css`
  - `docs/plan/Plan FAV-17 Initial technical setup.md` (plan artifact)

## Implementation Steps

1. FAV-18 — Add Playwright dev dependency and scripts in `package.json` (`e2e`, optional `e2e:headed` or `e2e:ui` only if they help local smoke debugging) without touching `complete-check` or Vitest coverage rules.
2. FAV-18 — Create `playwright.config.ts` aligned to current Vite server settings: test dir `e2e/tests`, base URL `http://127.0.0.1:4000`, `webServer` command based on the repo’s dev script, headless/trace-friendly defaults, and `reuseExistingServer` enabled outside CI.
3. FAV-18 — Create the approved E2E structure with minimal future-proofing: `e2e/fixtures/test.ts` exports shared `test`/`expect`, `e2e/utils/routes.ts` or equivalent holds stable path helpers, and `e2e/tests/smoke.spec.ts` verifies the current public starter route renders expected content. Mitigation: keep smoke assertions route-level only so later auth-shell work can swap internals with minimal test churn.
4. FAV-19 — Add `style-dictionary` dependency and create root `style-dictionary.config.mjs` that reads token source files from `design-tokens/` and writes CSS custom properties to `design-tokens/dist/variables.css`.
5. FAV-19 — Define a minimal source structure under `design-tokens/` that matches the approved creation order and future scale, with separate files or folders for `base` and `semantic` tokens plus room for component token namespaces, but no extra platforms or output targets.
6. FAV-19 — Wire token generation into developer workflows by adding `tokens:build` plus automatic invocation before app start/build (`predev` and `prebuild`, or equivalent single-entry automation) so the imported CSS file always exists even though `design-tokens/dist` is ignored by git. Mitigation: keep the output as a generated artifact; do not change ignore rules unless a later team decision explicitly wants committed generated CSS.
7. FAV-20 — Audit `docs/design/favoritable.pen` before authoring tokens: lift existing foundation values already present in variables (colors, spacing, radius, font sizes) and capture missing typography, border, shadow, and gradient details from design nodes, especially `Inter`, the weight set, line-height usage, surface gradients, and shadow recipes.
8. FAV-20 — Author foundation tokens first: raw palette, background/surface primitives, spacing scale, radius scale, border widths/colors, typography primitives (family, size, weight, line-height), and shadow primitives. Normalize numeric tokens to CSS-friendly units consistent with project standards (`rem` where practical, `px` only when fixed sizing is required by design).
9. FAV-20 — Author semantic and component-level tokens second: app background/text/surface/border/state tokens for light/dark themes plus component namespaces already evidenced in the design (`card`, `chip`, `banner`, selection/accent states, gradient surfaces). Keep naming aligned with generated CSS variable usage rather than ad-hoc screen-specific names.
10. FAV-20 — Generate `design-tokens/dist/variables.css`, import it at the top of `src/styles.css`, and keep `src/styles.css` focused on global resets/base selectors so tokens remain the source of truth rather than duplicated literal values.
11. Epic verification — Run `pnpm tokens:build`, `pnpm e2e`, and `pnpm complete-check`; inspect generated CSS for both `:root` and dark-theme overrides, and confirm no step introduced unrelated styling architecture or CI scope creep. Rollback note: if themed single-file generation becomes unstable, fall back to one custom Style Dictionary format in the same config instead of adding another build tool or changing epic scope.

## Validation

- Success criteria:
  - FAV-18: Playwright smoke test runs locally against the TanStack Start app and leaves a clean extension path for future CI/auth coverage.
  - FAV-19: Style Dictionary builds successfully from `design-tokens/` and emits CSS variables to `design-tokens/dist/variables.css`.
  - FAV-20: Generated CSS contains foundation plus semantic/component tokens for light and dark themes, `src/styles.css` imports it, and the repo still passes `pnpm complete-check` plus the new token/E2E commands.
- Checkpoints:
  - Pre-implementation: confirm `/` remains the smoke target and token output remains an uncommitted generated artifact because nested `dist` is ignored today.
  - During FAV-18: `pnpm e2e --list` or equivalent recognizes the smoke spec, and the config resolves the existing port `4000` without custom server bootstrapping.
  - During FAV-19/FAV-20: generated CSS includes stable variable names, no missing-file import in `src/styles.css`, and dark-theme overrides appear in a dedicated selector block.
  - Post-implementation/regression: `pnpm e2e`, `pnpm tokens:build`, and `pnpm complete-check` all succeed; future feature work can consume variables from CSS Modules without hard-coded design values.
