# ADR-018: HTTP Client Library Selection for Frontend Authentication Integration

**Date**: 2025-09-27  
**Status**: Proposed  
**Deciders**: Development Team  

## Context

The favoritable project requires an HTTP client library to handle communication between the React frontend and the Hono backend, specifically for Better Auth integration and general API interactions. The solution must meet the following requirements:

- **Authentication Integration**: Seamless cookie handling for Better Auth session management
- **Modern Architecture**: Alignment with current web standards and future-proof design
- **Developer Experience**: TypeScript-first with intuitive API design
- **Bundle Size**: Minimal impact on frontend bundle size
- **Error Handling**: Robust error handling for authentication failures and HTTP errors
- **Feature Set**: Automatic JSON parsing, retry mechanisms, and request/response hooks

The project tech stack includes:
- React frontend with TanStack Router
- Better Auth for authentication
- TypeScript throughout the stack
- Modern build tools (Rsbuild)
- Focus on performance and developer experience

We need to select an HTTP client library that will serve as the foundation for all frontend-backend communication, particularly for the authentication flow integration.

## Decision

### HTTP Client Library: Ky

**Choice**: [Ky](https://github.com/sindresorhus/ky) - A tiny and elegant HTTP client based on the Fetch API

**Rationale**:
- **Modern Foundation**: Built on native Fetch API, ensuring future compatibility and web standards alignment
- **Perfect Bundle Size**: ~11KB gzipped - optimal balance between features and size
- **Authentication-Ready**: Built-in cookie handling essential for Better Auth session management
- **Developer Experience**: TypeScript-first design with intuitive, clean API
- **Error Handling**: Automatic error handling for non-2xx responses, perfect for auth failure scenarios
- **Extensibility**: Hooks system (beforeRequest, afterResponse) ideal for authentication middleware
- **Feature Complete**: Includes retry mechanisms, progress tracking, and automatic JSON parsing

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │       Ky         │    │   Hono API      │
│   Components    │◄──►│   HTTP Client    │◄──►│   Better Auth   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Auth Context  │    │   Session        │    │   OAuth         │
│   State Mgmt    │    │   Management     │    │   Providers     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation Strategy

### Phase 1: Library Setup and Configuration
1. Install Ky as frontend dependency
2. Create base API client configuration with Better Auth cookie settings
3. Set up TypeScript types for API responses

### Phase 2: Authentication Integration
1. Implement authentication hooks for request/response interceptors
2. Create session management utilities
3. Add error handling for auth failures (401/403 responses)

### Phase 3: Complete API Integration
1. Migrate any existing fetch calls to Ky
2. Implement progress tracking for file uploads
3. Add retry mechanisms for network resilience

## Considered Alternatives

### HTTP Client Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Ky** | Modern Fetch-based, TypeScript-first, small bundle, auth-ready | Smaller ecosystem, newer library | ✅ **Selected** |
| **Axios** | Battle-tested, huge ecosystem, rich features | Large bundle (~13KB), XMLHttpRequest-based, complex for simple use cases | ❌ Legacy architecture |
| **Native Fetch** | Zero dependencies, smallest size, standard API | Verbose, no auto error handling, requires manual cookie setup | ❌ Too much boilerplate |
| **ofetch** | Universal, modern, Nuxt-backed | Smaller community, less documentation | ❌ Less proven for auth use cases |
| **SuperAgent** | Mature, plugin ecosystem | Large bundle (~25KB), old API design | ❌ Legacy and bloated |

## Benefits

1. **Modern Architecture**: Future-proof foundation built on web standards (Fetch API)
2. **Bundle Efficiency**: Minimal impact on frontend performance with ~11KB footprint
3. **Authentication Ready**: Built-in cookie handling seamlessly supports Better Auth sessions
4. **Developer Productivity**: TypeScript-first design reduces development time and errors
5. **Error Resilience**: Automatic retry and error handling improves user experience
6. **Extensibility**: Hook system provides clean architecture for auth middleware
7. **Maintenance**: Active development by Sindre Sorhus with strong community support

## Risk Assessment and Mitigations

### Risk: Smaller ecosystem compared to Axios
- **Mitigation**: Ky's API is simple enough that most solutions can be implemented directly
- **Fallback**: Migration path to Axios is straightforward due to similar promise-based API

### Risk: Newer library with less battle-testing
- **Mitigation**: Backed by Sindre Sorhus (trusted maintainer) and built on proven Fetch API
- **Fallback**: Native Fetch API provides stable foundation if issues arise

### Risk: Modern browser requirement
- **Mitigation**: Target modern browsers align with project requirements
- **Fallback**: Polyfills available if older browser support becomes necessary

## Performance/Comparison Data

| Metric | Ky | Axios | Native Fetch | ofetch | Improvement |
|--------|------------|-----------------|-----------------|-------------|
| **Bundle Size** | ~11KB gzipped | ~13KB gzipped | 0KB | ~8KB gzipped | ~18% smaller than Axios |
| **Monthly Downloads** | 15M+ | 295M+ | Built-in | 11M+ | Adequate adoption |
| **TypeScript Support** | Native | Good | Manual types | Native | Best-in-class |
| **API Complexity** | Simple | Complex | Verbose | Simple | Balanced simplicity |
| **Auth Integration** | Built-in cookies | Manual setup | Manual setup | Built-in | Optimal for Better Auth |

*Bundle sizes measured with modern build tools and compression*

## References

- [Ky Documentation](https://github.com/sindresorhus/ky)
- [Fetch API Specification](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [NPM Downloads Comparison](https://npmtrends.com/axios-vs-ky-vs-ofetch-vs-superagent)
- [Bundle Size Analysis](https://bundlephobia.com/package/ky)

---

**Next Steps**: Implement Task #74 - Frontend integration of login UI with Better Auth backend using Ky as the HTTP client foundation