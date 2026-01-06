# Testing Guide

This document provides comprehensive information about running tests and test coverage in this project.

## Running Tests

### Run All Tests

To run the entire test suite:

```bash
pnpm test
```

This will run Vitest in watch mode, which automatically re-runs tests when files change. This is useful during development.

### Run Tests Once (CI Mode)

To run tests once and exit (useful for CI/CD pipelines):

```bash
pnpm vitest run
```

### Run Tests with Coverage

To run tests and generate coverage reports:

```bash
pnpm test:coverage
```

This command will:
- Execute all tests once
- Generate coverage reports in multiple formats
- Enforce minimum coverage thresholds (80%)
- Exit with an error if coverage is below thresholds

## Understanding Coverage Reports

After running `pnpm test:coverage`, coverage reports are generated in the `coverage/` directory.

### Console Output

The command displays a coverage summary directly in the terminal, showing:
- **% Stmts** (Statements): Percentage of code statements executed
- **% Branch**: Percentage of conditional branches tested
- **% Funcs** (Functions): Percentage of functions called
- **% Lines**: Percentage of code lines executed
- **Uncovered Line #s**: Specific line numbers not covered by tests

Example output:
```
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |     100 |      100 |     100 |     100 |                   
 hooks           |     100 |      100 |     100 |     100 |                   
  useProfiles.ts |     100 |      100 |     100 |     100 |                   
-----------------|---------|----------|---------|---------|-------------------
```

### HTML Report

For a detailed, line-by-line coverage view:

1. Run `pnpm test:coverage`
2. Open `coverage/index.html` in your web browser
3. Navigate through files to see:
   - Highlighted code showing covered (green) and uncovered (red) lines
   - Detailed branch coverage information
   - Function execution counts

### LCOV Report

The `coverage/lcov.info` file is generated for CI/CD integration with services like:
- Codecov
- Coveralls
- SonarQube
- GitHub Actions code coverage badges

## Coverage Thresholds

This project enforces minimum coverage thresholds to maintain code quality:

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

If coverage drops below these thresholds, the `test:coverage` command will fail with an error message indicating which metric failed.

## Best Practices

1. **Run coverage locally** before pushing code to ensure you meet the minimum thresholds
2. **Aim for meaningful tests** rather than just hitting coverage numbers
3. **Review the HTML report** to identify untested code paths
4. **Focus on branch coverage** to ensure all conditional logic is tested
5. **Keep coverage high** by writing tests alongside new features

## Complete QA Workflow

The `pnpm run complete-check` script runs all quality checks in sequence:

```bash
pnpm run complete-check
```

This executes:
1. **Linting** - `pnpm lint` (Biome)
2. **Type checking** - `pnpm typecheck` (TypeScript & Astro)
3. **Unit/Integration tests** - `pnpm test:coverage` (Vitest with coverage)
4. **Build** - `pnpm build` (Production build)

All must pass for the workflow to succeed. This same workflow runs in CI before each PR is merged.
