export interface Label {
  id: number;
  name: string;
  color?: string;
  createdAt: Date;
}

export interface Bookmark {
  id: number;
  slug: string;
  title: string;
  description?: string;
  author?: string;
  url: string;
  thumbnail?: string;
  labels?: Label[];
  savedAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type CreateBookmarkDTO = Omit<Bookmark, 'id' | 'savedAt' | 'updatedAt' | 'labels'>;
export type UpdateBookmarkDTO = Partial<CreateBookmarkDTO>;

export type AddLabelDTO = Omit<Label, 'createdAt'>;

export type CreateLabelDTO = Omit<Label, 'id' | 'createdAt'>;
export type UpdateLabelDTO = Partial<CreateLabelDTO>;
