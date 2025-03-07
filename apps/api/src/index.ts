import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { db } from "./db";
import { BookmarkService } from './features/bookmarks/bookmark.service';
import { requestId } from "hono/request-id";

import { SQLiteBookmarkRepository } from "./features/bookmarks/bookmark.repository";
import { SQLiteLabelRepository } from "./features/labels/label.repository";
import { LabelService } from "./features/labels/label.service";
import { CreateUpdateBookmarkDTO } from "./db/schema/bookmark.schema";
import { CreateUpdateLabelDTO } from "./db/schema/label.schema";
import { LibsqlError } from "@libsql/client/.";

const routes = {
  basePath: '/api',
  bookmarks: '/bookmarks',
  labels: '/labels',
}

const app = new Hono();
app.use('*', requestId())
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

  try {
    const bookmark = await bookmarkService.createBookmark(data);
    // Add location header in response, with the url of the newly created bookmark
    c.header('Location', `${routes.basePath}${routes.bookmarks}/${bookmark.id}`);

    return c.json(bookmark, 201);
  } catch (error: unknown) {
    if ((error as LibsqlError).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return c.json({ message: 'Bookmark already exists' }, 409);
    }

    return c.json({ message: 'Something went wrong' }, 500);
  }

});

api.get(`${routes.bookmarks}/:id`, async (c) => {
  const id = Number(c.req.param('id'));
  const bookmark = await bookmarkService.getBookmark(id);
  if (!bookmark) {
    return c.json({ message: 'Bookmark not found' }, 404);
  }

  return c.json(bookmark, 200);
});

api.delete(`${routes.bookmarks}/:id`, async (c) => {
  const id = Number(c.req.param('id'));
  const deletedBookmark = await bookmarkService.deleteBookmark(id);
  if (!deletedBookmark) {
    return c.json({ message: 'Bookmark not found' }, 404);
  }

  return c.body(null, 204);
});

api.get(routes.labels, async (c) => {
  const labels = await labelService.getLabels();
  return c.json(labels, 200);
});

api.post(routes.labels, async (c) => {
  const data = await c.req.json<CreateUpdateLabelDTO>();
  const labelId = await labelService.createLabel(data);
  return c.json(labelId, 201);
});

api.get(`${routes.labels}/:id`, async (c) => {
  const id = Number(c.req.param('id'));
  const label = await labelService.getLabel(id);
  if (!label) {
    return c.json({ message: 'Label not found' }, 404);
  }
  return c.json(label, 200);
});

api.delete(`${routes.labels}/:id`, async (c) => {
  const id = Number(c.req.param('id'));
  const deletedLabels = await labelService.deleteLabel(id);
  if (deletedLabels.length === 0) {
    return c.json({ message: 'Label not found' }, 404);
  }
  return c.json({ message: 'Label deleted' }, 200);
});

api.put(`${routes.labels}/:id`, async (c) => {
  const id = Number(c.req.param('id'));
  const data = await c.req.json<CreateUpdateLabelDTO>();
  const updatedLabel = await labelService.updateLabel(id, data);
  if (!updatedLabel) {
    return c.json({ message: 'Label not found' }, 404);
  }
  return c.json(updatedLabel, 200);
});

api.put(`${routes.bookmarks}/:id/labels`, async (c) => {
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
