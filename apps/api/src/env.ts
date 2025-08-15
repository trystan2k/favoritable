import { config } from '@dotenvx/dotenvx';
import { ZodError, z } from 'zod';

export const NodeEnvs = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;

// Base environment schema
const BaseEnvSchema = z.object({
  NODE_ENV: z
    .enum([NodeEnvs.DEVELOPMENT, NodeEnvs.TEST, NodeEnvs.PRODUCTION])
    .default(NodeEnvs.DEVELOPMENT),
  DATABASE_TYPE: z.enum(['local', 'turso']).default('local'),
  LOCAL_DATABASE_URL: z.string().optional(),
  TURSO_DATABASE_URL: z.string().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),
});

// Discriminated union for type-safe environment based on DATABASE_TYPE
const LocalEnvSchema = BaseEnvSchema.extend({
  DATABASE_TYPE: z.literal('local'),
  LOCAL_DATABASE_URL: z.string(),
});

const TursoEnvSchema = BaseEnvSchema.extend({
  DATABASE_TYPE: z.literal('turso'),
  TURSO_DATABASE_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
});

const EnvSchema = z.discriminatedUnion('DATABASE_TYPE', [
  LocalEnvSchema,
  TursoEnvSchema,
]);

// Load environment variables
config();

// Parse environment once and export the validated result
let parsedEnv: z.infer<typeof EnvSchema>;
try {
  parsedEnv = EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = 'Environment validation errors:\n';
    error.issues.forEach((issue) => {
      message += `Environment variable "${issue.path.join('.')}" is invalid -> ${issue.message}\n`;
    });
    const e = new Error(message);
    e.stack = '';
    throw e;
  } else {
    throw error;
  }
}

export const env = parsedEnv;
