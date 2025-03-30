import { BookmarkWithLabelsDTO, InsertBookmarkDTO } from "../../db/dtos/bookmark.dtos.js";
import { InsertLabelDTO } from "../../db/dtos/label.dtos.js";
import { BookmarkDTO, UpdateStateBookmarkDTO } from "../../db/schema/bookmark.schema.js";
import { BookmarkModel, CreateBookmarkModel, GetBookmarksQueryParamsModel, UpdateBookmarkModel } from "./bookmark.models.js";

export type OmnivoreBookmarkModel = {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string | null;
  url: string;
  state: string;
  readingProgress: number;
  thumbnail: string | null;
  labels: string[];
  savedAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
};

export interface BookmarkRepository {
  findAll(queryParams: GetBookmarksQueryParamsModel): Promise<BookmarkWithLabelsDTO[]>;
  findById(id: string): Promise<BookmarkWithLabelsDTO>;
  create(data: InsertBookmarkDTO): Promise<BookmarkDTO>;
  delete(ids: string[]): Promise<string[]>;
  update(data: InsertBookmarkDTO): Promise<BookmarkDTO>;
}
