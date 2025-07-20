import { ErrorHandler } from "hono/types";
import { env, NodeEnvs } from "../env.js";
import { logger } from "../core/logger.js";
import { APIError, UnexpectedError } from "./errors.js";
import type { ErrorResponse } from "./errors.types.js";
import { Context } from "hono";

export type ResponseHandler = (error: APIError, c: Context) => Response;

const defaultResponseHandler = (err: APIError, c: Context): Response => {
  c.header('Content-Type', 'application/json');

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

export const errorHandler = (errorHandlers: Function[], customHandler: ResponseHandler = defaultResponseHandler): ErrorHandler => {
  return (err: Error, c) => {
    let errorObj: APIError;
    if (!(err instanceof APIError)) {
      errorObj = new UnexpectedError('An unexpected error has ocurred')
    } else {
      errorObj = err;
    }

    // Get request context for logging
    const requestId = c.get('requestId');
    const requestLogger = logger.child({ 
      requestId,
      context: 'error-handler'
    });

    // Log error with appropriate level
    const logLevel = (errorObj.httpStatusCode ?? 500) >= 500 ? 'error' : 'warn';
    requestLogger[logLevel]({
      error: {
        name: err.name,
        message: err.message,
        code: errorObj.code,
        httpStatusCode: errorObj.httpStatusCode,
        stack: err.stack
      },
      request: {
        method: c.req.method,
        path: c.req.path,
        headers: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? c.req.header() : undefined
      },
      msg: `${logLevel === 'error' ? 'Server error' : 'Client error'} occurred`
    });

    if (Array.isArray(errorHandlers) && errorHandlers.length > 0) {
      if (!errorObj.message || !errorObj.httpStatusCode) {
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
