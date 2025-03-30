import { BookmarkLabelDTO, InsertBookmarkLabelDTO } from "../../db/dtos/bookmarkLabel.dtos";

export interface BookmarkLabelRepository {
  create(data: InsertBookmarkLabelDTO): Promise<BookmarkLabelDTO>;
  findByBookmarkId(bookmarkId: string): Promise<BookmarkLabelDTO[]>;
  findByLabelId(labelId: string): Promise<BookmarkLabelDTO[]>;
  delete(id: string): Promise<BookmarkLabelDTO>;
  deleteByBookmarkId(bookmarkId: string): Promise<BookmarkLabelDTO[]>;
  deleteByLabelId(labelId: string): Promise<BookmarkLabelDTO[]>;
}