import 'reflect-metadata';

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { Container } from './core/dependency-injection/di.container.js';
import { addCacheHeaders, addCorsHeaders, addSecurityHeaders, setContentTypeHeaders, validateAcceptHeader } from './core/http.headers.js';
import { db } from './db/index.js';
import { newErrorHandler } from './errors/errors.handlers.js';
import { repositoryErrorsHandler, serviceErrorsHandler } from './errors/errors.mappers.js';
import { SQLiteBookmarkLabelRepository } from './features/bookmarkLabel/bookmarkLabel.sql-lite.repository.js';
import { BookmarkUnitOfWork } from './features/bookmarks/bookmark-unit-of-work.js';
import { BookmarkRoutes } from './features/bookmarks/bookmark.routes.js';
import { BookmarkService } from './features/bookmarks/bookmark.services.js';
import { SQLiteBookmarkRepository } from './features/bookmarks/bookmark.sql-lite.repository.js';
import { LabelRoutes } from "./features/labels/label.routes.js";
import { LabelService } from './features/labels/label.services.js';
import { SQLiteLabelRepository } from './features/labels/label.sq-lite.repository.js';

export function registerDependencies(): void {
  const container = Container.getInstance();

  // Register dependencies
  container.initialize([
    BookmarkRoutes,
    LabelRoutes,
    SQLiteBookmarkLabelRepository,
    SQLiteLabelRepository,
    SQLiteBookmarkRepository,
    LabelService,
    BookmarkService,
    BookmarkUnitOfWork
  ]);

  container.registerInstance('db', db, true);
}

registerDependencies();

const routes = {
  basePath: '/api',
  bookmarks: '/bookmarks',
  labels: '/labels',
}

const app = new Hono();

app.use('*', requestId());
app.use('*', addCorsHeaders());
app.use('*', setContentTypeHeaders());
app.use('*', validateAcceptHeader());
app.use('*', addSecurityHeaders());
app.use('*', addCacheHeaders());

const errorHandlers = [serviceErrorsHandler, repositoryErrorsHandler];
app.onError(newErrorHandler(errorHandlers));

const api = app.basePath(routes.basePath);

const bookmarkRoutes = Container.getInstance().resolve<BookmarkRoutes>('BookmarkRoutes');
const labelRoutes = Container.getInstance().resolve<LabelRoutes>('LabelRoutes');

api.route(routes.bookmarks, bookmarkRoutes.routes);
api.route(routes.labels, labelRoutes.routes);

// Start the server
serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
  console.log(`API documentation available at http://localhost:${info.port}/api/docs`);
});

export default app;
