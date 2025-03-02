import { BookmarkDTO } from "../db/schema.js";
import { BookmarkRepository } from "../repositories/types.js";

export class BookmarkService {
  constructor(private bookmarkRepository: BookmarkRepository) { }

  async getBookmarks(): Promise<BookmarkDTO[]> {
    return await this.bookmarkRepository.findAll();
  }

  async getBookmark(id: number): Promise<BookmarkDTO | null | undefined> {
    return await this.bookmarkRepository.findById(id);
  }

  async createBookmark(data: BookmarkDTO): Promise<number> {
    return await this.bookmarkRepository.create(data);
  }
}
