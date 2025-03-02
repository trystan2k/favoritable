import { LibSQLDatabase } from "drizzle-orm/libsql";
import { BookmarkDTO, bookmarks, CreateUpdateBookmarkDTO, CreateUpdateLabelDTO } from "../db/schema.js";
import { BookmarkRepository } from "./types.js";
import { DB } from "../db/connection.js";

export class SQLiteBookmarkRepository implements BookmarkRepository {

  constructor(private db: DB) { }

  findAll(): Promise<BookmarkDTO[]> {
    return this.db.query.bookmarks.findMany();
  }

  findById(id: number): Promise<BookmarkDTO | null | undefined> {
    return this.db.query.bookmarks.findFirst({
      where: (bookmarks, { eq }) => eq(bookmarks.id, id),
    });
  }

  async create(data: CreateUpdateBookmarkDTO): Promise<number> {
    const result = await this.db.insert(bookmarks).values({
      ...data,
    }).run();

    return Number(result.lastInsertRowid);
  }
  update(id: number, data: CreateUpdateBookmarkDTO): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  delete(id: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  updateLabels(bookmarkId: number, labels: CreateUpdateLabelDTO[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

}
