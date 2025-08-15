# ADR-014: Deployment Platform and Database Selection

**Date**: 2025-01-16  
**Status**: Proposed  
**Deciders**: Development Team  

## Context

The favoritable project requires a deployment platform and database solution that meets the following requirements:
- **Cost**: Must support free tier for development and low-traffic production use
- **Web Scraping**: Must support Puppeteer for URL scraping and metadata extraction
- **Full Stack**: Must host both API backend (Node.js/Hono) and database
- **Performance**: Must provide reasonable performance for bookmark management
- **Compatibility**: Must integrate with existing tech stack (Node.js, Hono, Drizzle ORM)
- **Developer Experience**: Simple deployment workflow with Git integration

The project tech stack includes:
- Node.js with Hono framework
- Puppeteer for web scraping
- Drizzle ORM for database operations
- TypeScript for type safety
- Docker support available

We need to select a deployment platform and database solution that supports web scraping capabilities while maintaining zero cost for development and minimal cost for production.

## Decision

### Deployment Platform: Render (Docker) + Database: Turso

**Choice**: [Render](https://render.com) with Docker deployment + [Turso](https://turso.tech) SQLite database

**Rationale**:
- **Cost Efficiency**: Render free tier (Docker web service) + Turso free tier = $0/month
- **Web Scraping Support**: Docker deployment allows full Chrome/Chromium installation for Puppeteer
- **Database Performance**: Turso provides edge-replicated SQLite with excellent read performance
- **Integration**: Turso works seamlessly with existing Drizzle ORM setup
- **Scalability**: Both platforms offer clear upgrade paths when needed
- **Developer Experience**: Git-based deployments with automatic builds
- **Future-Proof**: Docker deployment provides flexibility for any runtime requirements

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │   Render (Docker)│    │   Turso SQLite  │
│                 │───►│   - Node.js API  │───►│   - Edge DB     │
└─────────────────┘    │   - Puppeteer    │    │   - Global      │
         │              │   - Web Service  │    │   - Replicated  │
         ▼              └──────────────────┘    └─────────────────┘
┌─────────────────┐              │                       │
│   Auto Deploy  │              ▼                       ▼
│   on Push       │    ┌──────────────────┐    ┌─────────────────┐
└─────────────────┘    │   HTTP/REST API  │    │   Bookmark Data │
                       │   - CRUD Ops     │    │   - Metadata    │
                       └──────────────────┘    └─────────────────┘
```

## Implementation Strategy

### Phase 1: Database Migration
1. Configure Turso database instance
2. Update Drizzle configuration for LibSQL/Turso
3. Migrate existing schema to Turso
4. Test database connectivity and operations

### Phase 2: Docker Configuration  
1. Create Dockerfile with Chrome/Chromium dependencies
2. Configure Puppeteer for containerized environment
3. Set up environment variables for Turso connection
4. Test local Docker build and Puppeteer functionality

### Phase 3: Render Deployment
1. Connect GitHub repository to Render
2. Configure Docker deployment settings
3. Set up environment variables on Render
4. Deploy and verify web scraping functionality

## Considered Alternatives

### Deployment Platform Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Render (Docker)** | Free tier, Docker support, Puppeteer compatible | Cold starts on free tier | ✅ **Selected** |
| **Vercel** | Excellent performance, edge functions | No Puppeteer support (serverless) | ❌ Incompatible with Puppeteer |
| **Cloudflare Workers** | Global edge, fast cold starts | No Puppeteer support (V8 isolates) | ❌ Incompatible with Puppeteer |
| **Railway** | Good Docker support | No truly free tier | ❌ Requires payment |
| **Fly.io** | Always-on instances | No free tier anymore | ❌ Requires payment |
| **Koyeb** | Docker support | Requires credit card upfront | ❌ Not truly free |

### Database Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Turso** | Free tier, edge replication, Drizzle compatible | Relatively new platform | ✅ **Selected** |
| **Render PostgreSQL** | Integrated with platform | Only free for 30 days, then $6/month | ❌ Not permanently free |
| **PlanetScale** | MySQL compatible, generous free tier | Requires schema changes from SQLite | ❌ Migration complexity |
| **Supabase** | Full backend platform | PostgreSQL, not SQLite compatible | ❌ Schema migration required |

## Benefits

1. **Zero Cost**: Complete free tier solution for development and low-traffic production
2. **Full Functionality**: Puppeteer web scraping works without limitations
3. **Performance**: Edge-replicated database with global read performance
4. **Developer Experience**: Git-based deployments with automatic builds
5. **Scalability**: Clear upgrade paths on both platforms when needed
6. **Compatibility**: No changes required to existing Drizzle ORM setup
7. **Future-Proof**: Docker deployment supports any future runtime requirements

## Risk Assessment and Mitigations

### Risk: Cold Start Delays on Render Free Tier
- **Mitigation**: Implement proper loading states in frontend applications
- **Fallback**: Upgrade to Render paid tier ($7/month) for always-on instances

### Risk: Turso Platform Maturity
- **Mitigation**: Monitor Turso stability and maintain database backups
- **Fallback**: Migrate to PlanetScale or Supabase if needed (Drizzle supports both)

### Risk: Free Tier Limitations Exceeded
- **Mitigation**: Monitor usage metrics and implement rate limiting
- **Fallback**: Upgrade to paid tiers with clear pricing models

## References

- [Render Docker Documentation](https://docs.render.com/docker)
- [Render Pricing](https://render.com/pricing)
- [Turso Documentation](https://docs.turso.tech/)
- [Turso Pricing](https://turso.tech/pricing)
- [Drizzle Turso Integration](https://orm.drizzle.team/docs/get-started-sqlite#turso)

---

**Next Steps**: Implement Phase 1 (Database Migration) followed by Docker configuration and Render deployment