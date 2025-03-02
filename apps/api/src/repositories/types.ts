import { BookmarkDTO, CreateUpdateBookmarkDTO, CreateUpdateLabelDTO } from "../db/schema.js";

export interface BookmarkRepository {
  findAll(): Promise<BookmarkDTO[]>;
  findById(id: number): Promise<BookmarkDTO | null | undefined>;
  create(data: CreateUpdateBookmarkDTO): Promise<number>;
  update(id: number, data: CreateUpdateBookmarkDTO): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  updateLabels(bookmarkId: number, labels: CreateUpdateLabelDTO[]): Promise<void>;
}
