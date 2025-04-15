
import { Context } from "hono";

import { env, NodeEnvs } from "../env.js";
import { APIError, UnexpectedError } from "./errors.js";
import { ErrorResponse } from "./errors.types.js";

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

export const errorHandler = async (err: Error, c: Context) => {

  let errorObj;
  if (!(err instanceof APIError)) {
    errorObj = new UnexpectedError('An unexpected error has ocurred')
  } else {
    errorObj = err;
  }

  const response = buildErrorResponse(errorObj);
  return c.json(response, errorObj.httpStatusCode || 500)
}
