import { BookmarkDTO, BookmarkWithLabelsDTO, InsertBookmarkDTO, UpdateBookmarkDTO } from "../../db/dtos/bookmark.dtos";
import { tsidGenerator } from "../../utils/tsids-generator";
import { BookmarkModel, CreateBookmarkModel, UpdateBookmarkModel } from "./bookmark.models";

export const mapCreateBookmarkModelToInsertBookmarkDTO = (bookmark: CreateBookmarkModel): InsertBookmarkDTO => {
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
  }
}

export const mapUpdateBookmarkModelToInsertBookmarkDTO = (bookmark: UpdateBookmarkModel): UpdateBookmarkDTO => {
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
  }
}

export const mapBookmarkModeltoBookmarkDTO = (bookmark: BookmarkModel): BookmarkDTO => {
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
  }
}

export const mapBookmarkDTOToBookmarkModel = (bookmark: BookmarkWithLabelsDTO): BookmarkModel => {

  const labels = bookmark.bookmarkLabel?.map(bl => bl.label);
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
  }
}