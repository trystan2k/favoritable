import { and, eq, exists, inArray, like, or, sql } from "drizzle-orm";

import { Inject, Service } from "../../core/dependency-injection/di.decorators.js";
import { bookmarkLabel } from "../../db/schema/bookmark-label.schema.js";
import { bookmark } from "../../db/schema/bookmark.schema.js";
import { label } from "../../db/schema/label.schema.js";
import { type DBTransaction } from "../../db/types.js";
import { NotFoundError } from "../../errors/errors.js";
import { GetBookmarksQueryParamsModel } from "./bookmark.models.js";
import { BookmarkDTO, BookmarkRepository, BookmarkWithLabelsDTO, InsertBookmarkDTO, UpdateBookmarkDTO } from "./bookmark.repository.js";

@Service({ name: 'BookmarkRepository', singleton: true })
export class SQLiteBookmarkRepository implements BookmarkRepository {

  constructor(@Inject('db') private db: DBTransaction) { }

  async findAll(queryParams: GetBookmarksQueryParamsModel): Promise<BookmarkWithLabelsDTO[]> {
    const { limit, q: searchQuery, cursor } = queryParams;

    const bookmarks = await this.db.query.bookmark.findMany({
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

    return bookmarks;
  }

  async findById(id: string): Promise<BookmarkWithLabelsDTO | undefined> {
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

    return bookmarkDto;
  }

  create(data: InsertBookmarkDTO): Promise<BookmarkDTO> {
    return this.db.insert(bookmark).values(data).returning().get();
  }

  async delete(ids: string[]): Promise<string[]> {
    const deletedBookmarks = await this.db.delete(bookmark).where(inArray(bookmark.id, ids)).returning().all();
    return deletedBookmarks.map(bookmark => bookmark.id);
  }

  async update(bookmarksData: UpdateBookmarkDTO, tx: DBTransaction = this.db): Promise<BookmarkDTO> {
    const bookmarkUpdated = await tx.update(bookmark).set({ ...bookmarksData, updatedAt: new Date() }).where(eq(bookmark.id, bookmarksData.id)).returning().get();
    if (!bookmarkUpdated) {
      throw new NotFoundError(`bookmark with id ${bookmarksData.id} not found`);
    }

    return bookmarkUpdated;
  }
}
