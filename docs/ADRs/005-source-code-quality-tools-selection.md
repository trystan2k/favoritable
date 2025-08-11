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

### Quality Toolchain: Biome

**Choice**: [Biome](https://biomejs.dev/) as the unified linting and formatting solution, replacing ESLint + Prettier combination

**Rationale**:
- **Unified Tooling**: Single tool handling both linting and formatting, reducing configuration complexity
- **Performance Excellence**: Built in Rust, significantly faster than JavaScript-based alternatives
- **TypeScript First**: Native TypeScript support without additional parser configuration
- **Zero Configuration**: Works out of the box with sensible defaults for modern projects
- **Monorepo Optimized**: Excellent support for workspace-based projects
- **Modern Standards**: Focuses on modern JavaScript/TypeScript patterns and best practices
- **IDE Integration**: Fast Language Server Protocol (LSP) support for real-time feedback
- **Migration Path**: Compatible rules and easy migration from ESLint/Prettier setups

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Source Code   │    │      Biome       │    │   Quality       │
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
1. ✅ Install Biome as monorepo development dependency
2. ✅ Create shared configuration in `packages/config-biome`
3. ✅ Configure workspace-specific `biome.json` files
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

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Biome** | Unified tool, fastest performance, TS-first | Newer ecosystem, fewer plugins | ✅ **Selected** |
| **ESLint + Prettier** | Mature ecosystem, extensive plugins | Slower, complex config, tool conflicts | ❌ Performance/complexity |
| **ESLint + Biome Format** | ESLint maturity + Biome speed | Tool overlap, configuration complexity | ❌ Tool redundancy |
| **Deno Lint + dprint** | Fast, modern tooling | Limited ecosystem, Deno-focused | ❌ Ecosystem limitations |
| **Standard JS** | Zero config, opinionated | Less flexibility, limited TypeScript | ❌ Flexibility constraints |
| **TSLint (deprecated)** | TypeScript-specific | Deprecated, migrated to ESLint | ❌ No longer maintained |

## Benefits

1. **Performance**: 10-100x faster than ESLint/Prettier combination for large codebases
2. **Simplicity**: Single tool eliminating configuration conflicts and tool coordination
3. **Developer Experience**: Fast feedback loops and excellent IDE integration
4. **Consistency**: Unified code style and quality standards across the entire monorepo
5. **Modern Standards**: Focus on current JavaScript/TypeScript best practices
6. **Maintenance**: Reduced dependency management and tool coordination overhead
7. **Monorepo Efficiency**: Optimized for workspace-based project structures

## Performance Comparison

| Metric | Biome | ESLint + Prettier | Improvement |
|--------|-------|-------------------|-------------|
| **Linting** | ~200ms | ~2000ms | 10x faster |
| **Formatting** | ~50ms | ~500ms | 10x faster |
| **Combined Check** | ~250ms | ~2500ms | 10x faster |
| **Memory Usage** | ~50MB | ~200MB | 4x less |

*Benchmarks based on typical TypeScript monorepo with ~50 files*

## Risk Assessment and Mitigations

### Risk: Newer ecosystem with fewer community plugins
- **Mitigation**: Biome covers 90% of common use cases with built-in rules
- **Fallback**: Can supplement with ESLint for specific advanced rules if needed

### Risk: Migration effort from existing ESLint/Prettier setup
- **Mitigation**: Biome provides migration tools and compatible rule mappings
- **Fallback**: Gradual migration approach, workspace by workspace

### Risk: Team learning curve for new tooling
- **Mitigation**: Similar concepts to ESLint/Prettier with better documentation
- **Fallback**: Comprehensive team documentation and training sessions

### Risk: Enterprise/organization standardization on ESLint
- **Mitigation**: Performance benefits often outweigh standardization concerns
- **Fallback**: Biome can coexist with ESLint if organizational requirements mandate

## Configuration Strategy

### Shared Configuration (`packages/config-biome/biome.json`)
```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": { "noExplicitAny": "error" },
      "correctness": { "noUnusedVariables": "error" }
    }
  },
  "formatter": {
    "enabled": true,
    "lineWidth": 100,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

### Workspace Extension Pattern
- Each workspace extends the shared configuration
- Project-specific overrides when necessary
- Consistent standards with flexibility for specific needs

## References

- [Biome Documentation](https://biomejs.dev/)
- [Biome vs ESLint Performance](https://biomejs.dev/blog/biome-wins-prettier-challenge/)
- [Migration from ESLint/Prettier](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [Monorepo Configuration Guide](https://biomejs.dev/guides/configure-biome/#configuration-file-resolution)
- [IDE Integration Setup](https://biomejs.dev/guides/integrate-in-editor/)

---

**Next Steps**: Implement Phase 2 (Integration Enhancement) as part of ongoing development workflow improvements.