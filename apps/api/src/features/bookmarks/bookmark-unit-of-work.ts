import { db } from '../../db';
import { SQLiteBookmarkRepository } from './bookmark.repository';
import { SQLiteLabelRepository } from '../labels/label.repository';
import { SQLiteBookmarkLabelRepository } from '../bookmarkLabel/bookmarkLabel.repository';

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class BookmarkUnitOfWork {
  private _bookmarkRepository: SQLiteBookmarkRepository;
  private _labelRepository: SQLiteLabelRepository;
  private _bookmarkLabelRepository: SQLiteBookmarkLabelRepository;

  constructor() {
    this._bookmarkRepository = new SQLiteBookmarkRepository(db);
    this._labelRepository = new SQLiteLabelRepository(db);
    this._bookmarkLabelRepository = new SQLiteBookmarkLabelRepository(db);
  }

  get bookmarkRepository() {
    return this._bookmarkRepository;
  }

  get labelRepository() {
    return this._labelRepository;
  }

  get bookmarkLabelRepository() {
    return this._bookmarkLabelRepository;
  }

  async execute<T>(operation: (uow: BookmarkUnitOfWork, tx: Tx) => Promise<T>): Promise<T> {
    return db.transaction(tx => {
      try {
        return operation(this, tx);
      } catch (error) {
        throw error; // Rollback is handled automatically by Drizzle
      }
    });
  }
}