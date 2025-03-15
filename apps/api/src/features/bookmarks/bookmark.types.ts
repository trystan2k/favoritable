import { BookmarkDTO, CreateBookmarkDTO, UpdateBookmarkDTO, UpdateStateBookmarkDTO } from "../../db/schema/bookmark.schema.js";
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
  create(data: CreateBookmarkDTO): Promise<BookmarkDTO>;
  delete(ids: number[]): Promise<BookmarkDTO[] | undefined>;
  update(data: UpdateBookmarkDTO[]): Promise<BookmarkDTO[]>;
  updateLabels(bookmarkId: number, labels: CreateUpdateLabelDTO[]): Promise<void>;
  updateState(id: number, state: UpdateStateBookmarkDTO): Promise<BookmarkDTO>;
}
