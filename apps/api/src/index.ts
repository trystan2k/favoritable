import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { db } from "./db/connection.js";
import { BookmarkService } from './features/bookmarks/bookmark.service.js';
import { requestId } from "hono/request-id";
import { CreateUpdateBookmarkDTO, CreateUpdateLabelDTO } from "./db/schema.js";
import { SQLiteBookmarkRepository } from "./features/bookmarks/bookmark.repository.js";
import { SQLiteLabelRepository } from "./features/labels/label.repository.js";
import { LabelService } from "./features/labels/label.service.js";

const app = new Hono();
app.use('*', requestId())
const api = app.basePath('/api');

const bookmarkRepository = new SQLiteBookmarkRepository(db);
const bookmarkService = new BookmarkService(bookmarkRepository);

const labelRepository = new SQLiteLabelRepository(db);
const labelService = new LabelService(labelRepository);

api.get('/bookmarks', async (c) => {
  const bookmarks = await bookmarkService.getBookmarks();
  return c.json(bookmarks, 200);
});

api.post('/bookmarks', async (c) => {
  const data = await c.req.json<CreateUpdateBookmarkDTO>();
  const bookmarkId = await bookmarkService.createBookmark(data);
  return c.json(bookmarkId, 201);
});

api.get('/bookmarks/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const bookmark = await bookmarkService.getBookmark(id);
  if (!bookmark) {
    return c.json({ message: 'Bookmark not found' }, 404);
  }

  return c.json(bookmark, 200);
});

api.delete('/bookmarks/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const deletedBookmarks = await bookmarkService.deleteBookmark(id);
  if (deletedBookmarks.length === 0) {
    return c.json({ message: 'Bookmark not found' }, 404);
  }

  return c.json({ message: 'Bookmark deleted' }, 200);
});

api.get('/labels', async (c) => {
  const labels = await labelService.getLabels();
  return c.json(labels, 200);
});

api.post('/labels', async (c) => {
  const data = await c.req.json<CreateUpdateLabelDTO>();
  const labelId = await labelService.createLabel(data);
  return c.json(labelId, 201);
});

api.get('/labels/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const label = await labelService.getLabel(id);
  if (!label) {
    return c.json({ message: 'Label not found' }, 404);
  }
  return c.json(label, 200);
});

api.delete('/labels/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const deletedLabels = await labelService.deleteLabel(id);
  if (deletedLabels.length === 0) {
    return c.json({ message: 'Label not found' }, 404);
  }
  return c.json({ message: 'Label deleted' }, 200);
});

api.put('/bookmarks/:id/labels', async (c) => {
  const id = Number(c.req.param('id'));
  const data = await c.req.json<CreateUpdateLabelDTO[]>();
  await bookmarkService.updateLabels(id, data);

  return c.json({ message: 'Labels applied ' }, 200);
});

// Start the server
serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
  console.log(`API documentation available at http://localhost:${info.port}/api/docs`);
});

export default app;
