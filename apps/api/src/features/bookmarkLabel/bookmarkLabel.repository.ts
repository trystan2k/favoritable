import { db } from "../../db/index.js";
import { Tx } from "../bookmarks/bookmark-unit-of-work.js";
import { bookmarkLabel } from "../../db/schema/bookmark-label.schema.js";

export type BookmarkLabelDTO = typeof bookmarkLabel.$inferSelect;

export type InsertBookmarkLabelDTO = typeof bookmarkLabel.$inferInsert;

export interface BookmarkLabelRepository {
  create(data: InsertBookmarkLabelDTO, tx?: db | Tx): Promise<BookmarkLabelDTO>;
  deleteByBookmarkId(bookmarkId: string, tx?: db | Tx): Promise<BookmarkLabelDTO[]>;
  deleteByLabelId(labelId: string): Promise<BookmarkLabelDTO[]>;
}