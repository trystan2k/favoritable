import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { db } from "./db/index.js";
import { BookmarkService } from './features/bookmarks/bookmark.service.js';

import { CreateUpdateBookmarkDTO } from "./db/schema/bookmark.schema.js";
import { CreateUpdateLabelDTO } from "./db/schema/label.schema.js";
import { errorHandler } from "./errors/errors.handler.js";
import { SQLiteBookmarkRepository } from "./features/bookmarks/bookmark.repository.js";
import { SQLiteLabelRepository } from "./features/labels/label.repository.js";
import { LabelService } from "./features/labels/label.service.js";

const routes = {
  basePath: '/api',
  bookmarks: '/bookmarks',
  labels: '/labels',
}

const app = new Hono();
app.use('*', requestId());
app.onError(errorHandler);
const api = app.basePath(routes.basePath);

const bookmarkRepository = new SQLiteBookmarkRepository(db);
const bookmarkService = new BookmarkService(bookmarkRepository);

const labelRepository = new SQLiteLabelRepository(db);
const labelService = new LabelService(labelRepository);

api.get(routes.bookmarks, async (c) => {
  const bookmarks = await bookmarkService.getBookmarks();
  return c.json(bookmarks, 200);
});

api.post(routes.bookmarks, async (c) => {
  const data = await c.req.json<CreateUpdateBookmarkDTO>();
  const bookmark = await bookmarkService.createBookmark(data);
  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${routes.basePath}${routes.bookmarks}/${bookmark.id}`);
  return c.json(bookmark, 201);
});

api.get(`${routes.bookmarks}/:id`, async (c) => {
  const id = Number(c.req.param('id'));
  const bookmark = await bookmarkService.getBookmark(id);
  return c.json(bookmark, 200);
});

api.delete(`${routes.bookmarks}/:id`, async (c) => {
  const id = Number(c.req.param('id'));
  await bookmarkService.deleteBookmark(id);
  return c.body(null, 204);
});

api.get(routes.labels, async (c) => {
  const labels = await labelService.getLabels();
  return c.json(labels, 200);
});

api.post(routes.labels, async (c) => {
  const data = await c.req.json<CreateUpdateLabelDTO>();
  const label = await labelService.createLabel(data);
  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${routes.basePath}${routes.labels}/${label.id}`);
  return c.json(label, 201);
});

api.get(`${routes.labels}/:id`, async (c) => {
  const id = Number(c.req.param('id'));
  const label = await labelService.getLabel(id);
  return c.json(label, 200);
});

api.delete(`${routes.labels}/:id`, async (c) => {
  const id = Number(c.req.param('id'));
  await labelService.deleteLabel(id);
  return c.body(null, 204);
});

api.put(`${routes.labels}/:id`, async (c) => {
  const id = Number(c.req.param('id'));
  const data = await c.req.json<CreateUpdateLabelDTO>();
  const updatedLabel = await labelService.updateLabel(id, data);
  return c.json(updatedLabel, 200);
});

api.put(`${routes.bookmarks}/:id/labels`, async (c) => {
  const id = Number(c.req.param('id'));
  const data = await c.req.json<CreateUpdateLabelDTO[]>();
  await bookmarkService.updateLabels(id, data);
  return c.json({ message: 'Labels applied' }, 200);
});

// Start the server
serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
  console.log(`API documentation available at http://localhost:${info.port}/api/docs`);
});

export default app;
