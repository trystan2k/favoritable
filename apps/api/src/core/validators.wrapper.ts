import { ZodSchema } from 'zod'
import type { ValidationTargets } from 'hono'
import { zValidator as zv } from '@hono/zod-validator'
import { ValidationError } from '../errors/errors'

export const zValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result) => {
    if (!result.success) {
      throw new ValidationError('Schema Validation Error', result.error.errors);
    }
  })