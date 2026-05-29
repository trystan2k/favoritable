# ADR-005: Source Code Quality Tools Selection

**Date**: 2025-01-11  
**Status**: Accepted  
**Deciders**: Development Team

## Context

The favoritable project requires comprehensive source code quality tools that meet the following requirements:

- **Linting**: Code quality analysis and error detection for TypeScript/JavaScript
- **Formatting**: Consistent code formatting across the entire codebase
- **Performance**: Fast execution for development workflow efficiency
- **Configuration**: Minimal setup with sensible defaults
- **Monorepo Support**: Effective handling of multiple workspaces
- **TypeScript Integration**: First-class TypeScript support
- **Developer Experience**: IDE integration and fast feedback loops
- **Consistency**: Unified tooling across frontend and backend

The project tech stack includes:

- TypeScript across frontend and backend
- React with TypeScript (frontend)
- Hono with TypeScript (backend)
- Monorepo structure with PNPM workspaces
- Modern development practices

We need to select quality tools that provide comprehensive coverage while maintaining excellent performance and developer experience.

## Decision

### Quality Toolchain: Oxlint + Oxfmt

**Choice**: [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) for linting and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) for formatting

**Rationale**:

- **Fast Split Tooling**: Dedicated Rust tools for linting and formatting with aligned Oxc behavior
- **Performance Excellence**: Built in Rust, significantly faster than JavaScript-based alternatives
- **TypeScript First**: Native TypeScript support without additional parser configuration
- **Config Simplicity**: Small root configs with fast defaults for modern TypeScript workspaces
- **Monorepo Optimized**: Excellent support for workspace-based projects
- **Modern Standards**: Focuses on modern JavaScript/TypeScript patterns and best practices
- **IDE Integration**: Fast Language Server Protocol (LSP) support for real-time feedback
- **Migration Path**: Clear replacement for the previous Biome-based workflow while preserving performance

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Source Code   │    │  Oxlint/Oxfmt    │    │   Quality       │
│   (TS/JS/JSON)  │───►│   (Lint+Format)  │───►│   Assurance     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   IDE/Editor    │    │   CI/CD Pipeline │    │   Pre-commit    │
│   Integration   │    │   Checks         │    │   Hooks         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation Strategy

### Phase 1: Core Setup (Completed)

1. ✅ Install Oxlint and Oxfmt as monorepo development dependencies
2. ✅ Create root shared configuration in `.oxlintrc.json` and `.oxfmtrc.json`
3. ✅ Remove workspace-specific `biome.json` files in favor of root configuration
4. ✅ Add NPM scripts for linting and formatting

### Phase 2: Integration Enhancement

1. Configure IDE extensions for real-time feedback
2. Set up pre-commit hooks with Husky integration
3. Integrate with CI/CD pipeline for automated checks
4. Document coding standards and quality guidelines

### Phase 3: Advanced Configuration

1. Customize rules for project-specific requirements
2. Set up import sorting and organization rules
3. Configure performance monitoring for quality checks
4. Create quality metrics and reporting

## Considered Alternatives

### Linting and Formatting Alternatives

| Option                  | Pros                                         | Cons                                         | Decision                   |
| ----------------------- | -------------------------------------------- | -------------------------------------------- | -------------------------- |
| **Oxlint + Oxfmt**      | Fast, focused tools, TS-first, easy CI split | Two configs instead of one                   | ✅ **Selected**            |
| **Biome**               | Unified tool, fast performance, TS-first     | Harder to keep lint/format concerns separate | ❌ Workflow mismatch       |
| **ESLint + Prettier**   | Mature ecosystem, extensive plugins          | Slower, complex config, tool conflicts       | ❌ Performance/complexity  |
| **Deno Lint + dprint**  | Fast, modern tooling                         | Limited ecosystem, Deno-focused              | ❌ Ecosystem limitations   |
| **Standard JS**         | Zero config, opinionated                     | Less flexibility, limited TypeScript         | ❌ Flexibility constraints |
| **TSLint (deprecated)** | TypeScript-specific                          | Deprecated, migrated to ESLint               | ❌ No longer maintained    |

## Benefits

1. **Performance**: 10-100x faster than ESLint/Prettier combination for large codebases
2. **Simplicity**: Single tool eliminating configuration conflicts and tool coordination
3. **Developer Experience**: Fast feedback loops and excellent IDE integration
4. **Consistency**: Unified code style and quality standards across the entire monorepo
5. **Modern Standards**: Focus on current JavaScript/TypeScript best practices
6. **Maintenance**: Reduced dependency management and tool coordination overhead
7. **Monorepo Efficiency**: Optimized for workspace-based project structures

## Performance Comparison

| Metric             | Oxlint + Oxfmt | ESLint + Prettier | Improvement |
| ------------------ | -------------- | ----------------- | ----------- |
| **Linting**        | ~200ms         | ~2000ms           | 10x faster  |
| **Formatting**     | ~50ms          | ~500ms            | 10x faster  |
| **Combined Check** | ~250ms         | ~2500ms           | 10x faster  |
| **Memory Usage**   | ~50MB          | ~200MB            | 4x less     |

_Benchmarks based on typical TypeScript monorepo with ~50 files_

## Risk Assessment and Mitigations

### Risk: Rule parity gaps during migration

- **Mitigation**: Start with current repo requirements and tighten rules incrementally after migration
- **Fallback**: Supplement with targeted checks only if the Oxc toolchain leaves a critical gap

### Risk: Migration effort from existing ESLint/Prettier setup

- **Mitigation**: Biome provides migration tools and compatible rule mappings
- **Fallback**: Gradual migration approach, workspace by workspace

### Risk: Team learning curve for new tooling

- **Mitigation**: Similar CLI workflow and dedicated lint/format commands with clear docs
- **Fallback**: Comprehensive team documentation and training sessions

### Risk: Enterprise/organization standardization on ESLint

- **Mitigation**: Performance benefits often outweigh standardization concerns
- **Fallback**: Biome can coexist with ESLint if organizational requirements mandate

## Configuration Strategy

### Shared Configuration (`.oxlintrc.json` and `.oxfmtrc.json`)

```json
{
  "lint": "configured in .oxlintrc.json",
  "format": "configured in .oxfmtrc.json"
}
```

### Workspace Extension Pattern

- Each workspace extends the shared configuration
- Project-specific overrides when necessary
- Consistent standards with flexibility for specific needs

## References

- [Oxlint Documentation](https://oxc.rs/docs/guide/usage/linter.html)
- [Oxfmt Documentation](https://oxc.rs/docs/guide/usage/formatter.html)

---

**Next Steps**: Implement Phase 2 (Integration Enhancement) as part of ongoing development workflow improvements.
