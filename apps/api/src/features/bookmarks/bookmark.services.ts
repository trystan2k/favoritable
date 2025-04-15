import { ClassErrorHandler } from "../../errors/errors.decorators.js";
import { MalFormedRequestError, NotFoundError } from "../../errors/errors.js";
import { parseHtmlbookmarks } from "../../utils/html-bookmarks-parser.js";
import { scrapper } from "../../core/puppeteer.scrapper.js";
import { createBookmarkLabelRelation } from "../bookmarkLabel/bookmarkLabel.mappers.js";
import { mapCreateLabelModelToInsertLabelDTO } from "../labels/label.mappers.js";
import { CreateLabelModel, LabelModel } from "../labels/label.models.js";
import { BookmarkUnitOfWork } from "./bookmark-unit-of-work.js";
import { mapBookmarkDTOToBookmarkModel, mapCreateBookmarkModelToInsertBookmarkDTO, mapOnmivoreBookmarkToInsertBookmarkDTO, mapUpdateBookmarkModelToUpdateBookmarkDTO } from "./bookmark.mappers.js";
import { BookmarkModel, BookmarksModel, CreateBookmarkModel, GetBookmarksQueryParamsModel, OmnivoreBookmarkModel, UpdateBookmarkModel } from "./bookmark.models.js";
import { mapServiceErrors } from "../../errors/errors.mappers.js";
import { Inject, Service } from "../../core/dependency-injection/di.decorators.js";
import { type DBTransaction } from "../../db/types.js";

@Service({ name: 'BookmarkService' })
@ClassErrorHandler(mapServiceErrors)
export class BookmarkService {
  private entityName = 'Bookmark';

  constructor(@Inject('BookmarkUnitOfWork') private bookmarkUnitOfWork: BookmarkUnitOfWork) { }

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

  async getBookmark(id: string): Promise<BookmarkModel> {
    const bookmark = await this.bookmarkUnitOfWork.bookmarkRepository.findById(id);
    if (!bookmark) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }

    return mapBookmarkDTOToBookmarkModel(bookmark);
  }

  async createBookmark(data: CreateBookmarkModel) {
    const newBookmark = mapCreateBookmarkModelToInsertBookmarkDTO(data);
    const bookmark = await this.bookmarkUnitOfWork.bookmarkRepository.create(newBookmark);
    return mapBookmarkDTOToBookmarkModel(bookmark);
  }

  async createBookmarkFromUrl(url: string) {
    const bookmarkData = await scrapper(url);
    return this.createBookmark(bookmarkData);
  }

  async deleteBookmarks(ids: string[]) {
    const deletedBookmarks = await this.bookmarkUnitOfWork.bookmarkRepository.delete(ids);
    for (const bookmarkId of deletedBookmarks) {
      await this.bookmarkUnitOfWork.bookmarkLabelRepository.deleteByBookmarkId(bookmarkId);
    }
    return deletedBookmarks;
  }

  private async handleUpdateBookmark(data: UpdateBookmarkModel, uow: BookmarkUnitOfWork, tx: DBTransaction) {
    const updateBookmark = mapUpdateBookmarkModelToUpdateBookmarkDTO(data);
    const updatedBookmarkDto = await uow.bookmarkRepository.update(updateBookmark, tx);
    if (!updatedBookmarkDto) {
      throw new NotFoundError(`bookmark with id ${data.id} not found`);
    }
    const updatedBookmark = mapBookmarkDTOToBookmarkModel(updatedBookmarkDto);

    if (data.labels && data.labels.length > 0) {
      const allLabels: LabelModel[] = [];

      for (const label of data.labels) {
        if (!label.id && label.name) {
          const labelToCreate = mapCreateLabelModelToInsertLabelDTO(label as CreateLabelModel);
          const createdLabel = await uow.labelRepository.create(labelToCreate, tx);
          allLabels.push(createdLabel);
        } else if (label.id) {
          const existingLabelToAdd = await uow.labelRepository.findById(label.id);
          if (existingLabelToAdd) {
            allLabels.push(existingLabelToAdd);
          }
        } else {
          throw new MalFormedRequestError(`label with id ${label.id} is missing id or name properties`);
        }
      }

      await uow.bookmarkLabelRepository.deleteByBookmarkId(updatedBookmark.id, tx);

      for (const label of allLabels) {
        const relation = createBookmarkLabelRelation(updatedBookmark.id, label.id);
        await uow.bookmarkLabelRepository.create(relation, tx);
      }
      updatedBookmark.labels = allLabels;
    }

    return updatedBookmark;
  }

  updateBookmark(data: UpdateBookmarkModel): Promise<BookmarkModel> {
    return this.bookmarkUnitOfWork.execute(async (uow, tx) => {
      return this.handleUpdateBookmark(data, uow, tx);
    });
  }

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

      const labelData = label || await this.bookmarkUnitOfWork.labelRepository.create(mapCreateLabelModelToInsertLabelDTO({
        name: bookmark.folderName,
        color: null,
      }));

      const relations = createBookmarkLabelRelation(createdBookmark.id, labelData.id);

      await this.bookmarkUnitOfWork.bookmarkLabelRepository.create(relations);
      importedBookmarks.push(await this.getBookmark(createdBookmark.id));
    }

    return importedBookmarks;
  }

  async importFromOmnivore(data: OmnivoreBookmarkModel[]) {
    const importedBookmarks = [];

    for (const bookmark of data) {
      const bookmarkData = mapOnmivoreBookmarkToInsertBookmarkDTO(bookmark)

      const createdBookmark = await this.createBookmark(bookmarkData);

      if (bookmark.labels && bookmark.labels.length > 0) {
        for (const labelName of bookmark.labels) {
          const label = await this.bookmarkUnitOfWork.labelRepository.findByName(labelName);
          const labelData = label || await this.bookmarkUnitOfWork.labelRepository.create(mapCreateLabelModelToInsertLabelDTO({
            name: labelName,
            color: null,
          }));

          const relations = createBookmarkLabelRelation(createdBookmark.id, labelData.id);
          await this.bookmarkUnitOfWork.bookmarkLabelRepository.create(relations);
        }
      }

      importedBookmarks.push(await this.getBookmark(createdBookmark.id));
    }
    return importedBookmarks;
  }

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
