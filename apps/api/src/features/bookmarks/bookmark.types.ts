import { BookmarkDTO, CreateBookmarkDTO, UpdateBookmarkDTO, UpdateStateBookmarkDTO } from "../../db/schema/bookmark.schema.js";
import { LabelDTO, CreateUpdateLabelDTO } from "../../db/schema/label.schema.js";

export type BookmarkWithLabelsDTO = BookmarkDTO & {
  bookmarkLabel: {
    label: LabelDTO;
  }[];
};

export type BookmarkResponseModel = BookmarkDTO & { labels: LabelDTO[] };

export type CursorPaginationParams = {
  limit?: number;
  cursor?: string;
};

export type BookmarksPaginatedDTO = {
  bookmarks: BookmarkWithLabelsDTO[];
  hasMore: boolean;
};

export type BookmarksPaginatedModel = {
  data: BookmarkDTO[];
  pagination: {
    next: string | null;
    self: string | null;
  };
}

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
  savedAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export interface BookmarkRepository {
  findAll(searchString?: string, pagination?: CursorPaginationParams): Promise<BookmarksPaginatedDTO>;
  findById(id: string): Promise<BookmarkWithLabelsDTO | undefined>;
  create(data: CreateBookmarkDTO): Promise<BookmarkDTO>;
  delete(ids: string[]): Promise<BookmarkDTO[] | undefined>;
  update(data: UpdateBookmarkDTO[]): Promise<BookmarkDTO[]>;
  updateLabels(bookmarkId: string, labels: CreateUpdateLabelDTO[]): Promise<void>;
  updateState(id: string, state: UpdateStateBookmarkDTO): Promise<BookmarkDTO>;
}
