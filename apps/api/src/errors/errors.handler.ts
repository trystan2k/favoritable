
import { Context } from "hono";

import { env, NodeEnvs } from "../env.js";
import { APIError } from "./errors.js";
import { ErrorResponse } from "./errors.type.js";

const buildErrorResponse = (err: APIError) => {
  const response: ErrorResponse = {
    error: {
      code: err.code,
      message: err.message,
      cause: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.cause : undefined,
      name: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.name : undefined,
      stack: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.stack : undefined
    },
    timestamp: new Date().toISOString()
  };

  return response;
}

export const errorHandler = async (err: APIError, c: Context) => {
  const response = buildErrorResponse(err);
  return c.json(response, err.httpStatusCode || 500)
}
