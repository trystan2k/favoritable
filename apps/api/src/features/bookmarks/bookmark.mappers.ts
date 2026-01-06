import { tsidGenerator } from '../../utils/tsids-generator.js';
import { BOOKMARK_STATES } from './bookmark.constants.js';
import type {
  BookmarkModel,
  CreateBookmarkModel,
  OmnivoreBookmarkModel,
  UpdateBookmarkModel,
} from './bookmark.models.js';
import type {
  BookmarkWithLabelsDTO,
  InsertBookmarkDTO,
  UpdateBookmarkDTO,
} from './bookmark.repository.js';

export const mapCreateBookmarkModelToInsertBookmarkDTO = (
  bookmark: CreateBookmarkModel,
  userId: string
): InsertBookmarkDTO => {
  return {
    id: tsidGenerator.generate(),
    url: bookmark.url,
    slug: bookmark.slug,
    title: bookmark.title,
    description: bookmark.description,
    author: bookmark.author,
    thumbnail: bookmark.thumbnail,
    publishedAt: bookmark.publishedAt ? new Date(bookmark.publishedAt) : null,
    state: bookmark.state,
    userId,
  };
};

export const mapUpdateBookmarkModelToUpdateBookmarkDTO = (
  bookmark: UpdateBookmarkModel
): UpdateBookmarkDTO => {
  return {
    id: bookmark.id,
    url: bookmark.url,
    slug: bookmark.slug,
    title: bookmark.title,
    description: bookmark.description,
    author: bookmark.author,
    thumbnail: bookmark.thumbnail,
    publishedAt: bookmark.publishedAt ? new Date(bookmark.publishedAt) : null,
    state: bookmark.state,
  };
};

export const mapBookmarkDTOToBookmarkModel = (bookmark: BookmarkWithLabelsDTO): BookmarkModel => {
  const labels = bookmark.bookmarkLabel?.map((bl) => bl.label);
  return {
    id: bookmark.id,
    url: bookmark.url,
    slug: bookmark.slug,
    title: bookmark.title,
    description: bookmark.description,
    author: bookmark.author,
    thumbnail: bookmark.thumbnail,
    publishedAt: bookmark.publishedAt ? bookmark.publishedAt : null,
    createdAt: bookmark.createdAt,
    updatedAt: bookmark.updatedAt,
    state: bookmark.state,
    labels: labels || [],
  };
};

export const mapOnmivoreBookmarkToInsertBookmarkDTO = (
  bookmark: OmnivoreBookmarkModel
): CreateBookmarkModel => {
  return {
    url: bookmark.url,
    slug: bookmark.slug,
    title: bookmark.title,
    description: bookmark.description || null,
    author: bookmark.author || null,
    thumbnail: bookmark.thumbnail || null,
    publishedAt: bookmark.publishedAt ?? null,
    state: bookmark.state === 'Archived' ? BOOKMARK_STATES.archived : BOOKMARK_STATES.active,
    labels: [],
  };
};
