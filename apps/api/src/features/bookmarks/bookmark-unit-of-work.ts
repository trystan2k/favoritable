import { Inject, Service } from '../../core/dependency-injection/di.decorators.js';
import type { DBTransaction } from '../../db/types.js';
import type { BookmarkLabelRepository } from '../bookmarkLabel/bookmarkLabel.repository.js';
import type { LabelRepository } from '../labels/label.repository.js';
import type { BookmarkRepository } from './bookmark.repository.js';

// export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

@Service({ name: 'BookmarkUnitOfWork' })
export class BookmarkUnitOfWork {
  constructor(
    @Inject('db') private db: DBTransaction,
    @Inject('BookmarkRepository')
    private _bookmarkRepository: BookmarkRepository,
    @Inject('LabelRepository') private _labelRepository: LabelRepository,
    @Inject('BookmarkLabelRepository')
    private _bookmarkLabelRepository: BookmarkLabelRepository
  ) {}

  get bookmarkRepository() {
    return this._bookmarkRepository;
  }

  get labelRepository() {
    return this._labelRepository;
  }

  get bookmarkLabelRepository() {
    return this._bookmarkLabelRepository;
  }

  async execute<T>(
    operation: (uow: BookmarkUnitOfWork, tx: DBTransaction) => Promise<T>
  ): Promise<T> {
    return this.db.transaction((tx) => {
      return operation(this, tx);
    });
  }
}
