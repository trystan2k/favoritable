# ADR-013: Git Hooks Setup for Code Quality Automation

**Date**: 2025-01-12  
**Status**: Proposed  
**Deciders**: Development Team  

## Context

The favoritable project requires automated code quality checks to ensure consistent code style, prevent common errors, and maintain high code quality standards throughout the development process. The project needs:

- **Automated Code Quality**: Consistent formatting, linting, and type checking
- **Pre-commit Validation**: Catch issues before they enter the repository
- **Performance**: Fast execution focusing only on changed files
- **Safety**: Only apply safe fixes automatically, require manual review for risky changes
- **Team Consistency**: Ensure all developers follow the same quality standards
- **Test Safety**: Prevent broken code from being pushed to remote

The project tech stack includes:
- TypeScript for type safety
- Biome for linting, formatting, and code quality
- Vitest for testing
- pnpm for package management
- Turbo for monorepo orchestration

The project already has Biome configured with comprehensive rules and a `complete-check` script for full quality validation. We need to implement git hooks that automatically enforce code quality at commit and push time while maintaining developer productivity.

## Decision

### Git Hooks Strategy: Husky with lint-staged Integration

**Choice**: [Husky](https://typicode.github.io/husky/) with [lint-staged](https://github.com/lint-staged/lint-staged) for pre-commit quality checks and test execution on pre-push.

**Rationale**:
- **Monorepo Optimization**: lint-staged provides better workspace integration for pnpm monorepos
- **Selective Processing**: Advanced file filtering and task execution for different file types
- **Safety First**: Only safe fixes applied automatically, unsafe changes require manual review
- **Performance**: Processes only staged files, significantly faster than full project checks
- **Type Safety**: TypeScript checking ensures type errors are caught before commit
- **Team Consistency**: Husky ensures all team members get identical git hooks
- **Test Safety**: Pre-push tests prevent broken code from reaching remote repository
- **Mature Solution**: Well-established tool with extensive documentation and community support

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Developer     │    │   Git Hooks      │    │   Remote Repo   │
│   commits       │───►│   (Husky)        │───►│                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Staged Files   │    │  Pre-commit:     │    │  Pre-push:      │
│  (Changed)      │    │  - lint-staged   │    │  - Run tests    │
│                 │    │  - TypeScript    │    │  - Validate     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation Strategy

### Phase 1: Dependency Installation
1. Install Husky and lint-staged as development dependencies
2. Add prepare script to package.json for automatic setup
3. Initialize Husky in project

### Phase 2: Pre-commit Hook Setup
1. Create pre-commit hook with lint-staged for selective file processing
2. Configure lint-staged for TypeScript/React files with Biome integration
3. Include TypeScript checking for type safety
4. Configure safe-only fixes to require manual review of risky changes

### Phase 3: Pre-push Hook Setup
1. Create pre-push hook that runs test suite
2. Ensure tests pass before allowing push to remote
3. Validate implementation with team workflow

## Considered Alternatives

### Git Hooks Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Husky + lint-staged** | Mature solution, excellent monorepo support, advanced file filtering | Additional dependency | ✅ **Selected** |
| **Husky + Biome --staged** | Native Biome integration, minimal deps | Limited monorepo workspace integration | ❌ Insufficient workspace support |
| **Pure Git Hooks** | No dependencies, simple setup | Not shared across team, manual setup for each developer | ❌ Team consistency issues |
| **GitHub Actions only** | No local setup needed | Slow feedback, allows bad code in commits | ❌ Poor developer experience |

### Pre-commit Scope Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Staged files only** | Fast, focused on changes | May miss context issues | ✅ **Selected** |
| **Full project check** | Comprehensive validation | Slow, processes unchanged files | ❌ Performance impact |
| **Modified files** | Faster than full project | May include unstaged changes | ❌ Inconsistent behavior |

## Benefits

1. **Developer Experience**: Fast, focused checks that don't interrupt workflow
2. **Code Quality**: Automatic formatting, linting, and type checking before commits
3. **Team Consistency**: Standardized quality checks across all team members
4. **Safety**: Only safe fixes applied automatically, manual review for risky changes
5. **Performance**: Staged-only processing significantly faster than full project checks
6. **Early Detection**: Catches issues before they enter repository history
7. **Test Safety**: Prevents broken code from being pushed to shared branches

## Risk Assessment and Mitigations

### Risk: Slow pre-commit checks affecting developer productivity
- **Mitigation**: Use `--staged` flag to process only changed files
- **Fallback**: Allow `--no-verify` flag for emergency commits, followed by immediate cleanup

### Risk: Type checking failures blocking urgent commits
- **Mitigation**: Include clear error messages and quick resolution guidance
- **Fallback**: Emergency bypass with `--no-verify`, requiring immediate fix

### Risk: Test failures blocking pushes in CI/CD scenarios
- **Mitigation**: Ensure tests are fast and reliable, focus on unit tests
- **Fallback**: Skip hooks in CI with `--no-verify` if absolutely necessary

## Configuration Details

### Pre-commit Hook Commands
```bash
# Type checking for early error detection
pnpm typecheck

# lint-staged execution for selective file processing
pnpm exec lint-staged
```

### Pre-push Hook Commands
```bash
# Run test suite with coverage to ensure code quality
pnpm test:coverage
```

### lint-staged Configuration
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json}": [
      "biome check --write"
    ]
  }
}
```

### Key Features
- **Selective Processing**: Only staged files are processed for optimal performance
- **Safe Fixes**: Only safe fixes applied automatically via `--write` flag
- **Workspace Integration**: Proper handling of pnpm monorepo structure
- **Type Safety**: TypeScript checking runs on all staged changes

## References

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
- [Biome CLI Reference](https://biomejs.dev/reference/cli/)
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

---

**Next Steps**: Install Husky and lint-staged, configure hooks, and test with team development workflow
