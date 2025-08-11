import 'reflect-metadata';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { Container } from './core/dependency-injection/di.container.js';
import {
  addCacheHeaders,
  addCorsHeaders,
  addSecurityHeaders,
  parseAPIVersion,
  setContentTypeHeaders,
} from './core/http.headers.js';
import { loggerMiddleware } from './core/http.logger.js';
import { logger } from './core/logger.js';
import { db } from './db/index.js';
import { errorHandler } from './errors/errors.handlers.js';
import {
  repositoryErrorsHandler,
  serviceErrorsHandler,
} from './errors/errors.mappers.js';
import { SQLiteBookmarkLabelRepository } from './features/bookmarkLabel/bookmarkLabel.sql-lite.repository.js';
import { BookmarkRoutes } from './features/bookmarks/bookmark.routes.js';
import { BookmarkService } from './features/bookmarks/bookmark.services.js';
import { SQLiteBookmarkRepository } from './features/bookmarks/bookmark.sql-lite.repository.js';
import { BookmarkUnitOfWork } from './features/bookmarks/bookmark-unit-of-work.js';
import { LabelRoutes } from './features/labels/label.routes.js';
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
    BookmarkUnitOfWork,
  ]);

  container.registerInstance('db', db, true);
}

registerDependencies();

const routes = {
  basePath: '/api',
  bookmarks: '/bookmarks',
  labels: '/labels',
};

const app = new Hono();

// Request ID must be first to be available in other middleware
app.use('*', requestId());
// Add HTTP logging middleware
app.use('*', loggerMiddleware());
app.use('*', addCorsHeaders());
app.use('*', setContentTypeHeaders());
app.use('*', parseAPIVersion());
app.use('*', addSecurityHeaders());
app.use('*', addCacheHeaders());

const errorHandlers = [serviceErrorsHandler, repositoryErrorsHandler];
app.onError(errorHandler(errorHandlers));

const api = app.basePath(routes.basePath);

const bookmarkRoutes =
  Container.getInstance().resolve<BookmarkRoutes>('BookmarkRoutes');
const labelRoutes = Container.getInstance().resolve<LabelRoutes>('LabelRoutes');

api.route(routes.bookmarks, bookmarkRoutes.routes);
api.route(routes.labels, labelRoutes.routes);

// Health check
app.get('/health', (c) => c.text('OK'));

// Start the server
serve(app, (info) => {
  logger.info(`Server is running on http://localhost:${info.port}`);
  logger.info(
    `API documentation available at http://localhost:${info.port}/api/docs`
  );
});

export default app;
