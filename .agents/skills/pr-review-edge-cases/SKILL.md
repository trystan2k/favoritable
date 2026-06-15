---
name: pr-review-edge-cases
description: Reviews code changes for subtle correctness, async, SSR, accessibility, test-isolation, and docs-vs-implementation issues that often slip past normal review and are later caught by automated reviewers. Use when reviewing code, implementation diffs, test changes, auth/session code, i18n code, reusable UI, or browser tests.
---

# PR Review Edge Cases

Use this after the normal correctness pass. Goal: catch subtle issues before automated reviewers do.

## Review order

1. **API shape parity**
   - Check tests, mocks, wrappers, adapters, and helper callers match the real function signature exactly.
   - Watch for drift like `fn(arg)` vs `fn({ arg })`.
   - Check that renamed params or changed return shapes were updated everywhere.

2. **`undefined` vs `null` semantics**
   - Verify callers and helpers distinguish:
     - `undefined` = unknown / omitted / load it
     - `null` = known empty / signed-out / absent
   - Flag code that collapses both into one path if behavior differs.

3. **Async stale-state / race bugs**
   - In optimistic updates or rollback paths, check whether failure logic uses stale captured state after `await`.
   - Prefer reading current confirmed state at failure time.
   - Watch for concurrent requests overwriting each other.

4. **Render purity / SSR safety**
   - No `localStorage`, `document`, cookie, or DOM mutation during render.
   - Browser state seeding should happen in bootstrap code or `useEffect`, not render bodies.
   - Shared singleton state used by SSR should be request-safe.

5. **Test determinism**
   - Browser tests must not depend on runner locale, timezone, navigator, cookies, or persistent storage unless explicitly pinned.
   - Test helpers should seed deterministic defaults.
   - Mocks/stubs/globals must be cleaned in `afterEach`.

6. **Accessibility edge cases**
   - Check for duplicate hard-coded IDs in reusable components.
   - Prefer instance-safe IDs (`useId`) when component can render multiple times.
   - `aria-labelledby` should reference the correct semantic element.
   - Avoid duplicate landmarks or nested labeling that confuses screen readers.

7. **Error-handling resilience**
   - Side-effect repair or logging paths should not break primary user flow unless intentional.
   - Failures in telemetry, repair, cache sync, or background updates should usually degrade gracefully.
   - Logs should include enough context to debug the triggering value/state.

8. **Docs / implementation parity**
   - PR description, dev logs, docs, and comments must match actual implementation.
   - Flag when docs describe a planned implementation instead of current behavior.

## High-signal questions

- Did any helper contract change without all mocks/tests/callers changing too?
- Is this code depending on `undefined` vs `null`, and is that distinction preserved?
- Can a failure path roll back to stale state?
- Does this render path mutate browser state?
- Will this test pass on a non-English or non-default runner?
- Are globals, spies, and stubbed browser APIs restored after each test?
- Can this reusable UI create duplicate IDs or duplicate landmarks?
- Does a background failure incorrectly break the primary flow?
- Do docs and PR text still describe old behavior?

## Risk labels to use in review

Name the problem class directly:
- API drift
- undefined/null semantics bug
- stale rollback race
- render-time side effect
- locale/timezone-dependent test flake
- duplicate-id a11y bug
- duplicate landmark / label bug
- graceful-degradation bug
- docs/implementation mismatch

## Output guidance

For each finding, state:
1. what breaks
2. why it breaks
3. smallest safe fix

Prefer precise, low-noise comments over broad style feedback.
