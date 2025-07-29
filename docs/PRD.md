# Product Requirements Document (PRD)

## Project Name
**Favoritable** — A social-login powered bookmark manager with support for a future Chrome extension.

---

## 1. Purpose
Build a personal bookmark management web application where users can log in with social accounts, view their saved bookmarks, add new ones, and organize them with labels. The system will be extendable with a Chrome extension.

---

## 2. Target Platforms
- **Web app (initial)**
- **Chrome Extension** (future)
- **Mobile App** (future): Android/iOS app to allow sharing and saving URLs from other apps directly into Favoritable

---

## 3. Tech Stack

### Frontend
- **UI Library:** [Shadcn UI](https://ui.shadcn.com/) for all components
- **Framework:** TanStack Start
- **Language:** TypeScript
- **Testing:** Vitest, React Testing Library
- **Quality Tools:** ESLint, Prettier, Type-checking

### Backend
- **Framework:** Hono (on Node.js)
- **Database:** SQLite
- **Authentication:** Auth.js (OAuth providers)
- **Testing:** Vitest

---

## 4. Features

### 4.1 Security
- Add secureHeaders middleware for Hono

### 4.2 Authentication
- OAuth login (Google, Facebook, GitHub, Twitter)
- Persistent user sessions (JWT or Auth.js session storage)
- Show login screen for unauthenticated users
- Sign-up link with automatic user creation upon first login
- Add user to bookmarks and labels

### 4.3 Bookmark Management
- View list/grid of saved bookmarks
- Favorite/Unfavorite bookmarks
- Add new bookmark with:
  - URL
  - Title (auto-fetched from metadata)
  - Description (auto-fetched from metadata)
  - Published Date (auto-fetched from metadata)
  - Author (auto-fetched from metadata)
  - Labels
- Import/export from Onmivore, Browser export or from text file with line separated URLs
- Add endpoint to backup/export bookmarks (Worker?)
- Edit and delete bookmarks
- Archive/Unarchive bookmarks
- Sort bookmarks
  - By date added
  - By date updated
  - By title
- Search by title, description, or URL
- Should show the title, description, and author on hover, over the image (auto-fetched from metadata) and also the labels and the card.

### 4.4 Labels
- Sidebar view for label categories
- Create, rename, delete labels
- Filter bookmarks by label
- Use AI to suggest labels when adding a bookmark

### 4.4 Collections
- Default collections: All, Favorites, Archived
- Bookmarks can exist in multiple collections

### 4.5 Search and Sorting
- Search by title, description, or URL
- Sort by:
  - Recently added
  - Last updated
  - Alphabetical

### 4.6 User Interface
- Dark and Light UI
- Left-side vertical navigation
- Main grid display of bookmarks with tags and metadata
- Responsive layout for mobile and desktop

### 4.7 Future: Chrome Extension
- Authenticate with same credentials as the web app
- Save the current tab as a bookmark (background script + popup)
- Autofill metadata

---

## 5. Development & Tooling
- Linting & Formatting: Add Lint / Prettier / Biome / Knip
- Middlewares: Review Middlewares
- API Documentation: Add Open API docs (Swagger)
- Testing: Add tests (E2E - Test scrapper for omnivore import files, E2E - Test scrapper for HTML files, E2E - Test scrapper for Text files)
- Logging & Monitoring: Review Logging Monitoring
- Production Readiness: Review for Prod
- Dependency Management: Review dependabot

---

## 6. Data Model (Initial)

---

## 7. Deployment & Infrastructure
- Database Hosting:
  - NEON TECH: PostgreSQL. 500MB. 190 horas de computación → neon․tech
  - TURSO: SQLite, 5GB, mil millones de lecturas → turso․com
  - XATA: PostgreSQL, 15GB, transferencia ilimitada → lite․xata․io
  - COCKROACHDB: 10 GB de almacenamiento, 50M de requests → cockroachlabs․com
  - SUPABASE: PostgreSQL, 500MB, 5GB de transferencia → supabase․com
- API Deployment:
  - VERCEL: Webs de JavaScript, Next, Vue, etc. Proyectos ilimitados (100GB de transferencia) → vercel․com
  - NORTHFLANK: Proyectos de Go, Rust, Java... (Compatible Dockerfile). Sin coste para 2 servicios y 2 cronjobs → northflank․com
  - ZEABUR: Compatible con cualquier lenguaje y framework. 1 proyecto gratis (no requiere tarjeta de crédito) → zeabur․com
  - RENDER: Bases de datos PostgreSQL, sitios estáticos y Dockerfiles. 100GB de ancho de banda → render․com
  - NETLIFY: Webs de JavaScript, Next, Vue, etc. Proyectos ilimitados (100GB de transferencia) → netlify․com

---

## 8. API Endpoints (REST)

### User
```ts
{
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider: 'google' | 'github' | 'twitter' | 'facebook';
}
```

### Bookmark
```ts
{
  id: string; // PK
  url: string;
  slug: string;
  title: string;
  description?: string;
  author?: string;
  thumbnail?: string;
  state: 'active' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  labels?: Label[];
  userId: string; // Pending to be added
}
```

### Label
```ts
{
  id: string; // PK
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Pending to be added
}
```

### BookmarkLabel (Many-to-many)
```ts
{
  id: string; // PK
  bookmarkId: string;
  labelId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 9. API Endpoints (REST)

### Auth
- `GET /auth/session` — Get current user
- `POST /auth/logout`
- `POST /auth/callback/:provider`

### Bookmarks
- `GET /bookmarks`
- `GET /bookmarks/:id`
- `POST /bookmarks`
- `POST /bookmarks/from-url`
- `POST /bookmarks/batch-delete`
- `POST /bookmarks/import/omnivore`
- `POST /bookmarks/import/html`
- `POST /bookmarks/import/text`
- `PATCH /bookmarks/:id`
- `PATCH /bookmarks`
- `DELETE /bookmarks/:id`

### Labels
- `GET /labels`
- `GET /labels/:id`
- `POST /labels`
- `POST /labels/batch-delete`
- `PUT /labels/:id`
- `DELETE /labels/:id`

---

## 10. Non-Functional Requirements
- Clean code structure, typed end-to-end
- Component-level tests and API tests
- SSR via TanStack Start (if desired)
- Responsive and accessible design (WCAG AA)

---

## 11. Out of Scope (MVP)
- Multi-user sharing of bookmarks
- Real-time collaboration
- Favorite collections 
- Chrome extension 
- Mobile app 

---

## 12. Review When Almost Ready
- <https://github.com/colinhacks/zshy>
- <https://github.com/goldbergyoni/nodejs-testing-best-practices?ck_subscriber_id=2107974869#readme>
- <https://levelup.gitconnected.com/your-express-app-isn-t-great-here-s-why-84003bbce092>
- <https://medium.com/javarevisited/16-common-rest-api-status-code-mistakes-to-avoid-in-2025-f703c656deb0#3b1d>
- <https://dev.to/schead/using-clean-architecture-and-the-unit-of-work-pattern-on-a-nodejs-application-3pc9>
- <https://dev.to/dipakahirav/modern-api-development-with-nodejs-express-and-typescript-using-clean-architecture-1m77>
- <https://github.com/AzouKr/typescript-clean-architecture/blob/main/src/app/domain/User.ts>

---

## 13. Investigate
- Scrapping Issues:
  - URLs not scrapping correctly: <https://x.com/midudev/status/1807775893135278345?s=09&t=RI5qICHzTKjUht1zGVeR1g> (380_400.json)
- Performance Improvements:
  - <https://medium.com/@mohantaankit2002/building-a-nest-js-api-that-can-handle-millions-of-requests-without-crashing-6212add27122>
- Streaming / Server-Sent Events (SSE):
  - <https://kumneger.dev/blog/server-sent-events-explained>
  - <https://yanael.io/articles/hono-sse/>

---

## 14. Front-End
- Folder Structure:
  - <https://dev.to/itswillt/folder-structures-in-react-projects-3dp8>
- General:
  - <https://www.youtube.com/watch?v=RnNa47dN570>

---