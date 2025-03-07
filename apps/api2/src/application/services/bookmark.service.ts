import { Bookmark } from '../../domain/entities/bookmark';
import { AddLabelDTO, BookmarkRepository, CreateBookmarkDTO, UpdateBookmarkDTO } from '../../domain/repositories/bookmark.repository';

export class BookmarkService {
  constructor(private bookmarkRepository: BookmarkRepository) {}

  async getAllBookmarks(): Promise<Bookmark[]> {
    return this.bookmarkRepository.findAll();
  }

  async getBookmarkById(id: string): Promise<Bookmark | null> {
    return this.bookmarkRepository.findById(id);
  }

  async createBookmark(data: CreateBookmarkDTO): Promise<number> {
    return this.bookmarkRepository.create(data);
  }

  async updateBookmark(id: string, data: UpdateBookmarkDTO): Promise<boolean> {
    return this.bookmarkRepository.update(id, data);
  }

  async deleteBookmark(id: string): Promise<boolean> {
    return this.bookmarkRepository.delete(id);
  }

  async updateBookmarkLabels(bookmarkId: string, labels: AddLabelDTO[]): Promise<void> {
    await this.bookmarkRepository.updateLabels(bookmarkId, labels);
  }
}
