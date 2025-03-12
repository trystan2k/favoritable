import { BookmarkDTO, CreateUpdateBookmarkDTO } from "../../db/schema/bookmark.schema.js";
import { LabelDTO, CreateUpdateLabelDTO } from "../../db/schema/label.schema.js";

export type BookmarkWithLabelsDTO = BookmarkDTO & {
  bookmarkLabel: {
    label: LabelDTO;
  }[];
};

export type BookmarkResponseModel = BookmarkDTO & { labels: LabelDTO[] };

export interface BookmarkRepository {
  findAll(): Promise<BookmarkWithLabelsDTO[]>;
  findById(id: number): Promise<BookmarkWithLabelsDTO | undefined>;
  create(data: CreateUpdateBookmarkDTO): Promise<BookmarkDTO>;
  delete(id: number): Promise<BookmarkDTO | undefined>;
  updateLabels(bookmarkId: number, labels: CreateUpdateLabelDTO[]): Promise<void>;
}
