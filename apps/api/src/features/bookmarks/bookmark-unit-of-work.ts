import { db } from "../../db/index.js";
import { BookmarkLabelRepository } from "../bookmarkLabel/bookmarkLabel.repository.js";
import { LabelRepository } from "../labels/label.repository.js";
import { BookmarkRepository } from "./bookmark.repository.js";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class BookmarkUnitOfWork {

  constructor(
    private _bookmarkRepository: BookmarkRepository,
    private _labelRepository: LabelRepository,
    private _bookmarkLabelRepository: BookmarkLabelRepository
  ) { }

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
