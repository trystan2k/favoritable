# ADR-015: CSS Modules for Component Styling

**Date**: 2025-09-21  
**Status**: Accepted  
**Deciders**: Development Team  

## Context

The favoritable project requires a component styling solution that meets the following requirements:
- **Scoping**: Style encapsulation to prevent CSS conflicts in a component-based React architecture
- **Maintainability**: Co-location of styles with components for better organization
- **Type Safety**: TypeScript integration for style imports and class name validation
- **Performance**: Optimal bundle size with tree-shaking and minification
- **Developer Experience**: Simple workflow without complex build configuration
- **Design System Integration**: Seamless integration with Style Dictionary design tokens

The project tech stack includes:
- React 18+ with TypeScript
- Rsbuild for bundling and build optimization
- Style Dictionary for design token management
- Component-driven architecture
- Monorepo structure with separate frontend package

We need to select a styling approach that provides style encapsulation while maintaining simplicity and performance.

## Decision

### Component Styling: CSS Modules

**Choice**: [CSS Modules](https://github.com/css-modules/css-modules) with co-located `.module.css` files

**Rationale**:
- **Automatic Scoping**: CSS Modules provide automatic class name scoping, eliminating style conflicts between components
- **Co-location**: Styles are placed alongside components (`Component.tsx` + `Component.module.css`) for better maintainability
- **TypeScript Integration**: Automatic generation of type definitions for imported styles provides compile-time safety
- **Performance**: Build-time processing with optimal class name minification in production
- **Design Token Compatibility**: Native CSS custom properties work seamlessly with Style Dictionary tokens
- **Zero Runtime Overhead**: All processing happens at build time, no runtime JavaScript required
- **Standard CSS**: Familiar CSS syntax with full feature support

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Component.tsx │◄──►│ Component.module │◄──►│ Design Tokens   │
│                 │    │      .css        │    │ (Style Dict)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Type-safe     │    │   Scoped CSS     │    │   CSS Variables │
│   Imports       │    │   Classes        │    │   (Tokens)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation Strategy

### Phase 1: Core Setup
1. Configure CSS Modules in Rsbuild with TypeScript support
2. Set up file naming convention (`Component.tsx` → `Component.module.css`)
3. Create TypeScript module declarations for `.module.css` imports

### Phase 2: Design Token Integration
1. Configure Style Dictionary to generate CSS custom properties
2. Establish mandatory usage of design tokens in all CSS Module files
3. Document token categories and usage patterns

### Phase 3: Component Migration
1. Create CSS Module files for existing components
2. Import and apply scoped styles in component files
3. Update tests to work with CSS Module class names

## Considered Alternatives

### Styling Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **CSS Modules** | Zero runtime, TypeScript integration, automatic scoping, familiar CSS syntax | Requires build configuration, additional import statements | ✅ **Selected** |
| **Tailwind CSS** | Utility-first, rapid development, consistent spacing | Large bundle size, vendor lock-in, limited design system flexibility | ❌ Conflicts with existing Style Dictionary system |
| **Panda CSS** | Zero runtime, atomic CSS, TypeScript-first | Additional build complexity, learning curve, overkill for project size | ❌ Unnecessary complexity for current needs |
| **Styled Components** | CSS-in-JS, dynamic styling, component-centric | Runtime overhead, bundle size impact, additional dependency | ❌ Performance concerns and complexity |

## Benefits

1. **Automatic Scoping**: Eliminates CSS conflicts with zero configuration required
2. **Performance**: Build-time processing with no runtime JavaScript overhead
3. **Type Safety**: TypeScript integration provides compile-time validation of style imports
4. **Maintainability**: Co-located styles improve code organization and developer experience
5. **Design System Integration**: Native CSS custom properties work seamlessly with Style Dictionary
6. **Familiar Syntax**: Standard CSS without learning new syntax or paradigms
7. **Build Integration**: Works out-of-the-box with Rsbuild and existing toolchain

## Risk Assessment and Mitigations

### Risk: CSS Module class name conflicts in large codebases
- **Mitigation**: Rsbuild's CSS Modules configuration includes content-based hashing for unique class names
- **Fallback**: Manual class name prefixing if conflicts occur

### Risk: Developer learning curve for CSS Module imports
- **Mitigation**: Clear documentation and consistent naming patterns (`styles` import alias)
- **Fallback**: TypeScript IntelliSense provides auto-completion for available classes

### Risk: Build system dependency for style processing
- **Mitigation**: CSS Modules are a mature, widely-supported standard in React ecosystem
- **Fallback**: Can fall back to regular CSS with manual BEM naming if needed

## Performance Comparison Data

| Metric | CSS Modules | Tailwind CSS | Panda CSS | Styled Components |
|--------|-------------|--------------|-----------|-------------------|
| **Runtime JS** | 0 KB | 0 KB | 0 KB | ~15 KB |
| **Bundle Impact** | Minimal | ~50-100 KB | Variable | ~30 KB |
| **Build Time** | Fast | Fast | Medium | Medium |
| **Tree Shaking** | Excellent | Good | Excellent | Limited |

*Based on typical React application benchmarks*

## References

- [CSS Modules Specification](https://github.com/css-modules/css-modules)
- [Rsbuild CSS Modules Guide](https://rsbuild.dev/guide/basic/css-modules)
- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)
- [TypeScript CSS Modules Support](https://www.typescriptlang.org/docs/handbook/modules.html)

---

**Next Steps**: CSS Modules implementation is already complete and active in the frontend application