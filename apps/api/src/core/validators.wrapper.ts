import { z, ZodSchema } from 'zod'
import type { ValidationTargets } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ValidationError } from '../errors/errors.js'

export const zCustomValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new ValidationError('Schema Validation Error', result.error.errors);
    }
  });

// Create a schema that validates an ISO date string and converts it to a number
export const dateSchema = z.string()
  .refine((value) => !isNaN(Date.parse(value)), {
    message: 'Invalid date format. Expected ISO string format (e.g., 2025-02-15T19:34:47.649Z)'
  })
  .transform((dateString) => new Date(dateString));