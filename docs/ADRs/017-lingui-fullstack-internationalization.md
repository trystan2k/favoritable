# ADR-017: Lingui for Full-Stack Internationalization

**Date**: 2025-09-21  
**Status**: Accepted  
**Deciders**: Development Team  

## Context

The favoritable project requires a comprehensive internationalization (i18n) solution that meets the following requirements:
- **Full-Stack Translation Sharing**: Consistent translations between React frontend and Node.js/Hono backend
- **Bundle Size Efficiency**: Minimal impact on both client and server bundle sizes
- **Type Safety**: TypeScript integration with compile-time validation of translation keys
- **Modern Developer Experience**: Clean API that integrates well with modern React and Node.js patterns
- **Monorepo Compatibility**: Seamless sharing of translation resources across workspace packages
- **Scalability**: Ability to grow from simple string replacement to complex formatting needs
- **Build Tool Integration**: Compatible with Rsbuild (frontend) and TypeScript compilation (backend)

The project tech stack includes:
- **Frontend**: React 19, TypeScript, Rsbuild, TanStack Router
- **Backend**: Node.js, Hono, TypeScript ESM
- **Architecture**: Monorepo with pnpm workspaces
- **Build**: TypeScript compilation with modern ES modules
- **Testing**: Vitest for both frontend and backend

We need to select an i18n solution that provides consistent translation capabilities across both client and server while maintaining optimal performance and developer experience.

## Decision

### Internationalization Solution: Lingui with Shared Translation Package

**Choice**: [Lingui](https://lingui.dev/) (`@lingui/core` + `@lingui/react`) with shared workspace translation package

**Rationale**:
- **Optimal Bundle Size**: ~8KB frontend + ~5KB backend, significantly lighter than alternatives
- **Full-Stack Native**: `@lingui/core` works identically in both React and Node.js environments
- **Modern API**: Template literals and compile-time extraction align with modern JavaScript practices
- **TypeScript Excellence**: Best-in-class TypeScript integration with type-safe message IDs
- **Monorepo Friendly**: Designed for package sharing with workspace compatibility
- **Build Integration**: Seamless integration with both Rsbuild and TypeScript compilation
- **React 19 Ready**: Full compatibility with latest React features and concurrent rendering

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│    Shared        │◄──►│    Backend      │
│   (@lingui/     │    │   Translations   │    │   (@lingui/     │
│    react)       │    │   Package        │    │    core)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Hooks   │    │   Compiled       │    │   API Error     │
│   Components    │    │   Messages       │    │   Messages      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation Strategy

### Phase 1: Shared Translation Package Setup
1. Create `@favoritable/translations` workspace package
2. Configure Lingui with PO format for translator-friendly workflow
3. Set up build pipeline for message compilation and distribution

### Phase 2: Frontend Integration
1. Install and configure Lingui for React with Rsbuild integration
2. Implement context providers and routing-aware locale management
3. Create reusable translation hooks and components

### Phase 3: Backend Integration
1. Integrate `@lingui/core` into Hono API application
2. Implement locale-aware error message system
3. Add request-based locale detection and response localization

### Phase 4: Development Workflow
1. Set up message extraction and catalog management
2. Configure development scripts for translation updates
3. Establish CI/CD integration for translation validation

## Considered Alternatives

### Translation Library Alternatives

| Option | Bundle Size | Full-Stack | Type Safety | Modern API | Decision |
|--------|-------------|------------|-------------|------------|----------|
| **Lingui** | ~13KB total | Native support | Excellent | Template literals | ✅ **Selected** |
| **React-i18next** | ~35KB total | Good (i18next) | Good | Functional | ❌ Too heavy for requirements |
| **FormatJS** | ~55KB total | Available | Excellent | ICU syntax | ❌ Overkill complexity and size |
| **Rosetta + Custom** | ~4KB total | Manual setup | Limited | Simple | ❌ Too basic, lacks growth path |
| **Simple JSON Sharing** | ~2KB total | Manual setup | None | Basic | ❌ No professional i18n features |

## Benefits

1. **Unified Translation Experience**: Identical API and message format across frontend and backend
2. **Performance Optimized**: Minimal bundle impact with tree-shaking and compile-time optimization
3. **Type Safety**: Compile-time validation prevents missing translations and typos
4. **Developer Productivity**: Template literal syntax feels natural, automatic message extraction
5. **Translator Friendly**: Standard PO format works with professional translation tools
6. **Scalable Architecture**: Grows from simple strings to complex pluralization and formatting
7. **Modern Standards**: ES modules, async/await, and modern JavaScript patterns throughout

## Risk Assessment and Mitigations

### Risk: Smaller community compared to react-i18next
- **Mitigation**: Lingui has active maintainers and growing adoption; backed by solid technical foundation
- **Fallback**: Core `@lingui/core` functionality can be extracted and used independently if needed

### Risk: Build configuration complexity across multiple packages
- **Mitigation**: Centralized configuration in shared package with clear setup documentation
- **Fallback**: Simplified build pipeline that doesn't require compile-time optimization if issues arise

### Risk: Translation workflow integration with external services
- **Mitigation**: PO format is industry standard, compatible with most translation management systems
- **Fallback**: JSON export/import capabilities for custom translation workflows

## Implementation Structure

### Shared Translation Package
```
packages/translations/
├── src/
│   ├── locales/
│   │   ├── en.po              # English translations
│   │   ├── pt.po              # Portuguese translations
│   │   └── messages.ts        # Compiled message exports
│   ├── index.ts               # Package entry point
│   └── types.ts               # Shared TypeScript definitions
├── package.json               # @favoritable/translations
├── lingui.config.js           # Lingui configuration
└── tsconfig.json              # TypeScript configuration
```

### Frontend Integration
```typescript
// apps/frontend/src/i18n/index.ts
import { i18n } from '@lingui/core'
import { messages } from '@favoritable/translations'

i18n.load(messages)
i18n.activate('en')

// Component usage
import { Trans, useLingui } from '@lingui/react/macro'

function MyComponent() {
  const { t } = useLingui()
  
  return (
    <div>
      <h1><Trans>Welcome to Favoritable</Trans></h1>
      <p>{t`Manage your bookmarks efficiently`}</p>
    </div>
  )
}
```

### Backend Integration
```typescript
// apps/api/src/i18n/index.ts
import { i18n } from '@lingui/core'
import { messages } from '@favoritable/translations'
import { msg } from '@lingui/core/macro'

i18n.load(messages)

export function getLocalizedMessage(key: MessageDescriptor, locale: string = 'en', values?: any) {
  i18n.activate(locale)
  return i18n._(key, values)
}

// Usage in API handlers
export function createBookmarkError(locale: string) {
  return getLocalizedMessage(msg`Failed to create bookmark`, locale)
}
```

## Performance Comparison Data

| Metric | Lingui | React-i18next | FormatJS | Simple JSON |
|--------|--------|---------------|----------|-------------|
| **Frontend Bundle** | ~8 KB | ~20 KB | ~30 KB | ~1 KB |
| **Backend Bundle** | ~5 KB | ~15 KB | ~25 KB | ~1 KB |
| **Tree Shaking** | Excellent | Good | Good | Manual |
| **Type Safety** | Excellent | Good | Excellent | None |
| **Build Complexity** | Medium | Low | High | Low |
| **Feature Completeness** | High | Excellent | Excellent | Basic |

*Bundle sizes are approximate and include dependencies*

## References

- [Lingui Documentation](https://lingui.dev/)
- [Lingui React Integration](https://lingui.dev/ref/react)
- [Lingui Compilation Guide](https://lingui.dev/guides/message-extraction)
- [PO Format Specification](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html)
- [Monorepo Translation Sharing Patterns](https://lingui.dev/guides/monorepo)

---

**Next Steps**: Implement shared translation package and integrate Lingui across frontend and backend applications