import { CreateUpdateBookmarkDTO, CreateUpdateLabelDTO } from "../../db/schema.js";
import { BookmarkRepository, BookmarkWithLabelsDTO, BookmarkResponseModel } from "./bookmark.types.js";

export class BookmarkService {
  constructor(private bookmarkRepository: BookmarkRepository) { }

  private mapBookmarkWithLabels(bookmark: BookmarkWithLabelsDTO): BookmarkResponseModel {
    const labels = bookmark.bookmarksLabel.map(bl => bl.label);
    const { bookmarksLabel, ...rest } = bookmark;
    return {
      ...rest,
      labels,
    }
  }

  getBookmarks() {
    return this.bookmarkRepository.findAll().then(bookmarks =>
      bookmarks.map(bookmark => this.mapBookmarkWithLabels(bookmark))
    );
  }

  getBookmark(id: number) {
    return this.bookmarkRepository.findById(id);
  }

  createBookmark(data: CreateUpdateBookmarkDTO) {
    return this.bookmarkRepository.create(data);
  }

  deleteBookmark(id: number) {
    return this.bookmarkRepository.delete(id);
  }

  updateLabels(bookmarkId: number, labels: CreateUpdateLabelDTO[]) {
    const bookmark = this.bookmarkRepository.findById(bookmarkId);
    if (!bookmark) {
      throw new Error('Bookmark not found');
    }

    return this.bookmarkRepository.updateLabels(bookmarkId, labels);
  }
}
