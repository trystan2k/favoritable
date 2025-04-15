import { Hono } from "hono";
import { Inject, Service } from "../../core/dependency-injection/di.decorators.js";
import { zCustomValidator } from "../../core/validators.wrapper.js";
import { bookmarkIdParamSchema, createBookmarkFromURLSchema, createBookmarkSchema, deleteBookmarksSchema, getBookmarksQueryParamsSchema, importFromHTMLFileQueryParamsSchema, importOmnivoreBookmarksSchema, UpdateBookmarkModel, updateBookmarkSchema } from "./bookmark.models.js";
import { BookmarkService } from "./bookmark.services.js";

@Service({ name: 'BookmarkRoutes' })
export class BookmarkRoutes {
  private bookmarkRoutes: Hono;

  constructor(
    @Inject('BookmarkService') private bookmarkService: BookmarkService
  ) {
    this.bookmarkRoutes = new Hono();
    this.setupRoutes();
  }

  get routes() {
    return this.bookmarkRoutes;
  }

  private setupRoutes() {

// Bookmarks - Get
    this.bookmarkRoutes.get('/', zCustomValidator('query', getBookmarksQueryParamsSchema), async (c) => {
      const queryParams = c.req.valid('query');
      const bookmarks = await this.bookmarkService.getBookmarks(queryParams);
      return c.json(bookmarks, 200);
    });

    // Bookmark - Get
    this.bookmarkRoutes.get('/:id', zCustomValidator('param', bookmarkIdParamSchema), async (c) => {
      const { id } = c.req.valid('param');
      const bookmark = await this.bookmarkService.getBookmark(id);
      return c.json(bookmark, 200);
    });

    // Bookmark - Create
    this.bookmarkRoutes.post('/', zCustomValidator('json', createBookmarkSchema), async (c) => {
      const data = c.req.valid('json');
      const bookmark = await this.bookmarkService.createBookmark(data);

      // Add location header in response, with the url of the newly created bookmark
      c.header('Location', `${c.req.url}/${bookmark.id}`);
      return c.json(bookmark, 201);
    });

    // Bookmark - Create from URL
    this.bookmarkRoutes.post('/from-url', zCustomValidator('json', createBookmarkFromURLSchema), async (c) => {
      const { url } = c.req.valid('json');
      const bookmark = await this.bookmarkService.createBookmarkFromUrl(url);
      const location = c.req.url.replace('/from-url', '');

      // Add location header in response, with the url of the newly created bookmark
      c.header('Location', `${location}/${bookmark.id}`);
      return c.json(bookmark, 201);
    })

    // Bookmark - Update
    this.bookmarkRoutes.patch('/:id', zCustomValidator('json', updateBookmarkSchema), zCustomValidator('param', bookmarkIdParamSchema), async (c) => {
      const data = c.req.valid('json');
      const { id } = c.req.valid('param');
      data.id = id;

      const bookmark = await this.bookmarkService.updateBookmark(data as UpdateBookmarkModel);
      return c.json(bookmark, 200);
    });

    this.bookmarkRoutes.patch('/', zCustomValidator('json', updateBookmarkSchema.array()), async (c) => {
      const data = c.req.valid('json');
      const bookmarks = await this.bookmarkService.updateBookmarks(data as UpdateBookmarkModel[]);
      return c.json(bookmarks, 200);
    })

    // Bookmark - Delete
    this.bookmarkRoutes.delete('/:id', zCustomValidator('param', bookmarkIdParamSchema), async (c) => {
      const { id } = c.req.valid('param');
      await this.bookmarkService.deleteBookmarks([id]);
      return c.body(null, 204);
    });

    // Bookmarks - Delete
    this.bookmarkRoutes.post('/batch-delete', zCustomValidator('json', deleteBookmarksSchema), async (c) => {
      const data = c.req.valid('json');
      const deletedBookmarks = await this.bookmarkService.deleteBookmarks(data.ids);
      return c.json(deletedBookmarks, 200);
    });


    const importRoutes = new Hono();

    // Bookmarks - Import from Omnivore
    importRoutes.post('/omnivore', zCustomValidator('json', importOmnivoreBookmarksSchema.array()), async (c) => {
      const data = c.req.valid('json');
      const bookmarks = await this.bookmarkService.importFromOmnivore(data);
      return c.json(bookmarks, 201);
    });

    // Bookmarks - Import from HTML File Format
    importRoutes.post('/html', zCustomValidator('query', importFromHTMLFileQueryParamsSchema), async (c) => {
      const { folderName } = c.req.valid('query');
      const html = await c.req.text();
      const bookmarks = await this.bookmarkService.importFromHtmlFile(html, folderName);
      return c.json(bookmarks, 201);
    });

    // Bookmarks - Import from Text File Format
    importRoutes.post('/text', async (c) => {
      const data = await c.req.text();
      const bookmarks = await this.bookmarkService.importFromTextFile(data);
      return c.json(bookmarks, 201);
    });

    this.bookmarkRoutes.route('/import', importRoutes);
  }
}
