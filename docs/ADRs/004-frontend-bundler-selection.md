# ADR-004: Frontend Bundler Selection

**Date**: 2025-01-11  
**Status**: Accepted  
**Deciders**: Development Team  

## Context

The favoritable frontend application requires a modern, fast, and reliable build tool that meets the following requirements:
- **Development Performance**: Fast development server with reliable hot module replacement (HMR)
- **Build Performance**: Efficient production builds with optimizations
- **TypeScript Support**: Out-of-the-box TypeScript compilation and type checking
- **CSS Modules**: Native support for CSS modules (our chosen styling approach)
- **React Integration**: Modern React support with JSX transform
- **Bundle Optimization**: Tree shaking, code splitting, and production optimizations
- **Developer Experience**: Minimal configuration with sensible defaults
- **Ecosystem**: Plugin support for extensibility

The project tech stack includes:
- React with TypeScript
- CSS modules for styling
- Radix UI for components
- Modern development workflow
- Monorepo structure with PNPM

We need to select a build tool that prioritizes performance while providing excellent developer experience.

## Decision

### Build Tool: Rsbuild

**Choice**: [Rsbuild](https://rsbuild.dev/) as the primary build tool and bundler for the frontend application

**Rationale**:
- **Performance Excellence**: Built on Rspack (Rust-based), providing significantly faster build times than JavaScript-based alternatives
- **Zero Configuration**: Works out of the box with TypeScript and CSS modules without complex setup
- **CSS Modules Native**: Perfect integration with CSS modules, supporting our styling architecture
- **Modern Defaults**: Sensible configuration for modern React applications with minimal setup
- **Development Experience**: Fast HMR and development server for excellent productivity
- **Production Optimized**: Automatic code splitting, tree shaking, and bundle optimizations
- **Future-Proof**: Based on Rust tooling, representing the future direction of frontend build tools
- **Maintained Actively**: ByteDance team support with regular updates and improvements

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Source Code   │    │     Rsbuild      │    │   Production    │
│   (TS + CSS)    │───►│   (Rspack Core)  │───►│    Bundle       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dev Server    │    │   CSS Modules    │    │   Optimizations │
│   (Fast HMR)    │    │   Processing     │    │   (Tree Shake)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation Strategy

### Phase 1: Project Initialization
1. Initialize React project with Rsbuild template
2. Configure TypeScript integration and type checking
3. Set up CSS modules configuration
4. Configure development and production scripts

### Phase 2: Development Workflow
1. Integrate with existing monorepo structure
2. Configure Vitest to work with Rsbuild build pipeline
3. Set up build optimization and bundle analysis
4. Document build configuration and processes

### Phase 3: Production Setup
1. Configure production build optimizations
2. Set up deployment integration
3. Implement build performance monitoring
4. Create build troubleshooting documentation

## Considered Alternatives

### Build Tool Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Rsbuild** | Fastest builds, zero-config, CSS modules | Smaller ecosystem | ✅ **Selected** |
| **Vite** | Popular, good dev server, large ecosystem | Dev/prod differences, slower builds | ❌ Build performance |
| **Webpack** | Mature, extensive plugins, proven | Slow builds, complex config | ❌ Performance issues |
| **Turbopack** | Very fast, Vercel backing | Alpha/beta, Next.js only | ❌ Not production ready |
| **Parcel** | Zero-config, good performance | Less control, smaller ecosystem | ❌ Limited customization |
| **esbuild** | Extremely fast | Limited features, build-only | ❌ Missing dev server |

## Benefits

1. **Build Performance**: Significantly faster builds for both development and production
2. **Developer Productivity**: Fast HMR and development server reduce feedback loops
3. **Zero Configuration**: Minimal setup required for TypeScript and CSS modules
4. **Bundle Efficiency**: Automatic optimizations with modern bundling techniques
5. **Future-Proof**: Rust-based tooling representing industry direction
6. **CSS Modules Integration**: Native support aligns with our styling approach
7. **Production Ready**: Stable and battle-tested in production environments

## Risks and Mitigations

### Risk: Smaller ecosystem compared to Vite/Webpack
- **Mitigation**: Rsbuild provides most needed features out of the box
- **Fallback**: Can migrate to Vite if specific plugins become critical

### Risk: Team learning curve for Rspack/Rsbuild
- **Mitigation**: Excellent documentation and similar concepts to Webpack
- **Fallback**: Configuration patterns are transferable to other bundlers

### Risk: Plugin availability for advanced features
- **Mitigation**: Most common needs covered by built-in features
- **Fallback**: Rsbuild supports custom Rspack plugins when needed

### Risk: Community support and resources
- **Mitigation**: Growing community with ByteDance backing
- **Fallback**: Well-documented migration path to Vite if needed

## Performance Comparison

| Metric | Rsbuild | Vite | Webpack |
|--------|---------|------|---------|
| **Cold Start** | ~2s | ~3s | ~8s |
| **HMR Speed** | <100ms | ~200ms | ~800ms |
| **Production Build** | ~15s | ~25s | ~45s |
| **Bundle Size** | Optimized | Good | Good |

*Approximate benchmarks based on typical React TypeScript projects*

## References

- [Rsbuild Documentation](https://rsbuild.dev/)
- [Rspack Documentation](https://rspack.dev/)
- [CSS Modules with Rsbuild](https://rsbuild.dev/guide/basic/css-modules)
- [React Plugin for Rsbuild](https://rsbuild.dev/plugins/list/plugin-react)
- [Performance Benchmarks](https://rsbuild.dev/guide/start/migration-from-vite)

---

**Next Steps**: Implement Phase 1 (Project Initialization) as part of Task 2 (Initialize Frontend Project).