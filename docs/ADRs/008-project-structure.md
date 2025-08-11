# ADR-008: Project Structure (Monorepo with Turborepo)

**Date**: 2025-08-11  
**Status**: Accepted  

## Context

The favoritable project consists of multiple related packages that need to be managed efficiently:
- Frontend React application
- Backend API with Hono
- Shared TypeScript configuration packages
- Shared linting and formatting configuration
- Shared utility libraries and types

We need a project structure that enables efficient development workflow, code sharing, dependency management, and build orchestration across these related packages while maintaining clear separation of concerns.

## Decision

We have chosen a **monorepo architecture** managed by **Turborepo** to organize the project structure.

The project is structured with separate packages in `apps/` for applications (frontend, api) and `packages/` for shared configurations and utilities. Turborepo provides build caching, task orchestration, and parallel execution capabilities to optimize development and CI/CD workflows.

This structure allows us to share TypeScript configurations, linting rules, and utility functions across packages while maintaining independent deployment and versioning for each application.

## Status

Accepted

## Consequences

**Positive Consequences:**
- Simplified dependency management with shared configurations and utilities
- Efficient build caching and parallel task execution through Turborepo
- Consistent code quality and formatting across all packages
- Easy code sharing between frontend and backend without external publishing
- Single repository for easier development workflow and CI/CD setup
- Atomic changes across multiple packages with unified version control

**Negative Consequences:**
- Larger repository size and complexity compared to separate repositories
- Potential for tighter coupling between packages if not properly managed
- Learning curve for developers unfamiliar with monorepo workflows
- More complex CI/CD setup for individual package deployments
- Risk of shared dependency version conflicts across packages