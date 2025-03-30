import { Hono } from "hono";
import { zValidator } from "../../core/validators.wrapper";
import { db } from "../../db";
import { InsertLabelDTO } from "../../db/dtos/label.dtos";
import { UpdateStateBookmarkDTO } from "../../db/schema/bookmark.schema";
import { mapErrors } from "../../errors/errors.mapper";
import { scrapper } from "../../utils/scrapper";
import { BookmarkUnitOfWork } from "./bookmark-unit-of-work";
import { bookmarkIdParamSchema, BookmarkModel, createBookmarkFromURLSchema, createBookmarkSchema, deleteBookmarksSchema, getBookmarksQueryParamsSchema, UpdateBookmarkModel, updateBookmarkSchema } from "./bookmark.models";
import { BookmarkService } from "./bookmark.service";
import { OmnivoreBookmarkModel } from "./bookmark.types";

const bookmarkRoutes = new Hono();

// const labelRepository = new SQLiteLabelRepository(db);
// const bookmarkRepository = new SQLiteBookmarkRepository(db);
const bookmarkUnitOfWork = new BookmarkUnitOfWork();
const bookmarkService = new BookmarkService(bookmarkUnitOfWork);

// Bookmarks - Get
bookmarkRoutes.get('/', zValidator('query', getBookmarksQueryParamsSchema), async (c) => {
  const queryParams = c.req.valid('query');
  const bookmarks = await bookmarkService.getBookmarks(queryParams);
  return c.json(bookmarks, 200);
});

// Bookmark - Get
bookmarkRoutes.get('/:id', zValidator('param', bookmarkIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const bookmark = await bookmarkService.getBookmark(id);
  return c.json(bookmark, 200);
});

// Bookmark - Create
bookmarkRoutes.post('/', zValidator('json', createBookmarkSchema), async (c) => {
  const data = c.req.valid('json');
  const bookmark = await bookmarkService.createBookmark(data);

  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${c.req.url}/${bookmark.id}`);
  return c.json(bookmark, 201);
});

// Bookmark - Create from URL
bookmarkRoutes.post('/from-url', zValidator('json', createBookmarkFromURLSchema), async (c) => {
  const data = await c.req.valid('json');

  const bookmarkData = await scrapper(data.url);
  const bookmark = await bookmarkService.createBookmark(bookmarkData);

  const location = c.req.url.replace('/from-url', '');

  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${location}/${bookmark.id}`);
  return c.json(bookmark, 201);
})

// Bookmark - Update
bookmarkRoutes.patch('/:id', zValidator('json', updateBookmarkSchema), zValidator('param', bookmarkIdParamSchema), async (c) => {
  const data = await c.req.valid('json');
  const { id } = c.req.valid('param');
  data.id = id;

  const bookmark = await bookmarkService.updateBookmark(data);
  return c.json(bookmark, 200);
});

bookmarkRoutes.patch('/', zValidator('json', updateBookmarkSchema.array()), async (c) => {
  const data = await c.req.valid('json');

  const bookmarks: BookmarkModel[] = [];
  for (const bookmark of data) {
    const updatedBookmark = await bookmarkService.updateBookmark(bookmark);
    bookmarks.push(updatedBookmark);
  }

  return c.json(bookmarks, 200);
})

// Bookmark - Delete
bookmarkRoutes.delete('/:id', zValidator('param', bookmarkIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const deletedBookmarks = await bookmarkService.deleteBookmarks([id]);
  return c.body(null, 204);
});

// Bookmarks - Delete
bookmarkRoutes.post('/batch-delete', zValidator('json', deleteBookmarksSchema), async (c) => {
  const data = c.req.valid('json');
  const deletedBookmarks = await bookmarkService.deleteBookmarks(data.ids);
  return c.json(deletedBookmarks, 200);
});


const importRoutes = new Hono();

// Bookmarks - Import from Omnivore
importRoutes.post('/omnivore', async (c) => {
  try {
    const data = await c.req.json<OmnivoreBookmarkModel[]>();
    const bookmarks = await bookmarkService.importFromOmnivore(data);
    return c.json(bookmarks, 201);
  } catch (error) {
    throw mapErrors(error, 'bookmarks');
  }
});

// Bookmarks - Import from HTML File Format
importRoutes.post('/html', async (c) => {
  try {
    const folderName = c.req.query('folder');
    const html = await c.req.text();
    const bookmarks = await bookmarkService.importFromHtmlFile(html, folderName);
    return c.json(bookmarks, 201);
  } catch (error) {
    throw mapErrors(error, 'bookmarks');
  }
});

// Bookmarks - Import from Text File Format
importRoutes.post('/text', async (c) => {
  try {
    const data = await c.req.text();
    const bookmarks = await bookmarkService.importFromTextFile(data);
    return c.json(bookmarks, 201);
  } catch (error) {
    throw mapErrors(error, 'bookmarks');
  }
});

bookmarkRoutes.route('/import', importRoutes);

export { bookmarkRoutes };
