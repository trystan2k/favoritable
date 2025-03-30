import { z } from "zod";

// Create a schema that validates an ISO date string and converts it to a number
const dateSchema = z.string()
  .refine((value) => !isNaN(Date.parse(value)), {
    message: 'Invalid date format. Expected ISO string format (e.g., 2025-02-15T19:34:47.649Z)'
  })
  .transform((dateString) => new Date(dateString));

export const labelSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  color: z.string().optional().nullable().default(null),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type LabelModel = z.infer<typeof labelSchema>;

export const createLabelSchema = labelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateLabelModel = z.infer<typeof createLabelSchema>;

export const updateLabelSchema = labelSchema.partial().required({ id: true });

export type UpdateLabelModel = z.infer<typeof updateLabelSchema>;

export const deleteLabelssSchema = z.object({
  ids: z.string().array().nonempty(),
});