import { db } from "../../db/index.js";
import { BookmarkLabelDTO, InsertBookmarkLabelDTO } from "../../db/dtos/bookmarkLabel.dtos.js";
import { Tx } from "../bookmarks/bookmark-unit-of-work.js";

export interface BookmarkLabelRepository {
  create(data: InsertBookmarkLabelDTO, tx?: db | Tx): Promise<BookmarkLabelDTO>;
  deleteByBookmarkId(bookmarkId: string, tx?: db | Tx): Promise<BookmarkLabelDTO[]>;
  deleteByLabelId(labelId: string): Promise<BookmarkLabelDTO[]>;
}