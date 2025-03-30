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
  findAll(queryParams: GetBookmarksQueryParamsModel): Promise<BookmarkModel[]>;
  findById(id: string): Promise<BookmarkModel>;
  create(data: CreateBookmarkModel): Promise<BookmarkModel>;
  delete(ids: string[]): Promise<string[]>;
  update(data: UpdateBookmarkModel): Promise<BookmarkModel>;
  updateState(id: string, state: UpdateStateBookmarkDTO): Promise<BookmarkDTO>;
}
