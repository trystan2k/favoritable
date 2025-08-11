import {
  Inject,
  Service,
} from '../../core/dependency-injection/di.decorators.js';
import { logger } from '../../core/logger.js';
import { scrapper } from '../../core/puppeteer.scrapper.js';
import type { DBTransaction } from '../../db/types.js';
import { MalFormedRequestError, NotFoundError } from '../../errors/errors.js';
import { parseHtmlbookmarks } from '../../utils/html-bookmarks-parser.js';
import { createBookmarkLabelRelation } from '../bookmarkLabel/bookmarkLabel.mappers.js';
import { mapCreateLabelModelToInsertLabelDTO } from '../labels/label.mappers.js';
import type { CreateLabelModel, LabelModel } from '../labels/label.models.js';
import {
  mapBookmarkDTOToBookmarkModel,
  mapCreateBookmarkModelToInsertBookmarkDTO,
  mapOnmivoreBookmarkToInsertBookmarkDTO,
  mapUpdateBookmarkModelToUpdateBookmarkDTO,
} from './bookmark.mappers.js';
import type {
  BookmarkModel,
  BookmarksModel,
  CreateBookmarkModel,
  GetBookmarksQueryParamsModel,
  OmnivoreBookmarkModel,
  UpdateBookmarkModel,
} from './bookmark.models.js';
import type { BookmarkUnitOfWork } from './bookmark-unit-of-work.js';

@Service({ name: 'BookmarkService' })
export class BookmarkService {
  private entityName = 'Bookmark';

  constructor(
    @Inject('BookmarkUnitOfWork') private bookmarkUnitOfWork: BookmarkUnitOfWork
  ) {}

  async getBookmarks(
    queryParams: GetBookmarksQueryParamsModel
  ): Promise<BookmarksModel> {
    const { q: searchQuery, limit, cursor } = queryParams;

    const bookmarks =
      await this.bookmarkUnitOfWork.bookmarkRepository.findAll(queryParams);

    const mappedBookmarks = bookmarks.map((bookmark) =>
      mapBookmarkDTOToBookmarkModel(bookmark)
    );

    // Check if there are more results
    const hasMore = mappedBookmarks.length > limit;
    const items = hasMore ? mappedBookmarks.slice(0, limit) : mappedBookmarks;

    const searchQueryLimit = `?${
      searchQuery ? `q=${searchQuery}&` : ''
    }limit=${limit}`;
    const paginationMetadata = {
      next: hasMore
        ? `${searchQueryLimit}&cursor=${items[items.length - 1]?.id}`
        : null,
      self: cursor
        ? `${searchQueryLimit}&cursor=${cursor}`
        : `${searchQueryLimit}`,
    };

    return {
      data: items,
      pagination: paginationMetadata,
    };
  }

  async getBookmark(id: string): Promise<BookmarkModel> {
    const bookmark =
      await this.bookmarkUnitOfWork.bookmarkRepository.findById(id);
    if (!bookmark) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }

    return mapBookmarkDTOToBookmarkModel(bookmark);
  }

  async createBookmark(data: CreateBookmarkModel) {
    const newBookmark = mapCreateBookmarkModelToInsertBookmarkDTO(data);
    const bookmark =
      await this.bookmarkUnitOfWork.bookmarkRepository.create(newBookmark);
    return mapBookmarkDTOToBookmarkModel(bookmark);
  }

  async createBookmarkFromUrl(url: string) {
    const bookmarkData = await scrapper(url);
    return this.createBookmark(bookmarkData);
  }

  async deleteBookmarks(ids: string[]) {
    const deletedBookmarks =
      await this.bookmarkUnitOfWork.bookmarkRepository.delete(ids);
    for (const bookmarkId of deletedBookmarks) {
      await this.bookmarkUnitOfWork.bookmarkLabelRepository.deleteByBookmarkId(
        bookmarkId
      );
    }
    return deletedBookmarks;
  }

  private async handleUpdateBookmark(
    data: UpdateBookmarkModel,
    uow: BookmarkUnitOfWork,
    tx: DBTransaction
  ) {
    const updateBookmark = mapUpdateBookmarkModelToUpdateBookmarkDTO(data);
    const updatedBookmarkDto = await uow.bookmarkRepository.update(
      updateBookmark,
      tx
    );
    if (!updatedBookmarkDto) {
      throw new NotFoundError(`bookmark with id ${data.id} not found`);
    }
    const updatedBookmark = mapBookmarkDTOToBookmarkModel(updatedBookmarkDto);

    if (data.labels && data.labels.length > 0) {
      const allLabels: LabelModel[] = [];

      for (const label of data.labels) {
        if (!label.id && label.name) {
          const labelToCreate = mapCreateLabelModelToInsertLabelDTO(
            label as CreateLabelModel
          );
          const createdLabel = await uow.labelRepository.create(
            labelToCreate,
            tx
          );
          allLabels.push(createdLabel);
        } else if (label.id) {
          const existingLabelToAdd = await uow.labelRepository.findById(
            label.id
          );
          if (existingLabelToAdd) {
            allLabels.push(existingLabelToAdd);
          }
        } else {
          throw new MalFormedRequestError(
            `label with id ${label.id} is missing id or name properties`
          );
        }
      }

      await uow.bookmarkLabelRepository.deleteByBookmarkId(
        updatedBookmark.id,
        tx
      );

      for (const label of allLabels) {
        const relation = createBookmarkLabelRelation(
          updatedBookmark.id,
          label.id
        );
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
        const updatedBookmarkData = await this.handleUpdateBookmark(
          bookmarkData,
          uow,
          tx
        );
        updatedBookmarks.push(updatedBookmarkData);
      }

      return updatedBookmarks;
    });
  }

  async importFromHtmlFile(html: string, folderName?: string) {
    const serviceLogger = logger.child({
      context: 'BookmarkService',
      method: 'importFromHtmlFile',
    });
    serviceLogger.info(
      `Starting HTML bookmark import${folderName ? ` for folder: ${folderName}` : ''}`
    );

    const bookmarks = parseHtmlbookmarks(html, folderName);
    serviceLogger.debug(`Parsed ${bookmarks.length} bookmarks from HTML`);

    const importedBookmarks = [];

    for (const bookmark of bookmarks) {
      let bookmarkData: CreateBookmarkModel;
      try {
        bookmarkData = await scrapper(bookmark.url);
        serviceLogger.debug(`Successfully scraped bookmark: ${bookmark.url}`);
      } catch (error) {
        serviceLogger.warn({
          url: bookmark.url,
          error: error instanceof Error ? error.message : error,
          msg: `Failed to scrape bookmark, skipping: ${bookmark.url}`,
        });
        continue;
      }

      const createdBookmark = await this.createBookmark(bookmarkData);

      const label = await this.bookmarkUnitOfWork.labelRepository.findByName(
        bookmark.folderName
      );

      const labelData =
        label ||
        (await this.bookmarkUnitOfWork.labelRepository.create(
          mapCreateLabelModelToInsertLabelDTO({
            name: bookmark.folderName,
            color: null,
          })
        ));

      const relations = createBookmarkLabelRelation(
        createdBookmark.id,
        labelData.id
      );

      await this.bookmarkUnitOfWork.bookmarkLabelRepository.create(relations);
      importedBookmarks.push(await this.getBookmark(createdBookmark.id));
    }

    serviceLogger.info(
      `Successfully imported ${importedBookmarks.length} of ${bookmarks.length} bookmarks from HTML`
    );
    return importedBookmarks;
  }

  async importFromOmnivore(data: OmnivoreBookmarkModel[]) {
    const serviceLogger = logger.child({
      context: 'BookmarkService',
      method: 'importFromOmnivore',
    });
    serviceLogger.info(
      `Starting Omnivore bookmark import with ${data.length} items`
    );

    const importedBookmarks = [];

    for (const bookmark of data) {
      const bookmarkData = mapOnmivoreBookmarkToInsertBookmarkDTO(bookmark);

      const createdBookmark = await this.createBookmark(bookmarkData);

      if (bookmark.labels && bookmark.labels.length > 0) {
        serviceLogger.debug(
          `Processing ${bookmark.labels.length} labels for bookmark: ${bookmark.title || bookmark.url}`
        );

        for (const labelName of bookmark.labels) {
          const label =
            await this.bookmarkUnitOfWork.labelRepository.findByName(labelName);
          const labelData =
            label ||
            (await this.bookmarkUnitOfWork.labelRepository.create(
              mapCreateLabelModelToInsertLabelDTO({
                name: labelName,
                color: null,
              })
            ));

          const relations = createBookmarkLabelRelation(
            createdBookmark.id,
            labelData.id
          );
          await this.bookmarkUnitOfWork.bookmarkLabelRepository.create(
            relations
          );
        }
      }

      importedBookmarks.push(await this.getBookmark(createdBookmark.id));
    }

    serviceLogger.info(
      `Successfully imported ${importedBookmarks.length} bookmarks from Omnivore`
    );
    return importedBookmarks;
  }

  async importFromTextFile(data: string) {
    const serviceLogger = logger.child({
      context: 'BookmarkService',
      method: 'importFromTextFile',
    });
    const urls = data.split('\n').filter((url) => url.trim().length > 0);
    serviceLogger.info(
      `Starting text file bookmark import with ${urls.length} URLs`
    );

    const importedBookmarks = [];

    for (const url of urls) {
      let bookmarkData: CreateBookmarkModel;
      try {
        bookmarkData = await scrapper(url.trim());
        serviceLogger.debug(`Successfully scraped bookmark: ${url.trim()}`);
      } catch (error) {
        serviceLogger.warn({
          url: url.trim(),
          error: error instanceof Error ? error.message : error,
          msg: `Failed to scrape bookmark, skipping: ${url.trim()}`,
        });
        continue;
      }

      const createdBookmark = await this.createBookmark(bookmarkData);
      importedBookmarks.push(await this.getBookmark(createdBookmark.id));
    }

    serviceLogger.info(
      `Successfully imported ${importedBookmarks.length} of ${urls.length} bookmarks from text file`
    );
    return importedBookmarks;
  }
}
