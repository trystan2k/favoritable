import type { bookmark } from '../../db/schema/bookmark.schema.js';
import type { DBTransaction } from '../../db/types.js';
import type { LabelDTO } from '../labels/label.repository.js';
import type { GetBookmarksQueryParamsModel } from './bookmark.models.js';

export type BookmarkDTO = typeof bookmark.$inferSelect;

export type BookmarkWithLabelsDTO = BookmarkDTO & {
  bookmarkLabel?: {
    label: LabelDTO;
  }[];
};

export type InsertBookmarkDTO = typeof bookmark.$inferInsert;

export type UpdateBookmarkDTO = Partial<InsertBookmarkDTO> &
  Pick<InsertBookmarkDTO, 'id'>;

export interface BookmarkRepository {
  findAll(
    queryParams: GetBookmarksQueryParamsModel,
    userId?: string
  ): Promise<BookmarkWithLabelsDTO[]>;
  findById(id: string): Promise<BookmarkWithLabelsDTO | undefined>;
  create(data: InsertBookmarkDTO): Promise<BookmarkDTO>;
  delete(ids: string[]): Promise<string[]>;
  update(data: UpdateBookmarkDTO, tx?: DBTransaction): Promise<BookmarkDTO>;
}
