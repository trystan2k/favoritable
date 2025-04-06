import { Hono } from "hono";
import { zCustomValidator } from "../../core/validators.wrapper.js";
import { db } from "../../db/index.js";
import { SQLiteBookmarkLabelRepository } from "../bookmarkLabel/bookmarkLabel.sql-lite.repository.js";
import { SQLiteLabelRepository } from "../labels/label.sq-lite.repository.js";
import { BookmarkUnitOfWork } from "./bookmark-unit-of-work.js";
import { bookmarkIdParamSchema, createBookmarkFromURLSchema, createBookmarkSchema, deleteBookmarksSchema, getBookmarksQueryParamsSchema, importFromHTMLFileQueryParamsSchema, importOmnivoreBookmarksSchema, UpdateBookmarkModel, updateBookmarkSchema } from "./bookmark.models.js";
import { BookmarkService } from "./bookmark.service.js";
import { SQLiteBookmarkRepository } from "./bookmark.sql-lite.repository.js";

const bookmarkRoutes = new Hono();

const labelRepository = new SQLiteLabelRepository(db);
const bookmarkRepository = new SQLiteBookmarkRepository(db);
const bookmarkLabelRepository = new SQLiteBookmarkLabelRepository(db);
const bookmarkUnitOfWork = new BookmarkUnitOfWork(bookmarkRepository, labelRepository, bookmarkLabelRepository);
const bookmarkService = new BookmarkService(bookmarkUnitOfWork);

// Bookmarks - Get
bookmarkRoutes.get('/', zCustomValidator('query', getBookmarksQueryParamsSchema), async (c) => {
  const queryParams = c.req.valid('query');
  const bookmarks = await bookmarkService.getBookmarks(queryParams);
  return c.json(bookmarks, 200);
});

// Bookmark - Get
bookmarkRoutes.get('/:id', zCustomValidator('param', bookmarkIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const bookmark = await bookmarkService.getBookmark(id);
  return c.json(bookmark, 200);
});

// Bookmark - Create
bookmarkRoutes.post('/', zCustomValidator('json', createBookmarkSchema), async (c) => {
  const data = c.req.valid('json');
  const bookmark = await bookmarkService.createBookmark(data);

  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${c.req.url}/${bookmark.id}`);
  return c.json(bookmark, 201);
});

// Bookmark - Create from URL
bookmarkRoutes.post('/from-url', zCustomValidator('json', createBookmarkFromURLSchema), async (c) => {
  const { url } = c.req.valid('json');
  const bookmark = await bookmarkService.createBookmarkFromUrl(url);
  const location = c.req.url.replace('/from-url', '');

  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${location}/${bookmark.id}`);
  return c.json(bookmark, 201);
})

// Bookmark - Update
bookmarkRoutes.patch('/:id', zCustomValidator('json', updateBookmarkSchema), zCustomValidator('param', bookmarkIdParamSchema), async (c) => {
  const data = c.req.valid('json');
  const { id } = c.req.valid('param');
  data.id = id;

  const bookmark = await bookmarkService.updateBookmark(data as UpdateBookmarkModel);
  return c.json(bookmark, 200);
});

bookmarkRoutes.patch('/', zCustomValidator('json', updateBookmarkSchema.array()), async (c) => {
  const data = c.req.valid('json');
  const bookmarks = await bookmarkService.updateBookmarks(data as UpdateBookmarkModel[]);
  return c.json(bookmarks, 200);
})

// Bookmark - Delete
bookmarkRoutes.delete('/:id', zCustomValidator('param', bookmarkIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  await bookmarkService.deleteBookmarks([id]);
  return c.body(null, 204);
});

// Bookmarks - Delete
bookmarkRoutes.post('/batch-delete', zCustomValidator('json', deleteBookmarksSchema), async (c) => {
  const data = c.req.valid('json');
  const deletedBookmarks = await bookmarkService.deleteBookmarks(data.ids);
  return c.json(deletedBookmarks, 200);
});


const importRoutes = new Hono();

// Bookmarks - Import from Omnivore
importRoutes.post('/omnivore', zCustomValidator('json', importOmnivoreBookmarksSchema.array()), async (c) => {
  const data = c.req.valid('json');
  const bookmarks = await bookmarkService.importFromOmnivore(data);
  return c.json(bookmarks, 201);
});

// Bookmarks - Import from HTML File Format
importRoutes.post('/html', zCustomValidator('query', importFromHTMLFileQueryParamsSchema), async (c) => {
  const { folderName } = c.req.valid('query');
  const html = await c.req.text();
  const bookmarks = await bookmarkService.importFromHtmlFile(html, folderName);
  return c.json(bookmarks, 201);
});

// Bookmarks - Import from Text File Format
importRoutes.post('/text', async (c) => {
  const data = await c.req.text();
  const bookmarks = await bookmarkService.importFromTextFile(data);
  return c.json(bookmarks, 201);
});

bookmarkRoutes.route('/import', importRoutes);

export { bookmarkRoutes };
