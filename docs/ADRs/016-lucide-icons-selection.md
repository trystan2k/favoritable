# ADR-016: Lucide Icons for UI Components

**Date**: 2025-09-21  
**Status**: Accepted  
**Deciders**: Development Team  

## Context

The favoritable project requires an icon library that meets the following requirements:
- **Consistency**: Clean, uniform design language across all icons
- **Performance**: Lightweight bundle size with tree-shaking support
- **Customization**: Easy styling with CSS custom properties and design tokens
- **React Integration**: Native React components with TypeScript support
- **Accessibility**: Proper ARIA attributes and semantic SVG structure
- **Scalability**: Vector-based icons that work at any size
- **Community**: Active maintenance and regular updates

The project tech stack includes:
- React 18+ with TypeScript
- CSS Modules with design token integration
- Rsbuild for bundling with tree-shaking optimization
- Style Dictionary for consistent design system
- Theme-aware components with light/dark mode support

We need to select an icon library that provides high-quality, consistent icons while maintaining optimal bundle size and seamless integration with our design system.

## Decision

### Icon Library: Lucide Icons

**Choice**: [Lucide Icons](https://lucide.dev/) via `lucide-react` package

**Rationale**:
- **Design Consistency**: All 1636+ icons follow strict design rules with consistent stroke width, style, and readability
- **Lightweight**: Individual icon imports with excellent tree-shaking, zero unused icons in bundle
- **React-First**: Native React components with proper TypeScript definitions and props
- **Customization**: Full control over size, color, stroke-width, and other SVG properties via props
- **Design Token Compatibility**: SVG properties work seamlessly with CSS custom properties from Style Dictionary
- **Active Maintenance**: Regular updates and active community on GitHub and Discord
- **ISC License**: Permissive open-source license suitable for commercial projects

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Component.tsx │◄──►│   Lucide Icon    │◄──►│ Design Tokens   │
│                 │    │   (React SVG)    │    │ (CSS Variables) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Tree-shaken   │    │   Customizable   │    │   Theme-aware   │
│   Bundle        │    │   Props          │    │   Colors        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation Strategy

### Phase 1: Core Integration
1. Install `lucide-react` package with specific version pinning
2. Configure TypeScript definitions for icon components
3. Establish consistent import patterns across components

### Phase 2: Icon Usage Standards
1. Define standard props for consistent icon appearance (size, strokeWidth)
2. Create reusable icon wrapper components if needed
3. Document icon naming conventions and selection guidelines

### Phase 3: Theme Integration
1. Integrate icon colors with CSS custom properties
2. Ensure proper contrast ratios in both light and dark themes
3. Test icon visibility across all theme variants

## Considered Alternatives

### Icon Library Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Lucide Icons** | Consistent design, React-native, tree-shakable, active community | Smaller icon count vs some alternatives | ✅ **Selected** |
| **React Icons** | Massive icon collection (20+ libraries), battle-tested, comprehensive | Inconsistent styles across sets, larger bundle potential | ❌ Style inconsistency conflicts with design system |
| **Heroicons** | Tailwind ecosystem, well-designed, MIT license | Limited icon count (~460), Tailwind-centric design | ❌ Too limited for comprehensive application needs |
| **Phosphor Icons** | Large collection (~6000), multiple weights, good React support | Heavier bundle, less community activity | ❌ Bundle size concerns for tree-shaking efficiency |
| **Ant Design Icons** | Comprehensive set, enterprise-ready, good documentation | Tied to Ant Design aesthetic, heavier bundle | ❌ Design language mismatch with custom design system |

## Benefits

1. **Design Coherence**: Consistent stroke width and style across all icons ensures visual harmony
2. **Bundle Optimization**: Tree-shaking eliminates unused icons, keeping bundle size minimal
3. **Developer Experience**: React-first approach with full TypeScript support and intuitive props API
4. **Customization Freedom**: SVG properties allow full control over appearance without style conflicts
5. **Theme Integration**: Works seamlessly with CSS custom properties and design token system
6. **Performance**: Lightweight SVG components with no runtime overhead
7. **Future-Proof**: Active maintenance ensures compatibility with React updates and security patches

## Risk Assessment and Mitigations

### Risk: Limited icon count compared to comprehensive libraries like React Icons
- **Mitigation**: Lucide provides 1636+ icons covering most common UI needs; quality over quantity approach
- **Fallback**: Can supplement with custom SVG icons using same design principles if specific icons needed

### Risk: Community size smaller than established libraries
- **Mitigation**: Active GitHub community and Discord support; maintainers are responsive to issues
- **Fallback**: Icons are standard SVG components; can be extracted and used independently if needed

### Risk: Design system lock-in to specific visual style
- **Mitigation**: Consistent stroke-based design aligns well with modern UI trends and accessibility standards
- **Fallback**: SVG nature allows for custom styling or replacement without major refactoring

## Performance Comparison Data

| Metric | Lucide | React Icons | Heroicons | Phosphor | Ant Design |
|--------|--------|-------------|-----------|----------|------------|
| **Bundle Size** (5 icons) | ~2 KB | ~3-15 KB | ~2 KB | ~4 KB | ~8 KB |
| **Tree Shaking** | Excellent | Good | Excellent | Good | Limited |
| **Icon Count** | 1636+ | 20,000+ | 460 | 6000+ | 831 |
| **Design Consistency** | Excellent | Variable | Good | Good | Good |
| **React Integration** | Native | Good | Good | Good | Native |

*Bundle sizes are approximate and vary based on build optimization*

## References

- [Lucide Icons Official Site](https://lucide.dev/)
- [Lucide React Package](https://www.npmjs.com/package/lucide-react)
- [Lucide GitHub Repository](https://github.com/lucide-icons/lucide)
- [Icon Usage Documentation](https://lucide.dev/guide/)
- [React Icons Comparison](https://github.com/react-icons/react-icons)

---

**Next Steps**: Lucide integration is already complete and active in the ThemeSwitcher component