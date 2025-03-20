import { Hono } from "hono";
import { db } from "../../db";
import { SQLiteLabelRepository } from "../labels/label.repository";
import { SQLiteBookmarkRepository } from "./bookmark.repository";
import { BookmarkService } from "./bookmark.service";
import { BookmarkFromURL, CreateBookmarkDTO, DeleteMultipleBookmarksDTO, UpdateBookmarkDTO, UpdateStateBookmarkDTO } from "../../db/schema/bookmark.schema";
import { scrapper } from "../../utils/scrapper";
import { CreateUpdateLabelDTO } from "../../db/schema/label.schema";
import { mapErrors } from "../../errors/errors.mapper";
import { OmnivoreBookmarkModel } from "./bookmark.types";

const bookmarkRoutes = new Hono();

const labelRepository = new SQLiteLabelRepository(db);
const bookmarkRepository = new SQLiteBookmarkRepository(db);
const bookmarkService = new BookmarkService(bookmarkRepository, labelRepository);

// Bookmarks - Get
bookmarkRoutes.get('/', async (c) => {
  const searchQuery = c.req.query('q');
  const limit = Number(c.req.query('limit')) || 10;
  const cursor = c.req.query('cursor');

  const bookmarks = await bookmarkService.getBookmarks(searchQuery, cursor, limit);
  return c.json(bookmarks, 200);
});

// Bookmark - Create
bookmarkRoutes.post('/', async (c) => {
  const data = await c.req.json<CreateBookmarkDTO>();
  const bookmark = await bookmarkService.createBookmark(data);

  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${c.req.url}/${bookmark.id}`);
  return c.json(bookmark, 201);
});

// Bookmark - Create from URL
bookmarkRoutes.post('/from-url', async (c) => {
  const data = await c.req.json<BookmarkFromURL>();

  const bookmarkData = await scrapper(data.url);
  const bookmark = await bookmarkService.createBookmark(bookmarkData);

  const location = c.req.url.replace('/from-url', '');

  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${location}/${bookmark.id}`);
  return c.json(bookmark, 200);
})

// Bookmark - Get
bookmarkRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const bookmark = await bookmarkService.getBookmark(id);
  return c.json(bookmark, 200);
});

// Bookmarks - Delete
bookmarkRoutes.delete('/', async (c) => {
  const data = await c.req.json<DeleteMultipleBookmarksDTO>();
  await bookmarkService.deleteBookmarks(data.ids);
  return c.body(null, 204);
});

// Bookmark - Delete
bookmarkRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await bookmarkService.deleteBookmarks([id]);
  return c.body(null, 204);
});

// Bookmarks - Update
bookmarkRoutes.patch('/', async (c) => {
  const data = await c.req.json<UpdateBookmarkDTO[]>();
  const bookmarks = await bookmarkService.updateBookmarks(data);
  return c.json(bookmarks, 200);
});

// Bookmarks - Update labels
bookmarkRoutes.patch('/:id/labels', async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json<CreateUpdateLabelDTO[]>();
  await bookmarkService.updateLabels(id, data);
  return c.json({ message: 'Labels applied' }, 200);
});

// Bookmark - Update state
bookmarkRoutes.patch('/:id/state', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json<UpdateStateBookmarkDTO>();
    const updatedBookmark = await bookmarkService.updateState(id, data);
    return c.json(updatedBookmark, 200);
  } catch (error) {
    throw mapErrors(error, 'bookamrk');
  }
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
