import { Bookmark } from '../entities/bookmark.js';
import { Label } from '../entities/label.js';

export interface CreateBookmarkDTO {
  slug: string;
  title: string;
  description?: string;
  author?: string;
  url: string;
  thumbnail?: string;
  publishedAt?: Date;
}

export interface UpdateBookmarkDTO {
  slug?: string;
  title?: string;
  description?: string;
  author?: string;
  url?: string;
  thumbnail?: string;
  publishedAt?: Date;
}

export interface AddLabelDTO {
  id?: number;
  name: string;
  color?: string;
}

export interface BookmarkRepository {
  findAll(): Promise<Bookmark[]>;
  findById(id: string): Promise<Bookmark | null>;
  create(data: CreateBookmarkDTO): Promise<number>;
  update(id: string, data: UpdateBookmarkDTO): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  updateLabels(bookmarkId: string, labels: AddLabelDTO[]): Promise<void>;
}