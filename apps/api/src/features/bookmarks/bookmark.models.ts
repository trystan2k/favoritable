import { z } from "zod";
import { createLabelSchema, labelSchema, updateLabelSchema } from "../labels/label.models";
import { BOOKMARK_STATES } from "./bookmark.constants";

type BookmarkStateKey = keyof typeof BOOKMARK_STATES;
const bookmarkStateValues = Object.keys(BOOKMARK_STATES) as [BookmarkStateKey, ...BookmarkStateKey[]];

// Create a schema that validates an ISO date string and converts it to a number
const dateSchema = z.string()
  .refine((value) => !isNaN(Date.parse(value)), {
    message: 'Invalid date format. Expected ISO string format (e.g., 2025-02-15T19:34:47.649Z)'
  })
  .transform((dateString) => new Date(dateString));

export const bookmarkSchema = z.object({
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

export const getBookmarksQueryParamsSchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(10),
  q: z.string().optional(),
  cursor: z.string().optional(),
}).extend({
  label: bookmarkSchema.shape.labels.optional(),
  state: bookmarkSchema.shape.state.optional(),
});
export type GetBookmarksQueryParamsModel = z.infer<typeof getBookmarksQueryParamsSchema>;

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
export type CreateBookmarkFromURLModel = z.infer<typeof createBookmarkFromURLSchema>;

export const bookmarkIdParamSchema = z.object({ id: z.string().nonempty() });
export type BookmarkIdParamModel = z.infer<typeof bookmarkIdParamSchema>;

export const deleteBookmarksSchema = z.object({
  ids: z.string().array().nonempty(),
});
export type DeleteBookmarksModel = z.infer<typeof deleteBookmarksSchema>;

export const updateBookmarkSchema = bookmarkSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  labels: updateLabelSchema.or(createLabelSchema).refine(data => Boolean('id' in data || 'name' in data), { message: 'Either id or name must be provided' }).array().optional().nullable().default([]),
});

export const updateBookmarksSchema = updateBookmarkSchema.required({ id: true }).array();

export type UpdateBookmarkModel = z.infer<typeof updateBookmarkSchema> & Pick<BookmarkModel, 'id'>;