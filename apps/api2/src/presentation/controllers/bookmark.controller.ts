import { Context } from 'hono';
import { BookmarkService } from '../../application/services/bookmark.service';
import { AddLabelDTO, CreateBookmarkDTO, UpdateBookmarkDTO } from '../../domain/repositories/bookmark.repository';

export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  async getAllBookmarks(c: Context) {
    try {
      const bookmarks = await this.bookmarkService.getAllBookmarks();
      return c.json(bookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return c.json({ error: 'Failed to fetch bookmarks' }, 500);
    }
  }

  async getBookmarkById(c: Context) {
    const id = c.req.param('id');
    if (id === undefined) {
      return c.json({ error: 'Bookmark ID is required' }, 400);
    }

    try {
      const bookmark = await this.bookmarkService.getBookmarkById(id);
      if (!bookmark) {
        return c.json({ error: 'Bookmark not found' }, 404);
      }
      return c.json(bookmark);
    } catch (error) {
      console.error('Error fetching bookmark:', error);
      return c.json({ error: 'Failed to fetch bookmark' }, 500);
    }
  }

  async createBookmark(c: Context) {
    try {
      const body = await c.req.json<CreateBookmarkDTO>();
      const id = await this.bookmarkService.createBookmark(body);
      return c.json({ id }, 201);
    } catch (error) {
      console.error('Error creating bookmark:', error);
      return c.json({ error: 'Failed to create bookmark' }, 500);
    }
  }

  async updateBookmark(c: Context) {
    const id = c.req.param('id');
    try {
      const body = await c.req.json<UpdateBookmarkDTO>();
      const success = await this.bookmarkService.updateBookmark(id, body);
      if (!success) {
        return c.json({ error: 'Bookmark not found' }, 404);
      }
      return c.json({ success: true });
    } catch (error) {
      console.error('Error updating bookmark:', error);
      return c.json({ error: 'Failed to update bookmark' }, 500);
    }
  }

  async deleteBookmark(c: Context) {
    const id = c.req.param('id');
    try {
      const success = await this.bookmarkService.deleteBookmark(id);
      if (!success) {
        return c.json({ error: 'Bookmark not found' }, 404);
      }
      return c.json({ success: true });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      return c.json({ error: 'Failed to delete bookmark' }, 500);
    }
  }

  async updateBookmarkLabels(c: Context) {
    const id = c.req.param('id');
    try {
      const body = await c.req.json<{ labels: AddLabelDTO[] }>();
      await this.bookmarkService.updateBookmarkLabels(id, body.labels);
      return c.json({ success: true });
    } catch (error) {
      console.error('Error updating bookmark labels:', error);
      if (error instanceof Error) {
        if (error.message === 'Bookmark not found') {
          return c.json({ error: 'Bookmark not found' }, 404);
        } else if (error.message.includes('Label with id')) {
          return c.json({ error: error.message }, 404);
        }
      }
      return c.json({ error: 'Failed to update bookmark labels' }, 500);
    }
  }
}
