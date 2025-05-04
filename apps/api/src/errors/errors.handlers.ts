import { ErrorHandler } from "hono/types";
import { env, NodeEnvs } from "../env.js";
import { APIError, UnexpectedError } from "./errors.js";
import type { ErrorResponse } from "./errors.types.js";
import { Context } from "hono";

export type ResponseHandler = (error: APIError, c: Context) => Response;

const defaultResponseHandler = (err: APIError, c: Context): Response => {

  // Sanitize error message for production
  const publicMessage = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message

  const response: ErrorResponse = {
    error: {
      code: err.code,
      message: publicMessage,
      cause: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.cause : undefined,
      name: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.name : undefined,
      stack: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.stack : undefined
    },
    timestamp: new Date().toISOString()
  };

  return c.json(response, err.httpStatusCode || 500);
}

export const newErrorHandler = (errorHandlers: Function[], customHandler: ResponseHandler = defaultResponseHandler): ErrorHandler => {
  return (err: Error, c) => {
    let errorObj: APIError;
    if (!(err instanceof APIError)) {
      errorObj = new UnexpectedError('An unexpected error has ocurred')
    } else {
      errorObj = err;
    }

    // TODO: Add Log with error
    // console.error({
    //   timestamp: new Date().toISOString(),
    //   error: err.message,
    //   stack: err.stack,
    //   path: c.req.path,
    //   method: c.req.method
    // });

    if (Array.isArray(errorHandlers) && errorHandlers.length > 0) {
      if (!errorObj.message || !errorObj.httpStatusCode && errorObj) {
        for (const handleError of errorHandlers) {
          errorObj = handleError(errorObj);

          if (errorObj.httpStatusCode) {
            break;
          }
        }
      }
    }

    return customHandler(errorObj as APIError, c);
  };
};
