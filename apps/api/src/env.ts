import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from '@dotenvx/dotenvx';
import { ZodError, z } from 'zod';
import { LogLevels } from './core/types';
import { DATABASE_TYPES } from './db/types';

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
  DATABASE_TYPE: z
    .enum([DATABASE_TYPES.LOCAL, DATABASE_TYPES.TURSO])
    .default(DATABASE_TYPES.LOCAL),
  LOCAL_DATABASE_URL: z.string().optional(),
  TURSO_DATABASE_URL: z.string().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),

  // Logging configuration (Possible values are from LogLevels)
  LOG_LEVEL: z
    .enum([
      LogLevels.FATAL,
      LogLevels.ERROR,
      LogLevels.WARN,
      LogLevels.INFO,
      LogLevels.DEBUG,
      LogLevels.TRACE,
      LogLevels.SILENT,
    ] as const)
    .default(LogLevels.INFO),

  // OAuth Provider Credentials (optional to support partial configurations)
  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Facebook OAuth
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // Twitter/X OAuth
  TWITTER_CLIENT_ID: z.string().optional(),
  TWITTER_CLIENT_SECRET: z.string().optional(),

  // Apple OAuth (Apple uses JWT for client secret generation)
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(), // Generated JWT client secret
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY_PATH: z.string().optional(),
  APPLE_APP_BUNDLE_IDENTIFIER: z.string().optional(),
});

// Discriminated union for type-safe environment based on DATABASE_TYPE
const LocalEnvSchema = BaseEnvSchema.extend({
  DATABASE_TYPE: z.literal(DATABASE_TYPES.LOCAL),
  LOCAL_DATABASE_URL: z.string(),
});

const TursoEnvSchema = BaseEnvSchema.extend({
  DATABASE_TYPE: z.literal(DATABASE_TYPES.TURSO),
  TURSO_DATABASE_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
});

const EnvSchema = z.discriminatedUnion('DATABASE_TYPE', [
  LocalEnvSchema,
  TursoEnvSchema,
]);

if (process.env.NODE_ENV === NodeEnvs.TEST) {
  const envFileName = '.env.test';
  const envTestPath = path.resolve(process.cwd(), envFileName);
  if (!existsSync(envTestPath)) {
    throw new Error(
      `Missing ${envFileName} file in project root. Please create ${envTestPath} for test environment variables.`
    );
  }
  config({ path: [envFileName] });
} else {
  config();
}

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
