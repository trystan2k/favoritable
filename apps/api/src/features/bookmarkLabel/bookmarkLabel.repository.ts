import type { bookmarkLabel } from '../../db/schema/bookmark-label.schema.js';
import type { DBTransaction } from '../../db/types.js';

export type BookmarkLabelDTO = typeof bookmarkLabel.$inferSelect;

export type InsertBookmarkLabelDTO = typeof bookmarkLabel.$inferInsert;

export interface BookmarkLabelRepository {
  create(
    data: InsertBookmarkLabelDTO,
    tx?: DBTransaction
  ): Promise<BookmarkLabelDTO>;
  deleteByBookmarkId(
    bookmarkId: string,
    tx?: DBTransaction
  ): Promise<BookmarkLabelDTO[]>;
  deleteByLabelId(labelId: string): Promise<BookmarkLabelDTO[]>;
}
