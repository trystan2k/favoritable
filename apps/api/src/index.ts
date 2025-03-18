import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { cors } from 'hono/cors'

import { db } from "./db/index.js";
import { BookmarkService } from './features/bookmarks/bookmark.service.js';

import { BookmarkFromURL, CreateBookmarkDTO, DeleteMultipleBookmarksDTO, UpdateBookmarkDTO, UpdateStateBookmarkDTO } from "./db/schema/bookmark.schema.js";
import { CreateUpdateLabelDTO } from "./db/schema/label.schema.js";
import { errorHandler } from "./errors/errors.handler.js";
import { SQLiteBookmarkRepository } from "./features/bookmarks/bookmark.repository.js";
import { SQLiteLabelRepository } from "./features/labels/label.repository.js";
import { LabelService } from "./features/labels/label.service.js";
import { scrapper } from "./utils/scrapper.js";
import { mapErrors } from "./errors/errors.mapper.js";
import { OmnivoreBookmarkModel } from "./features/bookmarks/bookmark.types.js";

const routes = {
  basePath: '/api',
  bookmarks: '/bookmarks',
  labels: '/labels',
}

const app = new Hono();
app.use('*', requestId());
app.use('*', cors())
app.onError(errorHandler);
const api = app.basePath(routes.basePath);

const labelRepository = new SQLiteLabelRepository(db);
const labelService = new LabelService(labelRepository);

const bookmarkRepository = new SQLiteBookmarkRepository(db);
const bookmarkService = new BookmarkService(bookmarkRepository, labelRepository);

// Bookmarks - Get
api.get(routes.bookmarks, async (c) => {
  const searchQuery = c.req.query('q');
  const limit = Number(c.req.query('limit')) || 10;
  const cursor = c.req.query('cursor');
  const bookmarks = await bookmarkService.getBookmarks(searchQuery, cursor, limit);
  return c.json(bookmarks, 200);
});

// Bookmark - Create
api.post(routes.bookmarks, async (c) => {
  const data = await c.req.json<CreateBookmarkDTO>();
  const bookmark = await bookmarkService.createBookmark(data);
  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${routes.basePath}${routes.bookmarks}/${bookmark.id}`);
  return c.json(bookmark, 201);
});

// Bookmark - Create from URL
api.post(`${routes.bookmarks}/from-url`, async (c) => {
  const data = await c.req.json<BookmarkFromURL>();
  const bookmarkData = await scrapper(data.url);
  const bookmark = await bookmarkService.createBookmark(bookmarkData);
  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${routes.basePath}${routes.bookmarks}/${bookmark.id}`);
  return c.json(bookmark, 200);
})

// Bookmark - Get
api.get(`${routes.bookmarks}/:id`, async (c) => {
  const id = c.req.param('id');
  const bookmark = await bookmarkService.getBookmark(id);
  return c.json(bookmark, 200);
});

// Bookmarks - Delete
api.delete(routes.bookmarks, async (c) => {
  const data = await c.req.json<DeleteMultipleBookmarksDTO>();
  await bookmarkService.deleteBookmarks(data.ids);
  return c.body(null, 204);
});

// Bookmark - Delete
api.delete(`${routes.bookmarks}/:id`, async (c) => {
  const id = c.req.param('id');
  await bookmarkService.deleteBookmarks([id]);
  return c.body(null, 204);
});

// Bookmarks - Update labels
api.patch(`${routes.bookmarks}/:id/labels`, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json<CreateUpdateLabelDTO[]>();
  await bookmarkService.updateLabels(id, data);
  return c.json({ message: 'Labels applied' }, 200);
});

// Bookmarks - Update
api.patch(routes.bookmarks, async (c) => {
  const data = await c.req.json<UpdateBookmarkDTO[]>();
  const bookmarks = await bookmarkService.updateBookmarks(data);
  return c.json(bookmarks, 200);
});

// Bookmark - Update state
api.patch(`${routes.bookmarks}/:id/state`, async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json<UpdateStateBookmarkDTO>();
    const updatedBookmark = await bookmarkService.updateState(id, data);
    return c.json(updatedBookmark, 200);
  } catch (error) {
    throw mapErrors(error, 'bookamrk');
  }
});

// Bookmarks - Import from Omnivore
api.post(`${routes.bookmarks}/import/omnivore`, async (c) => {
  try {
    const data = await c.req.json<OmnivoreBookmarkModel[]>();
    const bookmarks = await bookmarkService.importFromOmnivore(data);
    return c.json(bookmarks, 201);
  } catch (error) {
    throw mapErrors(error, 'bookmarks');
  }
});

// Bookmarks - Import from Chrome
api.post(`${routes.bookmarks}/import/chrome`, async (c) => {
  try {
    const folderName = c.req.query('folder');
    const html = await c.req.text();
    const bookmarks = await bookmarkService.importFromChrome(html, folderName);
    return c.json(bookmarks, 201);
  } catch (error) {
    throw mapErrors(error, 'bookmarks');
  }
});

// Labels - Get
api.get(routes.labels, async (c) => {
  const searchQuery = c.req.query('q');
  const labels = await labelService.getLabels(searchQuery);
  return c.json(labels, 200);
});

// Labels - Create
api.post(routes.labels, async (c) => {
  const data = await c.req.json<CreateUpdateLabelDTO>();
  const label = await labelService.createLabel(data);
  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${routes.basePath}${routes.labels}/${label.id}`);
  return c.json(label, 201);
});

// Label - Get
api.get(`${routes.labels}/:id`, async (c) => {
  const id = c.req.param('id');
  const label = await labelService.getLabel(id);
  return c.json(label, 200);
});

// Label - Delete
api.delete(`${routes.labels}/:id`, async (c) => {
  const id = c.req.param('id');
  await labelService.deleteLabel(id);
  return c.body(null, 204);
});

// Label - Update
api.put(`${routes.labels}/:id`, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json<CreateUpdateLabelDTO>();
  const updatedLabel = await labelService.updateLabel(id, data);
  return c.json(updatedLabel, 200);
});

// Start the server
serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
  console.log(`API documentation available at http://localhost:${info.port}/api/docs`);
});

export default app;
