import { CreateBookmarkDTO, UpdateBookmarkDTO, UpdateStateBookmarkDTO } from "../../db/schema/bookmark.schema.js";
import { CreateUpdateLabelDTO } from "../../db/schema/label.schema.js";
import { NotFoundError } from "../../errors/errors.js";
import { handleServiceErrors } from "../../errors/errors.decorator.js";
import { BookmarkRepository, BookmarkResponseModel, BookmarkWithLabelsDTO, OmnivoreBookmarkModel } from "./bookmark.types.js";
import { tsidGenerator } from "../../utils/tsids-generator.js";
import { LabelRepository } from "../labels/label.types.js";
import { parseChromebookmarks } from "../../utils/chrome-parser.js";
import { scrapper } from "../../utils/scrapper.js";

export class BookmarkService {
  private entityName = 'Bookmark';

  constructor(private bookmarkRepository: BookmarkRepository, private labelRepository: LabelRepository) { }

  private mapBookmarkWithLabels(bookmark: BookmarkWithLabelsDTO): BookmarkResponseModel {
    const labels = bookmark.bookmarkLabel.map(bl => bl.label);
    const { bookmarkLabel, ...rest } = bookmark;
    return {
      ...rest,
      labels,
    }
  }

  @handleServiceErrors('entityName')
  async getBookmarks(searchQuery?: string, cursor?: string, limit?: number) {
    const { bookmarks, hasMore } = await this.bookmarkRepository.findAll(searchQuery, { cursor, limit });
    const mappedBookmarks = bookmarks.map(bookmark => this.mapBookmarkWithLabels(bookmark));

    const searchQueryLimit = `?${searchQuery ? `q=${searchQuery}&` : ''}limit=${limit}`;

    const pagination = {
      next: hasMore ? `${searchQueryLimit}&cursor=${bookmarks[bookmarks.length - 1]!.id}` : undefined,
      self: cursor ? `${searchQueryLimit}&cursor=${cursor}` : `${searchQueryLimit}`
    }

    return {
      data: mappedBookmarks,
      pagination
    };
  }

  @handleServiceErrors('entityName')
  async getBookmark(id: string) {
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
  async deleteBookmarks(ids: string[]) {
    const bookmarks = await this.bookmarkRepository.delete(ids);
    if (!bookmarks || bookmarks.length === 0) {
      throw new NotFoundError(`${this.entityName}(s) with id(s) [${ids.toString()}] not found`);
    }
    return bookmarks;
  }

  @handleServiceErrors('entityName')
  async updateLabels(bookmarkId: string, labels: CreateUpdateLabelDTO[]) {
    const bookmark = await this.bookmarkRepository.findById(bookmarkId);
    if (!bookmark) {
      throw new NotFoundError(`${this.entityName} not found`);
    }

    return this.bookmarkRepository.updateLabels(bookmarkId, labels);
  }

  @handleServiceErrors('entityName')
  async updateState(bookmarkId: string, state: UpdateStateBookmarkDTO) {
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

  @handleServiceErrors('entityName')
  async importFromChrome(html: string, folderName?: string) {
    const bookmarks = parseChromebookmarks(html, folderName);
    const importedBookmarks = [];

    for (const bookmark of bookmarks) {
      let bookmarkData: CreateBookmarkDTO;
      try {
        bookmarkData = await scrapper(bookmark.url);
      } catch (error) {
        // TODO use the logging system
        console.error(`Error importing bookmark ${bookmark.url}: ${error}`);
        continue;
      }

      const createdBookmark = await this.createBookmark(bookmarkData);

      const label = await this.labelRepository.findByName(bookmark.folderName);
      const labelData = label || await this.labelRepository.create({
        id: tsidGenerator.generate(),
        name: bookmark.folderName,
      });

      await this.updateLabels(createdBookmark.id, [labelData]);
      importedBookmarks.push(await this.getBookmark(createdBookmark.id));
    }

    return importedBookmarks;
  }

  @handleServiceErrors('entityName')
  async importFromOmnivore(data: OmnivoreBookmarkModel[]) {
    const importedBookmarks = [];

    for (const bookmark of data) {
      const state = bookmark.state.toLowerCase() === 'archived' ? 'archived' : 'pending';
      const bookmarkData: CreateBookmarkDTO = {
        id: tsidGenerator.generate(),
        url: bookmark.url,
        slug: bookmark.slug,
        title: bookmark.title,
        description: bookmark.description || undefined,
        author: bookmark.author || undefined,
        thumbnail: bookmark.thumbnail || undefined,
        state,
        publishedAt: bookmark.publishedAt ? new Date(bookmark.publishedAt) : undefined,
        createdAt: new Date(bookmark.savedAt),
        updatedAt: new Date(bookmark.updatedAt),
      };

      const createdBookmark = await this.createBookmark(bookmarkData);

      if (bookmark.labels && bookmark.labels.length > 0) {
        const labels: CreateUpdateLabelDTO[] = [];
        for (const labelName of bookmark.labels) {
          const label = await this.labelRepository.findByName(labelName);
          const labelData = label || await this.labelRepository.create({
            id: tsidGenerator.generate(),
            name: labelName,
          });
          labels.push(labelData);
        }

        await this.updateLabels(createdBookmark.id, labels);
      }

      importedBookmarks.push(await this.getBookmark(createdBookmark.id));
    }
    return importedBookmarks;
  }
}
