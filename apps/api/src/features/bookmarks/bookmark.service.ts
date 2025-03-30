import { InsertLabelDTO } from "../../db/dtos/label.dtos.js";
import { handleServiceErrors } from "../../errors/errors.decorator.js";
import { NotFoundError } from "../../errors/errors.js";
import { generateRandomColor } from "../../utils/colors.js";
import { parseHtmlbookmarks } from "../../utils/html-bookmarks-parser.js";
import { scrapper } from "../../utils/scrapper.js";
import { tsidGenerator } from "../../utils/tsids-generator.js";
import { LabelModel } from "../labels/label.models.js";
import { BookmarkUnitOfWork, Tx } from "./bookmark-unit-of-work.js";
import { mapBookmarkDTOToBookmarkModel, mapCreateBookmarkModelToInsertBookmarkDTO, mapUpdateBookmarkModelToInsertBookmarkDTO } from "./bookmark.mappers.js";
import { BookmarkModel, BookmarksModel, CreateBookmarkModel, GetBookmarksQueryParamsModel, UpdateBookmarkModel } from "./bookmark.models.js";
import { OmnivoreBookmarkModel } from "./bookmark.types.js";

export class BookmarkService {
  private entityName = 'Bookmark';

  constructor(private bookmarkUnitOfWork: BookmarkUnitOfWork) { }

  @handleServiceErrors('entityName')
  async getBookmarks(queryParams: GetBookmarksQueryParamsModel): Promise<BookmarksModel> {

    const { q: searchQuery, limit, cursor } = queryParams;

    const bookmarks = await this.bookmarkUnitOfWork.bookmarkRepository.findAll(queryParams);

    const mappedBookmarks = bookmarks.map(bookmark => mapBookmarkDTOToBookmarkModel(bookmark));

    // Check if there are more results
    const hasMore = mappedBookmarks.length > limit;
    const items = hasMore ? mappedBookmarks.slice(0, limit) : mappedBookmarks;

    const searchQueryLimit = `?${searchQuery ? `q=${searchQuery}&` : ''}limit=${limit}`;
    const paginationMetadata = {
      next: hasMore ? `${searchQueryLimit}&cursor=${items[items.length - 1]!.id}` : null,
      self: cursor ? `${searchQueryLimit}&cursor=${cursor}` : `${searchQueryLimit}`
    }

    return {
      data: items,
      pagination: paginationMetadata
    };
  }

  @handleServiceErrors('entityName')
  async getBookmark(id: string): Promise<BookmarkModel> {
    const bookmark = await this.bookmarkUnitOfWork.bookmarkRepository.findById(id);
    if (!bookmark) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }

    return mapBookmarkDTOToBookmarkModel(bookmark);
  }

  @handleServiceErrors('entityName')
  async createBookmark(data: CreateBookmarkModel) {
    const newBookmark = mapCreateBookmarkModelToInsertBookmarkDTO(data);
    const bookmark = await this.bookmarkUnitOfWork.bookmarkRepository.create(newBookmark);
    return mapBookmarkDTOToBookmarkModel(bookmark);
  }

  @handleServiceErrors('entityName')
  async deleteBookmarks(ids: string[]) {
    const deletedBookmarks = await this.bookmarkUnitOfWork.bookmarkRepository.delete(ids);
    return deletedBookmarks;
  }

  private async handleUpdateBookmark(data: UpdateBookmarkModel, uow: BookmarkUnitOfWork, tx: Tx) {
    const updateBookmark = mapUpdateBookmarkModelToInsertBookmarkDTO(data);
    const updatedBookmarkDto = await uow.bookmarkRepository.update(updateBookmark, tx);
    if (!updatedBookmarkDto) {
      throw new NotFoundError(`bookmark with id ${data.id} not found`);
    }

    const updatedBookmark = mapBookmarkDTOToBookmarkModel(updatedBookmarkDto);

    if (data.labels && data.labels.length > 0) {
      const allLabels: LabelModel[] = [];

      for (const label of data.labels) {
        if (!('id' in label)) {
          const labelToCreate: InsertLabelDTO = {
            id: tsidGenerator.generate(),
            name: label.name,
            color: label.color || generateRandomColor(),
          };

          const createdLabel = await uow.labelRepository.create(labelToCreate, tx);
          allLabels.push(createdLabel);
        } else {
          const existingLabelToAdd = await uow.labelRepository.findById(label.id);
          if (existingLabelToAdd) {
            allLabels.push(existingLabelToAdd);
          }
        }
      }

      const relations = allLabels.map(label => ({
        id: tsidGenerator.generate(),
        bookmarkId: updatedBookmark.id,
        labelId: label.id
      }));

      await uow.bookmarkLabelRepository.deleteByBookmarkId(updatedBookmark.id, tx);

      for (const relation of relations) {
        await uow.bookmarkLabelRepository.create(relation, tx);
      }
      updatedBookmark.labels = allLabels;
    }

    return updatedBookmark;
  }

  @handleServiceErrors('entityName')
  updateBookmark(data: UpdateBookmarkModel): Promise<BookmarkModel> {
    return this.bookmarkUnitOfWork.execute(async (uow, tx) => {
      return this.handleUpdateBookmark(data, uow, tx);
    });
  }

  @handleServiceErrors('entityName')
  updateBookmarks(data: UpdateBookmarkModel[]): Promise<BookmarkModel[]> {
    return this.bookmarkUnitOfWork.execute(async (uow, tx) => {

      const updatedBookmarks: BookmarkModel[] = [];

      for (const bookmarkData of data) {
        const updatedBookmarkData = await this.handleUpdateBookmark(bookmarkData, uow, tx);
        updatedBookmarks.push(updatedBookmarkData);
      }

      return updatedBookmarks;
    });
  }

  @handleServiceErrors('entityName')
  async importFromHtmlFile(html: string, folderName?: string) {
    const bookmarks = parseHtmlbookmarks(html, folderName);
    const importedBookmarks = [];

    for (const bookmark of bookmarks) {
      let bookmarkData: CreateBookmarkModel;
      try {
        bookmarkData = await scrapper(bookmark.url);
      } catch (error) {
        // TODO use the logging system
        console.error(`Error importing bookmark ${bookmark.url}: ${error}`);
        continue;
      }

      const createdBookmark = await this.createBookmark(bookmarkData);

      const label = await this.bookmarkUnitOfWork.labelRepository.findByName(bookmark.folderName);
      const labelData = label || await this.bookmarkUnitOfWork.labelRepository.create({
        id: tsidGenerator.generate(),
        name: bookmark.folderName,
      });

      const relations = {
        id: tsidGenerator.generate(),
        bookmarkId: createdBookmark.id,
        labelId: labelData.id
      };

      await this.bookmarkUnitOfWork.bookmarkLabelRepository.create(relations);
      importedBookmarks.push(await this.getBookmark(createdBookmark.id));
    }

    return importedBookmarks;
  }

  @handleServiceErrors('entityName')
  async importFromOmnivore(data: OmnivoreBookmarkModel[]) {
    const importedBookmarks = [];

    for (const bookmark of data) {
      const bookmarkData: CreateBookmarkModel = {
        url: bookmark.url,
        slug: bookmark.slug,
        title: bookmark.title,
        description: bookmark.description || null,
        author: bookmark.author || null,
        thumbnail: bookmark.thumbnail || null,
        publishedAt: bookmark.publishedAt ?? null,
        state: bookmark.state === 'Archived' ? 'archived' : 'active',
        labels: []
      };

      const createdBookmark = await this.createBookmark(bookmarkData);

      if (bookmark.labels && bookmark.labels.length > 0) {
        for (const labelName of bookmark.labels) {
          const label = await this.bookmarkUnitOfWork.labelRepository.findByName(labelName);
          const labelData = label || await this.bookmarkUnitOfWork.labelRepository.create({
            id: tsidGenerator.generate(),
            name: labelName,
          });

          const relations = {
            id: tsidGenerator.generate(),
            bookmarkId: createdBookmark.id,
            labelId: labelData.id
          };

          await this.bookmarkUnitOfWork.bookmarkLabelRepository.create(relations);
        }
      }

      importedBookmarks.push(await this.getBookmark(createdBookmark.id));
    }
    return importedBookmarks;
  }

  @handleServiceErrors('entityName')
  async importFromTextFile(data: string) {
    const importedBookmarks = [];
    const urls = data.split('\n').filter(url => url.trim().length > 0);

    for (const url of urls) {
      let bookmarkData: CreateBookmarkModel;
      try {
        bookmarkData = await scrapper(url.trim());
      } catch (error) {
        // TODO use the logging system
        console.error(`Error importing bookmark ${url}: ${error}`);
        continue;
      }

      const createdBookmark = await this.createBookmark(bookmarkData);
      importedBookmarks.push(await this.getBookmark(createdBookmark.id));
    }

    return importedBookmarks;
  }
}
