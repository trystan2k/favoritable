import { eq } from "drizzle-orm";
import { bookmarkLabel } from "../../db/schema/bookmark-label.schema.js";
import { BookmarkLabelDTO, BookmarkLabelRepository, InsertBookmarkLabelDTO } from "./bookmarkLabel.repository.js";
import { Inject, Service } from "../../core/dependency-injection/di.decorators.js";
import { type DBTransaction } from "../../db/types.js";

@Service({ name: 'BookmarkLabelRepository', singleton: true })
export class SQLiteBookmarkLabelRepository implements BookmarkLabelRepository {
  constructor(@Inject('db') private db: DBTransaction) { }

  create(data: InsertBookmarkLabelDTO, tx: DBTransaction = this.db): Promise<BookmarkLabelDTO> {
    return tx.insert(bookmarkLabel).values(data).returning().get();
  }

  deleteByBookmarkId(bookmarkId: string, tx: DBTransaction = this.db): Promise<BookmarkLabelDTO[]> {
    return tx.delete(bookmarkLabel).where(eq(bookmarkLabel.bookmarkId, bookmarkId)).returning().all();
  }

  deleteByLabelId(labelId: string, tx: DBTransaction = this.db): Promise<BookmarkLabelDTO[]> {
    return tx.delete(bookmarkLabel).where(eq(bookmarkLabel.labelId, labelId)).returning().all();
  }
}
