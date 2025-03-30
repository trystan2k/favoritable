import { eq } from "drizzle-orm";
import { BookmarkLabelDTO, InsertBookmarkLabelDTO } from "../../db/dtos/bookmarkLabel.dtos.js";
import type { db } from "../../db/index.js";
import { bookmarkLabel } from "../../db/schema/bookmark-label.schema.js";
import { Tx } from "../bookmarks/bookmark-unit-of-work.js";
import { BookmarkLabelRepository } from "./bookmarkLabel.types.js";

export class SQLiteBookmarkLabelRepository implements BookmarkLabelRepository {
  constructor(private db: db) { }

  create(data: InsertBookmarkLabelDTO, tx: db | Tx = this.db): Promise<BookmarkLabelDTO> {
    return tx.insert(bookmarkLabel).values(data).returning().get();
  }

  deleteByBookmarkId(bookmarkId: string, tx: db | Tx  = this.db): Promise<BookmarkLabelDTO[]> {
    return tx.delete(bookmarkLabel).where(eq(bookmarkLabel.bookmarkId, bookmarkId)).returning().all();
  }

  deleteByLabelId(labelId: string, tx: db | Tx  = this.db): Promise<BookmarkLabelDTO[]> {
    return tx.delete(bookmarkLabel).where(eq(bookmarkLabel.labelId, labelId)).returning().all();
  }
}