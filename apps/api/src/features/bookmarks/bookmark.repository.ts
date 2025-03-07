import { eq } from "drizzle-orm";
import { BookmarkRepository } from "./bookmark.types";
import type { db } from "../../db";
import { bookmarkLabel } from "../../db/schema";
import { CreateUpdateBookmarkDTO, bookmark } from "../../db/schema/bookmark.schema";
import { CreateUpdateLabelDTO, label } from "../../db/schema/label.schema";

export class SQLiteBookmarkRepository implements BookmarkRepository {

  constructor(private db: db) { }

  async findAll() {
    return this.db.query.bookmark.findMany({
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

  async create(data: CreateUpdateBookmarkDTO) {
    return this.db.insert(bookmark).values(data).returning().get();
  }

  async delete(id: number) {
    return this.db.delete(bookmark).where(eq(bookmark.id, id)).returning().get();
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
}
