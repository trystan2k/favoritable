import { eq } from "drizzle-orm";
import { BookmarkLabelDTO, InsertBookmarkLabelDTO } from "../../db/dtos/bookmarkLabel.dtos.js";
import type { db } from "../../db/index.js";
import { bookmarkLabel } from "../../db/schema/bookmark-label.schema.js";
import { tsidGenerator } from "../../utils/tsids-generator.js";
import { Tx } from "../bookmarks/bookmark-unit-of-work.js";
import { BookmarkLabelRepository } from "./bookmarkLabel.types.js";

export class SQLiteBookmarkLabelRepository implements BookmarkLabelRepository {
  constructor(private db: db) { }

  create(data: InsertBookmarkLabelDTO[], tx: db | Tx  = this.db): Promise<BookmarkLabelDTO> {
    return tx.insert(bookmarkLabel).values(data).returning().get();
  }

  findByBookmarkId(bookmarkId: string): Promise<BookmarkLabelDTO[]> {
    throw new Error("Method not implemented.");
  }

  findByLabelId(labelId: string): Promise<BookmarkLabelDTO[]> {
    throw new Error("Method not implemented.");
  }

  delete(id: string, tx: db | Tx  = this.db): Promise<BookmarkLabelDTO> {
    throw new Error("Method not implemented.");
  }

  deleteByBookmarkId(bookmarkId: string, tx: db | Tx  = this.db): Promise<BookmarkLabelDTO[]> {
    return tx.delete(bookmarkLabel).where(eq(bookmarkLabel.bookmarkId, bookmarkId)).returning().all();
  }

  deleteByLabelId(labelId: string, tx: db | Tx  = this.db): Promise<BookmarkLabelDTO[]> {
    throw new Error("Method not implemented.");
  }


}