import { eq } from "drizzle-orm";
import { BookmarkRepository } from "./bookmark.types.js";
import { DB } from "../../db/connection.js";
import { BookmarkDTO, CreateUpdateBookmarkDTO, bookmarks, CreateUpdateLabelDTO, bookmarksLabel, labels } from "../../db/schema.js";

export class SQLiteBookmarkRepository implements BookmarkRepository {

  constructor(private db: DB) { }

  async findAll() {
    return this.db.query.bookmarks.findMany({
      with: {
        bookmarksLabel: {
          columns: {},
          with: {
            label: {
              columns: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        }
      }
    });
  }

  findById(id: number) {
    return this.db.query.bookmarks.findFirst({
      where: (bookmarks, { eq }) => eq(bookmarks.id, id),
      with: {
        bookmarksLabel: {
          columns: {},
          with: {
            label: {
              columns: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        }
      }
    });
  }

  async create(data: CreateUpdateBookmarkDTO) {
    const result = await this.db.insert(bookmarks).values(data);

    return Number(result.lastInsertRowid);
  }

  update(id: number, data: CreateUpdateBookmarkDTO): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  delete(id: number) {
    return this.db.delete(bookmarks).where(eq(bookmarks.id, id)).returning({ id: bookmarks.id });
  }

  async updateLabels(bookmarkId: number, labelsToAdd: CreateUpdateLabelDTO[]) {
    await this.db.transaction(async (tx) => {
      // Delete existing relations for this bookmark
      await tx.delete(bookmarksLabel)
        .where(eq(bookmarksLabel.bookmarkId, bookmarkId));

      // Check for existing labels and create new ones if needed
      const existingLabels = await tx.query.labels.findMany({
        where: (labels, { inArray }) => inArray(labels.id, labelsToAdd.map(l => l.id!).filter(Boolean))
      });

      const existingLabelIds = new Set(existingLabels.map(l => l.id));
      const labelsToCreate = labelsToAdd.filter(l => !l.id || !existingLabelIds.has(l.id));

      const newLabelsCreatedIds = labelsToCreate.length > 0 ? await tx.insert(labels).values(labelsToCreate).returning({ id: labels.id }) : [];

      // Merge existing and newly created labels
      const allLabels = [...existingLabels, ...newLabelsCreatedIds];

      // Create new relations
      await tx.insert(bookmarksLabel)
        .values(
          allLabels.map(label => ({
            bookmarkId,
            labelId: label.id!
          }))
        );
    });
  }
}
