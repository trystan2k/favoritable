# TODO

## Core Features

- **Authentication:**
  - Passport.js
  - Auth.js (<https://authjs.dev/>)
  - *References:*
    - <https://x.com/sergiodxa/status/1897067211514372562?t=xVl11pi7stKjwVVgzvQu7g&s=09>
    - <https://www.youtube.com/playlist?app=desktop&list=PLUofhDIg_38qm2oPOV-IRTTEKyrVBBaU7>
    - <https://javascript.plainenglish.io/the-node-js-microservices-masterclass-84c0329ad2d6>
    - <https://article.arunangshudas.com/8-essential-steps-for-safe-node-js-authentication-4858fecdea41>
  - Add user to bookmarks and labels
- **Backup/Export:**
  - Add endpoint to backup/export bookmarks (Worker?)
  - *Reference:* <https://medium.com/@mehdibafdil/thread-safe-architecture-in-node-js-from-theory-to-implementation-12aa03b09b4e>
- **AI Label Suggestions:**
  - Use AI to suggest labels when adding a bookmark

## Development & Tooling

- **Linting & Formatting:**
  - Add Lint / Prettier / Biome / Knip
  - *References:*
    - Knip: <https://knip.dev/overview/getting-started>
    - Biome: <https://blog.stackademic.com/biome-a-faster-unified-alternative-to-eslint-and-prettier-7767ed2637bd>
- **Middlewares:**
  - Review Middlewares
  - *Reference:* <https://hono.dev/docs/middleware/builtin/timeout>
- **API Documentation:**
  - Add Open API docs (Swagger)
  - *References:*
    - <https://hono.dev/examples/hono-openapi>
    - <https://github.com/honojs/middleware/issues/735>
- **Testing:**
  - Add tests
  - E2E - Test scrapper for omnivore import files
  - E2E - Test scrapper for HTML files
  - E2E - Test scrapper for Text files
- **Logging & Monitoring:**
  - Review Logging Monitoring
  - *References:*
    - <https://medium.com/@mohantaankit2002/best-practices-for-logging-and-monitoring-in-large-nestjs-applications-ae6e2ed31d93>
    - <https://betterstack.com/telemetry>
- **Production Readiness:**
  - Review for Prod
  - *References:*
    - <https://medium.com/@mehdibafdil/is-your-node-js-application-production-ready-a-complete-checklist-601c9d494f4f>
    - <https://dev.to/minima_desk_cd9b151c4e2fb/dockerize-your-nodejs-application-a-step-by-step-guide-iel?context=digest>
- **Dependency Management:**
  - Review dependabot
  - *Reference:* <https://woliveiras.github.io/posts/how-to-schedule-dependabot-to-keep-dependencies-updated/>

## Deployment & Infrastructure

- **Database Hosting:**
  - NEON TECH: PostgreSQL. 500MB. 190 horas de computación → neon․tech
  - TURSO: SQLite, 5GB, mil millones de lecturas → turso․com
  - XATA: PostgreSQL, 15GB, transferencia ilimitada → lite․xata․io
  - COCKROACHDB: 10 GB de almacenamiento, 50M de requests → cockroachlabs․com
  - SUPABASE: PostgreSQL, 500MB, 5GB de transferencia → supabase․com
- **API Deployment:**
  - VERCEL: Webs de JavaScript, Next, Vue, etc. Proyectos ilimitados (100GB de transferencia) → vercel․com
  - NORTHFLANK: Proyectos de Go, Rust, Java... (Compatible Dockerfile). Sin coste para 2 servicios y 2 cronjobs → northflank․com
  - ZEABUR: Compatible con cualquier lenguaje y framework. 1 proyecto gratis (no requiere tarjeta de crédito) → zeabur․com
  - RENDER: Bases de datos PostgreSQL, sitios estáticos y Dockerfiles. 100GB de ancho de banda → render․com
  - NETLIFY: Webs de JavaScript, Next, Vue, etc. Proyectos ilimitados (100GB de transferencia) → netlify․com

# REVIEW When almost ready

- <https://github.com/colinhacks/zshy>
- <https://github.com/goldbergyoni/nodejs-testing-best-practices?ck_subscriber_id=2107974869#readme>
- <https://levelup.gitconnected.com/your-express-app-isnt-great-here-s-why-84003bbce092>
- <https://medium.com/javarevisited/16-common-rest-api-status-code-mistakes-to-avoid-in-2025-f703c656deb0#3b1d>
- <https://dev.to/schead/using-clean-architecture-and-the-unit-of-work-pattern-on-a-nodejs-application-3pc9>
- <https://dev.to/dipakahirav/modern-api-development-with-nodejs-express-and-typescript-using-clean-architecture-1m77>
- <https://github.com/AzouKr/typescript-clean-architecture/blob/main/src/app/domain/User.ts>

# INVESTIGATE

- **Scrapping Issues:**
  - URLs not scrapping correctly: <https://x.com/midudev/status/1807775893135278345?s=09&t=RI5qICHzTKjUht1zGVeR1g> (380_400.json)
- **Performance Improvements:**
  - <https://medium.com/@mohantaankit2002/building-a-nest-js-api-that-can-handle-millions-of-requests-without-crashing-6212add27122>
- **Streaming / Server-Sent Events (SSE):**
  - <https://kumneger.dev/blog/server-sent-events-explained>
  - <https://yanael.io/articles/hono-sse/>

# FRONT-END

- **Folder Structure:**
  - <https://dev.to/itswillt/folder-structures-in-react-projects-3dp8>
- **General:**
  - <https://www.youtube.com/watch?v=RnNa47dN570>
