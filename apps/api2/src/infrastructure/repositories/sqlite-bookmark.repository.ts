import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { Bookmark } from '../../domain/entities/bookmark.js';
import { Label } from '../../domain/entities/label.js';
import { AddLabelDTO, BookmarkRepository, CreateBookmarkDTO, UpdateBookmarkDTO } from '../../domain/repositories/bookmark.repository.js';
import { bookmarkLabels, bookmarks, labels } from '../../database/schema.js';

export class SQLiteBookmarkRepository implements BookmarkRepository {
  constructor(private db: BetterSQLite3Database) {}

  private transformBookmark(bookmarkData: typeof bookmarks.$inferSelect, labelData: (typeof labels.$inferSelect)[] = []): Bookmark {
    const bookmark = new Bookmark(
      bookmarkData.id,
      bookmarkData.slug,
      bookmarkData.title,
      bookmarkData.description,
      bookmarkData.author,
      bookmarkData.url,
      bookmarkData.thumbnail,
      bookmarkData.publishedAt ? new Date(bookmarkData.publishedAt) : undefined,
      new Date(bookmarkData.savedAt),
      new Date(bookmarkData.updatedAt)
    );

    for (const label of labelData) {
      bookmark.addLabel(
        new Label(
          label.id,
          label.name,
          label.color || undefined,
          new Date(label.createdAt)
        )
      );
    }

    return bookmark;
  }

  async findAll(): Promise<Bookmark[]> {
    const bookmarkResults = await this.db.select().from(bookmarks).all();
    const bookmarksWithLabels: Bookmark[] = [];

    for (const bookmarkData of bookmarkResults) {
      const labelResults = await this.db
        .select()
        .from(labels)
        .innerJoin(bookmarkLabels, eq(bookmarkLabels.labelId, labels.id))
        .where(eq(bookmarkLabels.bookmarkId, bookmarkData.id))
        .all();

      bookmarksWithLabels.push(this.transformBookmark(bookmarkData, labelResults));
    }

    return bookmarksWithLabels;
  }

  async findById(id: string): Promise<Bookmark | null> {
    const bookmarkData = await this.db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.id, parseInt(id)))
      .get();

    if (!bookmarkData) {
      return null;
    }

    const labelResults = await this.db
      .select()
      .from(labels)
      .innerJoin(bookmarkLabels, eq(bookmarkLabels.labelId, labels.id))
      .where(eq(bookmarkLabels.bookmarkId, bookmarkData.id))
      .all();

    return this.transformBookmark(bookmarkData, labelResults);
  }

  async create(data: CreateBookmarkDTO): Promise<number> {
    const result = await this.db.insert(bookmarks).values({
      ...data,
      publishedAt: data.publishedAt?.getTime(),
      savedAt: new Date().getTime(),
      updatedAt: new Date().getTime()
    }).run();
    return Number(result.lastInsertRowid);
  }

  async update(id: string, data: UpdateBookmarkDTO): Promise<boolean> {
    const result = await this.db
      .update(bookmarks)
      .set({ ...data, updatedAt: new Date().getTime() })
      .where(eq(bookmarks.id, parseInt(id)))
      .run();

    return result.changes > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(bookmarks)
      .where(eq(bookmarks.id, parseInt(id)))
      .run();

    return result.changes > 0;
  }

  async updateLabels(bookmarkId: string, labels: AddLabelDTO[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      const bookmark = await tx
        .select()
        .from(bookmarks)
        .where(eq(bookmarks.id, parseInt(bookmarkId)))
        .get();

      if (!bookmark) {
        throw new Error('Bookmark not found');
      }

      const labelIds: number[] = [];

      for (const label of labels) {
        if (label.id) {
          const existingLabel = await tx
            .select()
            .from(labels)
            .where(eq(labels.id, label.id))
            .get();

          if (!existingLabel) {
            throw new Error(`Label with id ${label.id} not found`);
          }
          labelIds.push(label.id);
        } else {
          const result = await tx
            .insert(labels)
            .values({ name: label.name, color: label.color })
            .run();
          labelIds.push(Number(result.lastInsertRowid));
        }
      }

      await tx
        .delete(bookmarkLabels)
        .where(eq(bookmarkLabels.bookmarkId, parseInt(bookmarkId)))
        .run();

      for (const labelId of labelIds) {
        await tx
          .insert(bookmarkLabels)
          .values({ bookmarkId: parseInt(bookmarkId), labelId })
          .run();
      }
    });
  }
}