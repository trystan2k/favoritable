# Completed Tasks

## Infrastructure & Setup

- **Logging:** Implemented a logging system/middleware.
  - *Details:* Used Pino with Hono, implemented a production-grade logger, and changed the error handler to return generic info while logging detailed errors.
  - *References:*
    - <https://github.com/pinojs/pino/blob/main/docs/web.md#pino-with-hono>
    - <https://medium.com/@artemkhrenov/building-a-production-grade-logger-for-node-js-applications-with-pino-2ebd8447d531>
    - <https://medium.com/@mohantaankit2002/best-practices-for-logging-and-monitoring-in-large-nestjs-applications-ae6e2ed31d93>
- **API Versioning:** Added versioning using headers.
  - *Reference:* <https://medium.com/@bubu.tripathy/best-practices-for-designing-rest-apis-2c084ab09059>
- **HTTP Headers:** Configured standard headers (e.g., `Accept`, `Content-Type`).
- **Error Handling:** Added a `notFound` handler.
  - *References:*
    - <https://github.dev/NicoPlyley/hono-error-handler>
    - <https://app.studyraid.com/en/read/11303/352723/error-handling-middleware>
- **Caching:** Investigated `ETag` and decided against it as it's not suitable for bookmarks which are not typically cached.
- **Dependency Injection:** Reviewed and improved the dependency injection for services and repositories.
  - *Details:* Enabled injection of instances (like DB) and used singletons where appropriate.
  - *Reference:* <https://pja-g.medium.com/lets-be-serious-about-node-dependency-injection-73bcf9ac394c>

## API Design & Endpoints

- **REST API Structure:** Defined a clear structure for the REST API.
  - **Simple REST API:**
    - `GET: items/{id}` - Returns a description of the item with the given id.
    - `PUT: items/{id}` - Updates or Creates the item with the given id.
    - `DELETE: items/{id}` - Deletes the item with the given id.
  - **Top-resource API:**
    - `GET: items?filter` - Returns all item ids matching the filter.
    - `POST: items` - Creates one or more items as described by the JSON payload.
    - `PATCH: items` - Creates/Updates/Delete one or more items as described by the JSON payload.
- **Batch Operations:**
  - `POST /bookmarks/batch-delete`
  - `PATCH /bookmarks/?delete` - Delete
  - `PATCH /bookmarks/` - Create/Update
- **Routing:**
  - Created nested routes.
    - *Reference:* <https://github.com/honojs/examples/blob/main/basic/src/index.ts>
  - Moved routes to dedicated files for better organization.
    - *Reference:* <https://hono.dev/docs/guides/best-practices#building-a-larger-application>

## Features

- **Import:**
  - From text file (one URL per line).
  - From Chrome bookmarks (folder names become labels).
  - From Omnivore files.
- **Labels:**
  - Assign a random color to labels on creation or import.
  - Endpoint to search/filter labels.
- **Bookmarks:**
  - Endpoint to delete multiple bookmarks at once.
  - Endpoint to archive a single bookmark.
  - Endpoint to archive multiple bookmarks at once.
  - Endpoint to search by title and description.
  - Endpoint to search/filter by label(s).
  - Endpoint to get all records (paginated).

## Data Handling & Scrapping

- **Web Scrapper:**
  - Reviewed and improved the scrapper, considering Puppeteer or Playwright for dynamic pages.
    - *References:*
      - <https://brightdata.com/blog/how-tos/web-scraping-puppeteer>
      - <https://scrapfly.io/blog/web-scraping-with-puppeteer-and-nodejs/>
      - <https://www.zenrows.com/blog/puppeteer-web-scraping#prerequisites>
  - Added a dedicated scrapper endpoint.
  - Handled redirects in the scrapper.
    - *Reference:* <https://marvinh.dev/blog/speeding-up-javascript-ecosystem>
- **Data Models:**
  - Repositories now return DTOs, and services convert them to Models.
  - Reviewed all Models/DTOs.
  - Added a response mapper (DTO to Model).
- **Schema Validation:** Added schema validation using Zod.
  - *Reference:* <https://chat.qwen.ai/c/3a138e54-fc97-466a-89c3-e61e14cffcb3>
- **Browser Compatibility:** Checked if Firefox/Safari/Edge bookmarks exports are similar to Chrome's.