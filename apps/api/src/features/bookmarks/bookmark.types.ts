import { BookmarkDTO, BookmarkWithLabelsDTO, InsertBookmarkDTO, UpdateBookmarkDTO } from "../../db/dtos/bookmark.dtos.js";
import { db } from "../../db/index.js";
import { Tx } from "./bookmark-unit-of-work.js";
import { GetBookmarksQueryParamsModel } from "./bookmark.models.js";

export interface BookmarkRepository {
  findAll(queryParams: GetBookmarksQueryParamsModel): Promise<BookmarkWithLabelsDTO[]>;
  findById(id: string): Promise<BookmarkWithLabelsDTO | undefined>;
  create(data: InsertBookmarkDTO): Promise<BookmarkDTO>;
  delete(ids: string[]): Promise<string[]>;
  update(data: UpdateBookmarkDTO, tx?: db | Tx): Promise<BookmarkDTO>;
}
