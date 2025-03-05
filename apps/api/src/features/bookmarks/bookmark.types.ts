import { CreateUpdateBookmarkDTO, CreateUpdateLabelDTO, BookmarkDTO, LabelDTO } from "../../db/schema.js";

export type BookmarkWithLabelsDTO = BookmarkDTO & {
  bookmarksLabel: {
    label: {
      id: number;
      name: string;
      color: string | null;
    };
  }[];
};

export type BookmarkResponseModel = BookmarkDTO & { labels: LabelDTO[] };

export interface BookmarkRepository {
  findAll(): Promise<BookmarkWithLabelsDTO[]>;
  findById(id: number): Promise<BookmarkWithLabelsDTO | undefined>;
  create(data: CreateUpdateBookmarkDTO): Promise<number>;
  update(id: number, data: CreateUpdateBookmarkDTO): Promise<boolean>;
  delete(id: number): Promise<Pick<BookmarkDTO, "id">[]>;
  updateLabels(bookmarkId: number, labels: CreateUpdateLabelDTO[]): Promise<void>;
}
