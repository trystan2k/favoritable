import { config } from '@dotenvx/dotenvx';
import { ZodError, z } from 'zod';

export const NodeEnvs = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum([NodeEnvs.DEVELOPMENT, NodeEnvs.TEST, NodeEnvs.PRODUCTION])
      .default(NodeEnvs.DEVELOPMENT),
    DATABASE_TYPE: z.enum(['local', 'turso']).default('local'),
    LOCAL_DATABASE_URL: z.string().default('file:local.db'),
    TURSO_DATABASE_URL: z.string().optional(),
    TURSO_AUTH_TOKEN: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.DATABASE_TYPE === 'turso') {
      if (!data.TURSO_DATABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'TURSO_DATABASE_URL is required when DATABASE_TYPE is turso',
          path: ['TURSO_DATABASE_URL'],
        });
      }
      if (!data.TURSO_AUTH_TOKEN) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'TURSO_AUTH_TOKEN is required when DATABASE_TYPE is turso',
          path: ['TURSO_AUTH_TOKEN'],
        });
      }
    }
  });

config();

try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = 'Missing required values in .env:\n';
    error.issues.forEach((issue) => {
      message += `${issue.path[0]}\n`;
    });
    const e = new Error(message);
    e.stack = '';
    throw e;
  } else {
    // Use logger here once the environment is properly loaded
    // biome-ignore lint/suspicious/noConsole: Unexpected error during environment validation
    console.error('Unexpected error during environment validation:', error);
  }
}

export const env = EnvSchema.parse(process.env);
