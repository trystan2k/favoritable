import { config } from "@dotenvx/dotenvx";
import { z, ZodError } from "zod";

export const NodeEnvs = {
  DEVELOPMENT: "development",
  TEST: "test",
  PRODUCTION: "production",
} as const;

const EnvSchema = z.object({
  NODE_ENV: z
    .enum([NodeEnvs.DEVELOPMENT, NodeEnvs.TEST, NodeEnvs.PRODUCTION]).default(NodeEnvs.DEVELOPMENT),
  DATABASE_URL: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

config();

try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = "Missing required values in .env:\n";
    error.issues.forEach((issue) => {
      message += issue.path[0] + "\n";
    });
    const e = new Error(message);
    e.stack = "";
    throw e;
  } else {
    console.error(error);
  }
}

export const env = EnvSchema.parse(process.env);
