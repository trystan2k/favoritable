import { and, eq, exists, inArray, like, or, sql } from "drizzle-orm";
import { BookmarkWithLabelsDTO } from "../../db/dtos/bookmark.dtos.js";
import type { db } from "../../db/index.js";
import { UpdateStateBookmarkDTO, bookmark } from "../../db/schema/bookmark.schema.js";
import { bookmarkLabel, label } from "../../db/schema/index.js";
import { NotFoundError } from "../../errors/errors.js";
import { Tx } from "./bookmark-unit-of-work.js";
import { mapBookmarkDTOToBookmarkModel, mapCreateBookmarkModelToInsertBookmarkDTO } from "./bookmark.mappers.js";
import { BookmarkModel, CreateBookmarkModel, GetBookmarksQueryParamsModel, UpdateBookmarkModel } from "./bookmark.models.js";
import { BookmarkRepository } from "./bookmark.types.js";
export class SQLiteBookmarkRepository implements BookmarkRepository {

  constructor(private db: db) { }

  async findAll(queryParams: GetBookmarksQueryParamsModel) {
    const { limit, q: searchQuery, cursor } = queryParams;

    const bookmarks: BookmarkWithLabelsDTO[] = await this.db.query.bookmark.findMany({
      limit,
      orderBy(fields, { desc }) {
        return desc(fields.id);
      },
      where: (bookmark, { lt }) => {
        const conditions = [];

        if (cursor) {
          conditions.push(lt(bookmark.id, cursor));
        }

        if (searchQuery) {
          const searchTerms = searchQuery.split(',').map(term => term.trim());
          conditions.push(
            or(
              ...searchTerms.flatMap(term => [
                like(bookmark.title, `%${term}%`),
                like(bookmark.description, `%${term}%`),
                like(bookmark.author, `%${term}%`),
                exists(
                  this.db.select()
                    .from(bookmarkLabel)
                    .innerJoin(label, eq(label.id, bookmarkLabel.labelId))
                    .where(sql`${bookmarkLabel.bookmarkId} = ${bookmark.id} AND ${label.name} LIKE ${`%${term}%`}`)
                )
              ])
            )
          );
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      with: {
        bookmarkLabel: {
          columns: {},
          with: {
            label: true
          }
        }
      }
    });

    return bookmarks.map(bookmark => mapBookmarkDTOToBookmarkModel(bookmark));
  }

  async findById(id: string) {
    const bookmarkDto: BookmarkWithLabelsDTO | undefined = await this.db.query.bookmark.findFirst({
      where: (bookmark, { eq }) => eq(bookmark.id, id),
      with: {
        bookmarkLabel: {
          columns: {},
          with: {
            label: true
          }
        }
      }
    });

    // TODO: remove this, it should be handled by the service layer, not the repository one
    if (!bookmarkDto) {
      throw new NotFoundError(`bookmark with id ${id} not found`);
    }

    return mapBookmarkDTOToBookmarkModel(bookmarkDto);
  }

  async create(data: CreateBookmarkModel): Promise<BookmarkModel> {
    const newBookmark = mapCreateBookmarkModelToInsertBookmarkDTO(data);
    const bookmarkDto = await this.db.insert(bookmark).values(newBookmark).returning().get();
    return mapBookmarkDTOToBookmarkModel(bookmarkDto);
  }

  async delete(ids: string[]) {
    const deletedBookmarks = await this.db.delete(bookmark).where(inArray(bookmark.id, ids)).returning().all();
    if (deletedBookmarks.length === 0) {
      throw new NotFoundError(`bookmarks with ids ${ids} not found`);
    }

    return deletedBookmarks.map(bookmark => bookmark.id);
  }

  async update(bookmarksData: UpdateBookmarkModel, tx: db | Tx = this.db): Promise<BookmarkModel> {
    // @ts-expect-error TODO
    const bookmarkUpdated = await tx.update(bookmark).set({ ...bookmarksData, updatedAt: new Date() }).where(eq(bookmark.id, bookmarksData.id)).returning().get();
    if (!bookmarkUpdated) {
      throw new NotFoundError(`bookmark with id ${bookmarksData.id} not found`);
    }

    return { ...bookmarkUpdated, labels: [] };
  }

  updateState(id: string, state: UpdateStateBookmarkDTO) {
    return this.db.update(bookmark).set({ ...state, updatedAt: new Date() }).where(eq(bookmark.id, id)).returning().get();
  }
}
