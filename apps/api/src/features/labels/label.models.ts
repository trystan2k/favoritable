import { z } from 'zod';
import { dateSchema } from '../../core/validators.wrapper.js';

export const labelSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  color: z.string().optional().nullable().default(null),
  userId: z.string().nonempty(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type LabelModel = z.infer<typeof labelSchema>;

export const getLabelsQueryParamsSchema = z.object({
  q: z.string().optional(),
});
export type GetLabelsQueryParamsModel = z.infer<
  typeof getLabelsQueryParamsSchema
>;

export const createLabelSchema = labelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateLabelModel = z.infer<typeof createLabelSchema>;

export const labelIdParamSchema = labelSchema.pick({ id: true });

export const updateLabelSchema = labelSchema.partial();

export type UpdateLabelModel = z.infer<typeof updateLabelSchema> &
  Pick<LabelModel, 'id'>;

export const deleteLabelssSchema = z.object({
  ids: z.string().array().nonempty(),
});
