import { db } from "../../db/index.js";
import { bookmark } from "../../db/schema/bookmark.schema.js";
import { LabelDTO } from "../labels/label.repository.js";
import { Tx } from "./bookmark-unit-of-work.js";
import { GetBookmarksQueryParamsModel } from "./bookmark.models.js";

export type BookmarkDTO = typeof bookmark.$inferSelect;

export type BookmarkWithLabelsDTO = BookmarkDTO & {
  bookmarkLabel?: {
    label: LabelDTO;
  }[];
};

export type InsertBookmarkDTO = typeof bookmark.$inferInsert;

export type UpdateBookmarkDTO = Partial<InsertBookmarkDTO> & Pick<InsertBookmarkDTO, 'id'>;

export interface BookmarkRepository {
  findAll(queryParams: GetBookmarksQueryParamsModel): Promise<BookmarkWithLabelsDTO[]>;
  findById(id: string): Promise<BookmarkWithLabelsDTO | undefined>;
  create(data: InsertBookmarkDTO): Promise<BookmarkDTO>;
  delete(ids: string[]): Promise<string[]>;
  update(data: UpdateBookmarkDTO, tx?: db | Tx): Promise<BookmarkDTO>;
}
