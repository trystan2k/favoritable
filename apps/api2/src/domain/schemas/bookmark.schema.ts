import { z } from 'zod';

export const labelSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});

export const createBookmarkSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  author: z.string().optional(),
  url: z.string().url(),
  thumbnail: z.string().url().optional(),
  publishedAt: z.coerce.date().optional()
});

export const updateBookmarkSchema = createBookmarkSchema.partial();

export const addLabelsSchema = z.object({
  labels: z.array(labelSchema)
});

export type CreateBookmarkDTO = z.infer<typeof createBookmarkSchema>;
export type UpdateBookmarkDTO = z.infer<typeof updateBookmarkSchema>;
export type AddLabelDTO = z.infer<typeof labelSchema>;