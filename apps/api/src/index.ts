import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { SQLiteBookmarkRepository } from "./repositories/bookmark.repository.js";
import { db } from "./db/connection.js";
import { BookmarkService } from './services/bookmark.service.js';

const app = new Hono();
const api = app.basePath('/api');

const bookmarkRepository = new SQLiteBookmarkRepository(db);
const bookmarkService = new BookmarkService(bookmarkRepository);

api.get('/bookmarks', async (c) => {
  const bookmarks = await bookmarkService.getBookmarks();
  return c.json(bookmarks);
});

api.post('/bookmarks', async (c) => {
  const data = await c.req.json();
  const bookmarkId = await bookmarkService.createBookmark(data);
  return c.json(bookmarkId);
});

api.get('/bookmarks/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const bookmark = await bookmarkService.getBookmark(id);
  if (!bookmark) {
    return c.json({ message: 'Bookmark not found' }, 404);
  }

  return c.json(bookmark);
});

// Start the server
serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
  console.log(`API documentation available at http://localhost:${info.port}/api/docs`);
});

export default app;
