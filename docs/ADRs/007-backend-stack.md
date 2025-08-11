# ADR-007: Backend Stack (Hono, SQLite, Drizzle)

**Date**: 2025-08-11  
**Status**: Accepted  

## Context

The favoritable project requires a backend API solution for bookmark management with the following requirements:
- Fast, lightweight HTTP server for REST API endpoints
- Database solution for storing bookmarks, labels, and user data
- Type-safe database interactions with schema management
- Excellent TypeScript integration across the stack
- Performance optimized for read-heavy bookmark operations
- Simple deployment and development workflow

## Decision

We have chosen **Hono** as the web framework, **SQLite** as the database, and **Drizzle ORM** for database interactions.

**Hono** provides an ultra-fast, lightweight web framework built specifically for modern JavaScript runtimes. It offers excellent TypeScript support, middleware ecosystem, and minimal overhead.

**SQLite** serves as our database solution, providing a serverless, embedded database that requires no setup and offers excellent performance for our read-heavy bookmark management use case.

**Drizzle ORM** acts as our database toolkit, offering TypeScript-first schema definition, type-safe queries, and seamless SQLite integration with excellent developer experience.

## Status

Accepted

## Consequences

**Positive Consequences:**
- Excellent development experience with full TypeScript integration
- Fast performance due to Hono's lightweight nature and SQLite's embedded architecture
- Simple deployment with no database server management required
- Strong type safety across the entire data layer
- Easy local development with file-based SQLite database
- Migration and schema management through Drizzle's tooling

**Negative Consequences:**
- SQLite may require migration to a more robust solution for high-scale concurrent write operations
- Limited to single-node deployments without additional database replication setup
- Smaller community compared to more established frameworks like Express.js
- Potential learning curve for developers unfamiliar with Hono's patterns