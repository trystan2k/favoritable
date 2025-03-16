import { and, eq, exists, inArray, like, or, sql } from "drizzle-orm";
import type { db } from "../../db/index.js";
import { CreateBookmarkDTO, UpdateBookmarkDTO, UpdateStateBookmarkDTO, bookmark } from "../../db/schema/bookmark.schema.js";
import { bookmarkLabel } from "../../db/schema/index.js";
import { CreateUpdateLabelDTO, label } from "../../db/schema/label.schema.js";
import { tsidGenerator } from "../../utils/tsids-generator.js";
import { BookmarkRepository, CursorPaginationParams } from "./bookmark.types.js";

export class SQLiteBookmarkRepository implements BookmarkRepository {

  constructor(private db: db) { }

  async findAll(searchQuery?: string, pagination?: CursorPaginationParams) {
    const limit = pagination?.limit || 10;
    const cursor = pagination?.cursor;

    const bookmarks = await this.db.query.bookmark.findMany({
      limit: limit + 1,
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

    // Check if there are more results
    const hasMore = bookmarks.length > limit;
    const items = hasMore ? bookmarks.slice(0, limit) : bookmarks;

    return {
      bookmarks: items,
      hasMore,
    }
  }

  findById(id: string) {
    return this.db.query.bookmark.findFirst({
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
  }

  create(data: CreateBookmarkDTO) {
    const id = tsidGenerator.generate();
    return this.db.insert(bookmark).values({ ...data, id }).returning().get();
  }

  delete(ids: string[]) {
    return this.db.delete(bookmark).where(inArray(bookmark.id, ids)).returning().all();
  }

  async updateLabels(bookmarkId: string, labelsToAdd: CreateUpdateLabelDTO[]) {
    await this.db.transaction(async (tx) => {
      // Delete existing relations for this bookmark
      await tx.delete(bookmarkLabel)
        .where(eq(bookmarkLabel.bookmarkId, bookmarkId));

      // Check for existing labels and create new ones if needed
      const existingLabels = await tx.query.label.findMany({
        where: (labels, { inArray }) => inArray(labels.id, labelsToAdd.map(l => l.id!).filter(Boolean))
      });

      const existingLabelIds = new Set(existingLabels.map(l => l.id));

      const labelsToCreate = labelsToAdd.filter(l => {
        return !l.id || !existingLabelIds.has(l.id)
      }).map(l => ({
        ...l,
        id: tsidGenerator.generate()
      }));

      const newLabelsCreatedIds = labelsToCreate.length > 0 ? await tx.insert(label).values(labelsToCreate).returning({ id: label.id }) : [];

      // Merge existing and newly created labels
      const allLabels = [...existingLabels, ...newLabelsCreatedIds];

      // Update created_at field in bookmarks table for the bookmark
      await tx.update(bookmark).set({ updatedAt: new Date() }).where(eq(bookmark.id, bookmarkId));

      // Create new relations
      await tx.insert(bookmarkLabel)
        .values(
          allLabels.map(label => ({
            id: tsidGenerator.generate(),
            bookmarkId,
            labelId: label.id!
          }))
        );
    });
  }

  update(bookmarksData: UpdateBookmarkDTO[]) {
    return this.db.transaction(async (tx) => {
      return Promise.all(
        bookmarksData.map(async (bookmarkData) => {
          const { id, ...rest } = bookmarkData;
          return await tx.update(bookmark).set(rest).where(eq(bookmark.id, id)).returning().get();
        })
      );
    });
  }

  updateState(id: string, state: UpdateStateBookmarkDTO) {
    return this.db.update(bookmark).set({ ...state, updatedAt: new Date() }).where(eq(bookmark.id, id)).returning().get();
  }
}
