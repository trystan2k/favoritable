# Favoritable API - Project Context

## 1. Project Overview

The `favoritable-api` is a backend service designed to provide a comprehensive solution for managing personal bookmarks. It acts as a central repository for users to save, organize, and retrieve web links from various sources. The core idea is to go beyond simple link storage by enriching bookmarks with metadata, labels, and providing powerful search and import capabilities.

The API is built to be robust, scalable, and maintainable, following modern best practices in Node.js development.

## 2. Core Features

The API implements and plans to implement the following features:

*   **Bookmark Management:** Full CRUD (Create, Read, Update, Delete) operations for bookmarks.
*   **Label Management:** Full CRUD operations for labels, allowing bookmarks to be categorized.
*   **Web Scraping:** A sophisticated web scraper to automatically fetch metadata (title, description, images) from bookmark URLs. It is designed to handle both static and dynamic, JavaScript-heavy websites (e.g., using Puppeteer/Playwright).
*   **Import/Export:**
    *   Import bookmarks from various sources, including:
        *   Chrome/Firefox bookmark export files (HTML).
        *   Omnivore backup files (JSON).
        *   Simple text files with one URL per line.
    *   Endpoint to backup/export all user data.
*   **Search and Filtering:**
    *   Full-text search on bookmark titles and descriptions.
    *   Filter bookmarks by one or more labels.
*   **Bulk Operations:** Endpoints to archive or delete multiple bookmarks at once.
*   **AI-Powered Tagging:** A planned feature to use AI for suggesting relevant labels when a new bookmark is added.

## 3. Technical Stack

The project is built with a modern TypeScript and Node.js stack:

*   **Framework:** Hono - A small, simple, and ultrafast web framework for the Edge. Chosen for its performance and minimalist design.
*   **Language:** TypeScript - For static typing and improved developer experience.
*   **Database ORM:** Drizzle ORM - A TypeScript ORM that provides type-safety from the database schema to the application code.
*   **Database:** The database is not finalized, but the architecture supports standard relational databases like PostgreSQL or SQLite.
*   **Runtime Environment:** Node.js
*   **Schema Validation:** Zod - Used for validating incoming request data (bodies, params, queries) and ensuring type safety.
*   **API Documentation:** OpenAPI (Swagger) - API documentation is generated automatically from the Hono routes and Zod schemas using `@asteasolutions/zod-to-openapi`.
*   **Logging:** Pino - A high-performance, low-overhead logger for Node.js.
*   **Configuration:** Environment variables are managed using `dotenv`, and configuration files are loaded with `cosmiconfig`.
*   **Authentication:** Planned, with Passport.js or Auth.js as likely candidates.

## 4. Architecture

The API is designed following the principles of **Clean Architecture**. This architectural style emphasizes a separation of concerns, creating a system that is independent of frameworks, UI, and databases.

The structure is layered as follows:

1.  **Routes/Controllers (Hono Handlers):** The outermost layer, responsible for handling HTTP requests and responses. It parses incoming requests and calls the appropriate services. This layer is defined in the `routes` directory.

2.  **Services:** This layer contains the core application logic and use cases. Services orchestrate the flow of data, calling repositories to interact with the database and performing business-specific operations. They are responsible for converting Data Transfer Objects (DTOs) from the repository layer into application-level Models.

3.  **Repositories:** This layer abstracts the data source. Its responsibility is to query and manipulate data in the database. It returns raw data or DTOs to the service layer, keeping the database-specific implementation details (like Drizzle ORM queries) hidden from the application logic.

4.  **Models & DTOs:**
    *   **Models:** Represent the core domain entities of the application (e.g., `Bookmark`, `Label`).
    *   **DTOs (Data Transfer Objects):** Plain objects used to transfer data between layers, particularly between repositories and services.

This separation allows for better testability, maintainability, and flexibility, as components like the database or web framework can be swapped with minimal impact on the core business logic. Dependency Injection is used to provide repositories and other dependencies to the services.

## 5. API Documentation

The API aims to be self-documenting. By leveraging Hono, Zod, and the `@asteasolutions/zod-to-openapi` library, a complete OpenAPI 3.x specification is generated automatically. This ensures that the documentation is always in sync with the actual API implementation.

The generated documentation will be available via a Swagger UI endpoint.

## 6. Setup & Configuration

1.  **Dependencies:** Install dependencies using `pnpm install`.
2.  **Environment Variables:** Create a `.env` file in the root of the `apps/api` project. This file should contain database credentials and other configuration secrets. The `dotenv` package is used to load these variables into `process.env`.

## 7. Future Work & Roadmap

The project is under active development. The `TODO.md` file tracks the high-level roadmap, which includes:

*   Implementing a robust authentication and authorization system.
*   Finalizing the choice of database and deployment provider.
*   Adding comprehensive unit and end-to-end tests.
*   Setting up production-grade logging and monitoring.
*   Implementing a background worker system for long-running tasks like backups.
*   Integrating AI for intelligent label suggestions.
