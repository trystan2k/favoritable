TODO:

- Add Auth
  - Passport.js
  - Auth.js (<https://authjs.dev/>)
  - <https://x.com/sergiodxa/status/1897067211514372562?t=xVl11pi7stKjwVVgzvQu7g&s=09>
  - <https://www.youtube.com/playlist?app=desktop&list=PLUofhDIg_38qm2oPOV-IRTTEKyrVBBaU7>
  - <https://javascript.plainenglish.io/the-node-js-microservices-masterclass-84c0329ad2d6>
  - <https://article.arunangshudas.com/8-essential-steps-for-safe-node-js-authentication-4858fecdea41>
  - Add user to bookmarks and labels  
- Decide where to host DB
  - NEON TECH
    PostgreSQL. 500MB. 190 horas de computación
    → neon․tech
  - TURSO
    SQLite, 5GB, mil millones de lecturas
    → turso․com
  - XATA
    PostgreSQL, 15GB, transferencia ilimitada
    → lite․xata․io
  - COCKROACHDB
    10 GB de almacenamiento, 50M de requests
    → cockroachlabs․com
  - SUPABASE
    PostgreSQL, 500MB, 5GB de transferencia
    → supabase․com
- Decide where to deploy API
  - VERCEL
    Webs de JavaScript, Next, Vue, etc.
    Proyectos ilimitados (100GB de transferencia)
    → vercel․com

  - NORTHFLANK
    Proyectos de Go, Rust, Java... (Compatible Dockerfile)
    Sin coste para 2 servicios y 2 cronjobs
    → northflank․com

  - ZEABUR
    Compatible con cualquier lenguaje y framework
    1 proyecto gratis (no requiere tarjeta de crédito)
    → zeabur․com

  - RENDER
    Bases de datos PostgreSQL, sitios estáticos y Dockerfiles
    100GB de ancho de banda
    → render․com

  - NETLIFY
    Webs de JavaScript, Next, Vue, etc.
    Proyectos ilimitados (100GB de transferencia)
    → netlify․com
- Add endpoint to backup/export bookmarks (Worker?)
  - <https://medium.com/@mehdibafdil/thread-safe-architecture-in-node-js-from-theory-to-implementation-12aa03b09b4e>
- Add Lint / Prettier / Biome / Knip
  - Knip: <https://knip.dev/overview/getting-started>
  - Biome: <https://blog.stackademic.com/biome-a-faster-unified-alternative-to-eslint-and-prettier-7767ed2637bd>  
- Review Middlewares
  - <https://hono.dev/docs/middleware/builtin/timeout>  
- Add Open API docs (Swagger)
  - <https://hono.dev/examples/hono-openapi>
  - <https://github.com/honojs/middleware/issues/735>
- Add tests
  - E2E - Test scrapper for onmivore import files
  - E2E - Test scrappper for HTML files
  - E2E - Test scrapper for Text files  
- Review Logging Monitoring
  - <https://medium.com/@mohantaankit2002/best-practices-for-logging-and-monitoring-in-large-nestjs-applications-ae6e2ed31d93>
  - <https://betterstack.com/telemetry>
- Review for Prod
  - <https://medium.com/@mehdibafdil/is-your-node-js-application-production-ready-a-complete-checklist-601c9d494f4f>
  - <https://dev.to/minima_desk_cd9b151c4e2fb/dockerize-your-nodejs-application-a-step-by-step-guide-iel?context=digest>
- Use AI to suggeest labels when adding a bookmark
- Review dependabot
  - <https://woliveiras.github.io/posts/how-to-schedule-dependabot-to-keep-dependencies-updated/>

REVIEW When almost ready:

- <https://github.com/colinhacks/zshy>
- <https://github.com/goldbergyoni/nodejs-testing-best-practices?ck_subscriber_id=2107974869#readme>
- <https://levelup.gitconnected.com/your-express-app-isnt-great-here-s-why-84003bbce092>
- <https://medium.com/javarevisited/16-common-rest-api-status-code-mistakes-to-avoid-in-2025-f703c656deb0#3b1d>
- <https://dev.to/schead/using-clean-architecture-and-the-unit-of-work-pattern-on-a-nodejs-application-3pc9>
- <https://dev.to/dipakahirav/modern-api-development-with-nodejs-express-and-typescript-using-clean-architecture-1m77>
- <https://github.com/AzouKr/typescript-clean-architecture/blob/main/src/app/domain/User.ts>

INVESTIGATE:

- URLs not scrapping correctly:
  - <https://x.com/midudev/status/1807775893135278345?s=09&t=RI5qICHzTKjUht1zGVeR1g> (380_400.json)

- Improvements: <https://medium.com/@mohantaankit2002/building-a-nest-js-api-that-can-handle-millions-of-requests-without-crashing-6212add27122>

- Stream <https://kumneger.dev/blog/server-sent-events-explained> <https://yanael.io/articles/hono-sse/>

FRONT:

- <https://dev.to/itswillt/folder-structures-in-react-projects-3dp8>
- <https://www.youtube.com/watch?v=RnNa47dN570>

DONE:

- Add logging system/middleware
  - <https://github.com/pinojs/pino/blob/main/docs/web.md#pino-with-hono>
  - <https://medium.com/@artemkhrenov/building-a-production-grade-logger-for-node-js-applications-with-pino-2ebd8447d531>
  - <https://medium.com/@mohantaankit2002/best-practices-for-logging-and-monitoring-in-large-nestjs-applications-ae6e2ed31d93>
  - Change error handler to return generic info and log detailed one
- Add versioning using headers
  - <https://medium.com/@bubu.tripathy/best-practices-for-designing-rest-apis-2c084ab09059>
- Setup headers (like Accept, Content-Type, etc)
- Add notFound handler
  - <https://github.dev/NicoPlyley/hono-error-handler>
  - <https://app.studyraid.com/en/read/11303/352723/error-handling-middleware>
- Investigate and add etag if it worth it
  - Used mostly for cached response, not applied to bookmarks
- Review dependency injection (services and repositories) <https://pja-g.medium.com/lets-be-serious-about-node-dependency-injection-73bcf9ac394c>
  - Change to be able to inject instances (like DB)
  - Singleton, if makes sense
- Review scrapper. Maybe use pupeeter or playwright (for pages like Temu and Twitter )
  - <https://brightdata.com/blog/how-tos/web-scraping-puppeteer>
  - <https://scrapfly.io/blog/web-scraping-with-puppeteer-and-nodejs/>
  - <https://www.zenrows.com/blog/puppeteer-web-scraping#prerequisites>
- Repositories should return DTO, services should convert to Models

A simple REST API:

GET: items/{id} - Returns a description of the item with the given id
PUT: items/{id} - Updates or Creates the item with the given id
DELETE: items/{id} - Deletes the item with the given id
Top-resource API:

GET: items?filter - Returns all item ids matching the filter
POST: items - Creates one or more items as described by the JSON payload
PATCH: items - Creates/Updates/Delete one or more items as described by the JSON payload

POST /bookmarks/batch-delete
PATCH /bookmarks/?delete - Delete
PATCH /bookmarks/ - Create/Update

- Review all Models/DTOs
- Add schema validation (Zod) - <https://chat.qwen.ai/c/3a138e54-fc97-466a-89c3-e61e14cffcb3>
- Add response mapper (DTO to Model)
- Create nested routes (<https://github.com/honojs/examples/blob/main/basic/src/index.ts>)
- Move routes to a routes files (<https://hono.dev/docs/guides/best-practices#building-a-larger-application>)
- Check if Firefox/Safari/Edge bookmarks are exported are similar to Chrome bookmarks
- Add endpoint to import from text file (one URL per line)
- Add random color for label when importing and creating labels from URL or importing
- Add endpoint to import from Chrome bookmarks (add folder name as label)
- Add endpoint to import Omnivore files
- Add Scrapper endpoint
- Add endpoint to delete multiple records at once
- Add endpoint to archieve bookmark
- Add endpoint to archieve multiple records at once
- Add endpoint to search by title, description (return list with the ones that matchs)
- Add endpoint to search/filter by label(s)
- Add endpoint to get all records (paginated)
- Handle redirect in scrapper (<https://marvinh.dev/blog/speeding-up-javascript-ecosystem>)
- Add endpoint to search/filter labels
