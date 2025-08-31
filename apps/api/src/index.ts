import 'reflect-metadata';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { auth } from './auth.js';
import { Container } from './core/dependency-injection/di.container.js';
import { logger } from './core/logger.js';
import { db } from './db/index.js';
import { authErrorsHandler } from './errors/auth-errors.mappers.js';
import { errorHandler } from './errors/errors.handlers.js';
import { repositoryErrorsHandler } from './errors/repository-errors.mappers.js';
import { serviceErrorsHandler } from './errors/service-errors.mappers.js';
import { SQLiteBookmarkLabelRepository } from './features/bookmarkLabel/bookmarkLabel.sql-lite.repository.js';
import { BookmarkRoutes } from './features/bookmarks/bookmark.routes.js';
import { BookmarkService } from './features/bookmarks/bookmark.services.js';
import { SQLiteBookmarkRepository } from './features/bookmarks/bookmark.sql-lite.repository.js';
import { BookmarkUnitOfWork } from './features/bookmarks/bookmark-unit-of-work.js';
import { AuthRoutes } from './features/common/auth/auth.routes.js';
import { LabelRoutes } from './features/labels/label.routes.js';
import { LabelService } from './features/labels/label.services.js';
import { SQLiteLabelRepository } from './features/labels/label.sq-lite.repository.js';
import type { HonoEnv } from './middleware/auth.middleware.js';
import {
  addCacheHeaders,
  addCorsHeaders,
  addSecurityHeaders,
  parseAPIVersion,
  setContentTypeHeaders,
} from './middleware/http.headers.middleware.js';
import { loggerMiddleware } from './middleware/http.logger.middleware.js';

export function registerDependencies(): void {
  const container = Container.getInstance();

  // Register dependencies
  container.initialize([
    AuthRoutes,
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
  auth: '',
};

const app = new Hono<HonoEnv>();

// Request ID must be first to be available in other middleware
app.use('*', requestId());
// Add HTTP logging middleware
app.use('*', loggerMiddleware());
app.use('*', addCorsHeaders());
app.use('*', setContentTypeHeaders());
app.use('*', parseAPIVersion());
app.use('*', addSecurityHeaders());
app.use('*', addCacheHeaders());

// Better Auth middleware - retrieve session and user information
app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  c.set('user', session.user);
  c.set('session', session.session);
  return next();
});

const errorHandlers = [
  authErrorsHandler,
  serviceErrorsHandler,
  repositoryErrorsHandler,
];
app.onError(errorHandler(errorHandlers));

const api = app.basePath(routes.basePath);

const authRoutes = Container.getInstance().resolve<AuthRoutes>('AuthRoutes');
const bookmarkRoutes =
  Container.getInstance().resolve<BookmarkRoutes>('BookmarkRoutes');
const labelRoutes = Container.getInstance().resolve<LabelRoutes>('LabelRoutes');

api.route(routes.auth, authRoutes.routes);
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
