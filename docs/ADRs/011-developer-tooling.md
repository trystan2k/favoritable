# ADR-011: Developer Tooling (Bruno and Puppeteer)

**Date**: 2025-08-11  
**Status**: Accepted  

## Context

The favoritable project requires effective developer tooling for two critical areas:
- API client and testing for development and documentation of REST endpoints
- Web scraping capabilities to fetch metadata (title, description, favicon) from bookmarked URLs
- Git-friendly API documentation and testing that can be version controlled
- Reliable browser automation for handling modern JavaScript-heavy websites
- Tools that integrate well with our TypeScript/Node.js development environment

## Decision

We have chosen **Bruno** for API client and testing, and **Puppeteer** for web scraping and metadata extraction.

**Bruno** provides a Git-friendly API client that stores collections as plain text files, enabling version control of API tests and documentation. It offers a modern alternative to Postman with better developer workflow integration.

**Puppeteer** serves as our web scraping solution, providing high-level control over Chrome/Chromium browsers to reliably extract metadata from bookmarked websites, including those with complex JavaScript rendering.

## Status

Accepted

## Consequences

**Positive Consequences:**
- Version-controlled API documentation and tests through Bruno's file-based collections
- Reliable metadata extraction from modern JavaScript-heavy websites via Puppeteer
- Better collaboration through Git-trackable API test collections
- Excellent integration with our Node.js/TypeScript backend stack
- Robust handling of dynamic content and modern web applications
- No external service dependencies for API testing (unlike cloud-based solutions)
- Precise control over browser behavior for consistent scraping results

**Negative Consequences:**
- Puppeteer adds significant dependency size and system resource requirements
- Bruno has smaller community and ecosystem compared to established tools like Postman
- Web scraping may be slower than lightweight HTTP-only solutions
- Browser automation introduces complexity for debugging and maintenance
- Potential for websites to block or limit automated scraping attempts