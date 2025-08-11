import { z } from 'zod';
import { dateSchema } from '../../core/validators.wrapper.js';
import { labelSchema, updateLabelSchema } from '../labels/label.models.js';
import { BOOKMARK_STATES } from './bookmark.constants.js';

type BookmarkStateKey = keyof typeof BOOKMARK_STATES;

const bookmarkStateValues = Object.keys(BOOKMARK_STATES) as [
  BookmarkStateKey,
  ...BookmarkStateKey[],
];

const bookmarkSchema = z.object({
  id: z.string().nonempty(),
  title: z.string().nonempty(),
  slug: z.string().nonempty(),
  url: z.string().url().nonempty(),
  description: z.string().optional().nullable().default(null),
  author: z.string().optional().nullable().default(null),
  thumbnail: z.string().url().optional().nullable().default(null),
  publishedAt: dateSchema.optional().nullable().default(null),
  state: z.enum(bookmarkStateValues).optional().default(BOOKMARK_STATES.active),
  labels: labelSchema.array().optional().nullable().default([]),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type BookmarkModel = z.infer<typeof bookmarkSchema>;

export const getBookmarksQueryParamsSchema = z
  .object({
    limit: z.coerce.number().int().positive().optional().default(10),
    q: z.string().optional(),
    cursor: z.string().optional(),
  })
  .extend({
    label: bookmarkSchema.shape.labels.optional(),
    state: bookmarkSchema.shape.state.optional(),
  });

export type GetBookmarksQueryParamsModel = z.infer<
  typeof getBookmarksQueryParamsSchema
>;

export type BookmarksModel = {
  data: BookmarkModel[];
  pagination: {
    next: string | null;
    self: string | null;
  };
};

export const createBookmarkSchema = bookmarkSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateBookmarkModel = z.infer<typeof createBookmarkSchema>;

export const createBookmarkFromURLSchema = z.object({
  url: z.string().url().nonempty(),
});

export const bookmarkIdParamSchema = bookmarkSchema.pick({
  id: true,
});

export const deleteBookmarksSchema = z.object({
  ids: z.string().array().nonempty(),
});

export const updateBookmarkSchema = bookmarkSchema
  .partial()
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    labels: updateLabelSchema
      .refine((data) => Boolean('id' in data || 'name' in data), {
        message: 'Either id or name must be provided',
      })
      .array()
      .optional()
      .nullable()
      .default([]),
  });

export type UpdateBookmarkModel = z.infer<typeof updateBookmarkSchema> &
  Pick<BookmarkModel, 'id'>;

export const importOmnivoreBookmarksSchema = z.object({
  id: z.string().nonempty(),
  slug: z.string().nonempty(),
  title: z.string().nonempty(),
  description: z.string().optional().nullable().default(null),
  author: z.string().optional().nullable().default(null),
  url: z.string().url().nonempty(),
  state: z.enum(['Archived', 'Active']).optional().default('Active'),
  readingProgress: z.number().optional().nullable().default(0),
  thumbnail: z.string().url().optional().nullable().default(null),
  labels: z.string().array().optional().nullable().default([]),
  savedAt: dateSchema,
  updatedAt: dateSchema,
  publishedAt: dateSchema.optional().nullable().default(null),
});

export type OmnivoreBookmarkModel = z.infer<
  typeof importOmnivoreBookmarksSchema
>;

export const importFromHTMLFileQueryParamsSchema = z.object({
  folderName: z.string().optional(),
});
