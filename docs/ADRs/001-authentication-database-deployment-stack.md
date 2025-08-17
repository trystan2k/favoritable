# ADR-001: Authentication, Database, and Deployment Stack Selection

**Date**: 2025-08-11  
**Status**: Accepted  
**Deciders**: Development Team  

## Context

The favoritable project is a bookmark management application with the following requirements:
- **Backend**: Hono API with TypeScript
- **Frontend**: React SPA 
- **Mobile Apps**: Future React Native and/or native iOS/Android apps
- **Current Database**: SQLite with Drizzle ORM
- **Authentication**: Need for user authentication with session management
- **OAuth**: Support for Google, Apple, GitHub login
- **Deployment**: Traditional backend service deployment for scalability and reliability

We need to make architectural decisions for:
1. Authentication/Authorization library
2. Database solution for production deployment
3. Deployment platform strategy

## Decision

### Authentication: Lucia Auth

**Choice**: [Lucia](https://lucia-auth.com/) for authentication and session management

**Rationale**:
- **TypeScript-native**: Perfect alignment with our TypeScript-heavy stack
- **Hono compatibility**: Official Hono middleware support via `@lucia-auth/adapter-hono`
- **Framework agnostic**: Not tied to specific frameworks, works with our API-first architecture
- **Session-based**: Ideal for SPA applications with HTTP-only cookie security
- **OAuth support**: Built-in support for Google, GitHub, Apple, and other providers
- **Database agnostic**: Works seamlessly with SQLite/Drizzle setup
- **Security-focused**: Modern security practices with CSRF protection
- **Lightweight**: Minimal overhead, focuses on core authentication needs
- **No vendor lock-in**: We own our auth data and logic
- **Mobile-ready**: HTTP-only cookies work seamlessly with React Native and native mobile apps

### Database: Turso (LibSQL)

**Choice**: [Turso](https://turso.tech/) as the production database solution

**Rationale**:
- **SQLite compatibility**: Zero migration effort from current SQLite setup
- **Drizzle integration**: Official Turso driver for Drizzle ORM
- **Serverless-first**: Designed specifically for serverless deployments
- **Global edge**: Distributed SQLite with low latency worldwide
- **Development continuity**: Can continue using local SQLite for development
- **Cost-effective**: Generous free tier with pay-as-you-scale pricing
- **Perfect for read-heavy workloads**: Bookmark management is primarily read operations
- **Built-in replication**: Automatic backups and data distribution

### Deployment: Railway / Fly.io

**Choice**: [Railway](https://railway.app/) or [Fly.io](https://fly.io/) for backend API deployment, [Vercel](https://vercel.com/) for frontend

**Rationale**:
- **Traditional backend hosting**: Designed for long-running API services, not serverless functions
- **Persistent connections**: Better suited for database connections and session management
- **Docker support**: Can containerize the Hono API for consistent deployments
- **Environment flexibility**: Better control over runtime environment and resources
- **Database compatibility**: Excellent support for external databases like Turso
- **Cost predictability**: Fixed pricing for dedicated resources vs. per-request billing
- **Development workflow**: Better debugging and logging for traditional backend services
- **Scaling options**: Both horizontal and vertical scaling capabilities

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │    │   Hono API       │    │   Turso DB      │
│  (Vercel CDN)   │◄──►│ (Railway/Fly.io) │◄──►│ (Global Edge)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │
┌─────────────────┐            │
│ React Native    │◄───────────┤
│   (iOS/Android) │            │
└─────────────────┘            │
                               │
┌─────────────────┐            │
│ Native Apps     │◄───────────┤
│ (Swift/Kotlin)  │            │
└─────────────────┘            ▼
                        ┌──────────────┐
                        │ Lucia Auth   │
                        │ (Sessions)   │
                        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ OAuth        │
                        │ Providers    │
                        └──────────────┘
```
## Implementation Strategy

### Phase 1: Authentication Setup
1. Install Lucia with Hono adapter and SQLite support
2. Implement session management with HTTP-only cookies
3. Create auth middleware for protected routes
4. Set up user registration and login endpoints

### Phase 2: OAuth Integration
1. Configure Google OAuth for bookmark import capabilities
2. Add GitHub OAuth for developer-friendly login
3. Implement Apple OAuth for iOS users
4. Create account linking functionality

### Phase 3: Database Migration
1. Set up Turso database and configure Drizzle connection
2. Migrate existing SQLite schema to Turso
3. Update environment configuration for local vs. production
4. Test session storage and user data persistence

### Phase 4: Deployment
1. Configure Vercel deployment for React SPA
2. Set up Railway/Fly.io deployment for Hono API service
3. Configure environment variables and secrets
4. Set up OAuth callback URLs for production

### Phase 5: Mobile App Support (Future)
1. React Native app using same Hono API endpoints
2. Native iOS/Android apps with HTTP-only cookie authentication
3. OAuth flows using system webview or in-app browser
4. Biometric authentication for enhanced security

## Considered Alternatives

### Authentication Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **NextAuth.js** | Popular, feature-rich | Next.js focused, overkill for API-first, complex mobile integration | ❌ Not suitable |
| **Passport.js** | Mature, many strategies | Complex setup, less TypeScript-friendly | ❌ Too complex |
| **Supabase Auth** | Easy setup, managed | Vendor lock-in, doesn't fit self-hosted | ❌ Lock-in concerns |
| **Custom JWT** | Full control | Security complexity, session management | ❌ Reinventing wheel |

### Database Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Neon (PostgreSQL)** | Serverless, SQL standard | Schema migration required | ❌ Migration overhead |
| **PlanetScale (MySQL)** | Serverless, branching | Schema migration, MySQL syntax | ❌ Migration overhead |
| **Supabase** | Full-stack, PostgreSQL | Vendor lock-in, migration needed | ❌ Lock-in concerns |
| **SQLite + Persistent volumes** | No migration | Not truly serverless, scaling issues | ❌ Scaling limitations |

### Deployment Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Vercel Functions** | Easy setup, Next.js integration | Serverless limitations, timeout constraints | ❌ Not suitable for backend service |
| **Netlify Functions** | Good SPA hosting | Limited function capabilities, cold starts | ❌ Limited backend support |
| **Railway** | Persistent backend, Docker support | Newer platform, pricing at scale | ✅ Good for backend services |
| **Fly.io** | Excellent for APIs, global edge | Learning curve, complex networking | ✅ Great performance |
| **Cloudflare Workers** | Excellent performance | Limited runtime, ecosystem constraints | ❌ Too restrictive |

## Benefits

1. **Developer Experience**: Consistent TypeScript across the entire stack
2. **Performance**: Optimized backend service with persistent connections
3. **Security**: Modern authentication with HTTP-only cookies and OAuth
4. **Scalability**: Traditional scaling with predictable performance characteristics
5. **Cost Efficiency**: Predictable pricing for dedicated backend resources
6. **Maintainability**: Minimal vendor lock-in, own our data and logic
7. **Future-proof**: Modern stack with active development and community
8. **Mobile-ready**: Single API for all platforms with secure session management

## Mobile App Compatibility

### React Native Support
- **✅ Excellent compatibility**: Uses same HTTP endpoints as web SPA
- **✅ Cookie management**: Works with `@react-native-cookies/cookies` or built-in fetch
- **✅ OAuth flows**: Supports `expo-auth-session` and `react-native-app-auth`
- **✅ Component reuse**: Can share UI components between web and mobile

### Native iOS/Android Support
- **✅ HTTP-only cookies**: Automatically handled by `URLSession` (iOS) and `OkHttp` (Android)
- **✅ OAuth integration**: System webview or in-app browser for OAuth flows
- **✅ Security**: More secure than JWT token storage in device storage
- **✅ Session persistence**: Platform handles cookie persistence across app restarts

### Mobile vs. Auth.js Comparison
- **Lucia advantage**: HTTP-only cookies are more secure than manually stored JWT tokens
- **Lucia advantage**: Platform-native cookie handling vs. custom token management
- **Lucia advantage**: Same session-based approach across all platforms
- **Auth.js disadvantage**: Would require custom JWT handling and secure storage in mobile apps

## Risks and Mitigations

### Risk: Lucia adoption/community size
- **Mitigation**: Well-documented, TypeScript-first, active development
- **Fallback**: Can migrate to other session-based auth if needed

### Risk: Turso vendor dependency
- **Mitigation**: SQLite compatibility means easy migration path
- **Fallback**: Can switch to any SQLite-compatible solution

### Risk: Railway/Fly.io platform dependency
- **Mitigation**: Docker-based deployment allows easy migration between platforms
- **Fallback**: Can deploy to any platform supporting Node.js/Docker containers

## References

- [Lucia Auth Documentation](https://lucia-auth.com/)
- [Turso Documentation](https://docs.turso.tech/)
- [Hono Documentation](https://hono.dev/)
- [Railway Documentation](https://docs.railway.app/)
- [Fly.io Documentation](https://fly.io/docs/)
- [Drizzle ORM with Turso](https://orm.drizzle.team/docs/get-started-sqlite#turso)

---

**Next Steps**: Implement Phase 1 (Authentication Setup) as part of the project's authentication task.