import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import db from './database/index.js';
import { SQLiteBookmarkRepository } from './infrastructure/repositories/sqlite-bookmark.repository.js';
import { BookmarkService } from './application/services/bookmark.service.js';
import { BookmarkController } from './presentation/controllers/bookmark.controller.js';
import { registry } from './openapi/index.js';

const app = new Hono();
const api = new OpenAPIHono();
app.route('/api', api);

// Initialize dependencies
const bookmarkRepository = new SQLiteBookmarkRepository(db);
const bookmarkService = new BookmarkService(bookmarkRepository);
const bookmarkController = new BookmarkController(bookmarkService);

// Register routes with OpenAPI validation
const routes = registry.build();
api.openapi('/bookmarks', routes.paths['/bookmarks'].get, (c) => bookmarkController.getAllBookmarks(c));
api.openapi('/bookmarks/{id}', routes.paths['/bookmarks/{id}'].get, (c) => bookmarkController.getBookmarkById(c));
api.openapi('/bookmarks', routes.paths['/bookmarks'].post, (c) => bookmarkController.createBookmark(c));
api.openapi('/bookmarks/{id}', routes.paths['/bookmarks/{id}'].put, (c) => bookmarkController.updateBookmark(c));
api.openapi('/bookmarks/{id}', routes.paths['/bookmarks/{id}'].delete, (c) => bookmarkController.deleteBookmark(c));
api.openapi('/bookmarks/{id}/labels', routes.paths['/bookmarks/{id}/labels'].put, (c) => bookmarkController.updateBookmarkLabels(c));

// Serve OpenAPI documentation
api.doc('/docs', {
  openapi: '3.0.0',
  info: {
    title: 'Bookmark API',
    version: '1.0.0'
  }
});

// Start the server
serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
  console.log(`API documentation available at http://localhost:${info.port}/api/docs`);
});
