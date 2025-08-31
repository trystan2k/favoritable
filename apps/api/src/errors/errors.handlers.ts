import type { Context } from 'hono';
import type { ErrorHandler } from 'hono/types';
import { logger } from '../core/logger.js';
import { env, NodeEnvs } from '../env.js';
import { APIError, UnexpectedError } from './errors.js';
import type { ErrorResponse } from './errors.types.js';

type ResponseHandler = (error: APIError, c: Context) => Response;

const defaultResponseHandler = (err: APIError, c: Context): Response => {
  c.header('Content-Type', 'application/json');

  // Sanitize error message for production
  const publicMessage =
    env.NODE_ENV === NodeEnvs.PRODUCTION
      ? 'An unexpected error occurred'
      : err.message;

  const response: ErrorResponse = {
    error: {
      code: err.code,
      message: publicMessage,
      cause: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.cause : undefined,
      name: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.name : undefined,
      stack: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.stack : undefined,
    },
    timestamp: new Date().toISOString(),
  };

  return c.json(response, err.httpStatusCode || 500);
};

const isAPIErrorInstance = (processedError: unknown) => {
  return (
    processedError instanceof APIError &&
    processedError.httpStatusCode !== undefined &&
    processedError.httpStatusCode !== null
  );
};

export const errorHandler = (
  errorHandlers: ((error: Error) => APIError)[],
  customHandler: ResponseHandler = defaultResponseHandler
): ErrorHandler => {
  return (err: Error, c) => {
    let errorObj: APIError;

    if (err instanceof APIError) {
      // First, check if it's already an APIError
      errorObj = err;
    } else {
      // If not an APIError, try to process it with specific error handlers first
      errorObj = err;

      if (Array.isArray(errorHandlers) && errorHandlers.length > 0) {
        for (const handleError of errorHandlers) {
          const processedError = handleError(err);

          if (isAPIErrorInstance(processedError)) {
            errorObj = processedError;
            break;
          }
        }
      }

      if (!isAPIErrorInstance(errorObj)) {
        // If no specific handler matched, use UnexpectedError as fallback
        errorObj = new UnexpectedError('An unexpected error has occurred');
      }
    }

    // Get request context for logging
    const requestId = c.get('requestId');
    const requestLogger = logger.child({
      requestId,
      context: 'error-handler',
    });

    // Log error with appropriate level
    const logLevel = (errorObj.httpStatusCode ?? 500) >= 500 ? 'error' : 'warn';
    requestLogger[logLevel]({
      error: {
        name: err.name,
        message: err.message,
        code: errorObj.code,
        httpStatusCode: errorObj.httpStatusCode,
        stack: err.stack,
      },
      request: {
        method: c.req.method,
        path: c.req.path,
        headers:
          env.NODE_ENV === NodeEnvs.DEVELOPMENT ? c.req.header() : undefined,
      },
      msg: `${logLevel === 'error' ? 'Server error' : 'Client error'} occurred`,
    });

    return customHandler(errorObj, c);
  };
};
