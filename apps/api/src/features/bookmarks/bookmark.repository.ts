import { eq, inArray } from "drizzle-orm";
import { BookmarkRepository } from "./bookmark.types.js";
import type { db } from "../../db/index.js";
import { bookmarkLabel } from "../../db/schema/index.js";
import { CreateBookmarkDTO, UpdateBookmarkDTO, UpdateStateBookmarkDTO, bookmark } from "../../db/schema/bookmark.schema.js";
import { CreateUpdateLabelDTO, label } from "../../db/schema/label.schema.js";

export class SQLiteBookmarkRepository implements BookmarkRepository {

  constructor(private db: db) { }

  findAll(searchQuery?: string) {
    return this.db.query.bookmark.findMany({
      where: searchQuery ?
        (bookmark, { or, like, exists, sql }) => {
          const searchTerms = searchQuery.split(',').map(term => term.trim());
          return or(
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
          );
        } : undefined,
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

  findById(id: number) {
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
    return this.db.insert(bookmark).values(data).returning().get();
  }

  delete(ids: number[]) {
    return this.db.delete(bookmark).where(inArray(bookmark.id, ids)).returning().all();
  }

  async updateLabels(bookmarkId: number, labelsToAdd: CreateUpdateLabelDTO[]) {
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
      });

      const newLabelsCreatedIds = labelsToCreate.length > 0 ? await tx.insert(label).values(labelsToCreate).returning({ id: label.id }) : [];

      // Merge existing and newly created labels
      const allLabels = [...existingLabels, ...newLabelsCreatedIds];

      // Update created_at field in bookmarks table for the bookmark
      await tx.update(bookmark).set({ updatedAt: new Date() }).where(eq(bookmark.id, bookmarkId));

      // Create new relations
      await tx.insert(bookmarkLabel)
        .values(
          allLabels.map(label => ({
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

  updateState(id: number, state: UpdateStateBookmarkDTO) {
    return this.db.update(bookmark).set(state).where(eq(bookmark.id, id)).returning().get();
  }
}
