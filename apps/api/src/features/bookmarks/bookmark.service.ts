import { CreateBookmarkDTO, UpdateBookmarkDTO, UpdateStateBookmarkDTO } from "../../db/schema/bookmark.schema.js";
import { CreateUpdateLabelDTO } from "../../db/schema/label.schema.js";
import { NotFoundError } from "../../errors/errors.js";
import { handleServiceErrors } from "../../errors/errors.decorator.js";
import { BookmarkRepository, BookmarkResponseModel, BookmarkWithLabelsDTO } from "./bookmark.types.js";

export class BookmarkService {
  private entityName = 'Bookmark';

  constructor(private bookmarkRepository: BookmarkRepository) { }

  private mapBookmarkWithLabels(bookmark: BookmarkWithLabelsDTO): BookmarkResponseModel {
    const labels = bookmark.bookmarkLabel.map(bl => bl.label);
    const { bookmarkLabel, ...rest } = bookmark;
    return {
      ...rest,
      labels,
    }
  }

  @handleServiceErrors('entityName')
  getBookmarks() {
    return this.bookmarkRepository.findAll().then(bookmarks =>
      bookmarks.map(bookmark => this.mapBookmarkWithLabels(bookmark))
    );
  }

  @handleServiceErrors('entityName')
  async getBookmark(id: number) {
    const bookmark = await this.bookmarkRepository.findById(id);
    if (!bookmark) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
    return bookmark;
  }

  @handleServiceErrors('entityName')
  createBookmark(data: CreateBookmarkDTO) {
    return this.bookmarkRepository.create(data);
  }

  @handleServiceErrors('entityName')
  async deleteBookmarks(ids: number[]) {
    const bookmarks = await this.bookmarkRepository.delete(ids);
    if (!bookmarks || bookmarks.length === 0) {
      throw new NotFoundError(`${this.entityName}(s) with id(s) [${ids.toString()}] not found`);
    }
    return bookmarks;
  }

  @handleServiceErrors('entityName')
  async updateLabels(bookmarkId: number, labels: CreateUpdateLabelDTO[]) {
    const bookmark = await this.bookmarkRepository.findById(bookmarkId);
    if (!bookmark) {
      throw new NotFoundError(`${this.entityName} not found`);
    }

    return this.bookmarkRepository.updateLabels(bookmarkId, labels);
  }

  @handleServiceErrors('entityName')
  async updateState(bookmarkId: number, state: UpdateStateBookmarkDTO) {
    const bookmark = await this.bookmarkRepository.findById(bookmarkId);
    if (!bookmark) {
      throw new NotFoundError(`${this.entityName} not found`);
    }
    return this.bookmarkRepository.updateState(bookmarkId, state);
  }

  @handleServiceErrors('entityName')
  async updateBookmarks(data: UpdateBookmarkDTO[]) {
    return this.bookmarkRepository.update(data);
  }
}
