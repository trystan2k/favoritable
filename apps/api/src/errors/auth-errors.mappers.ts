import { APIError as BetterAuthAPIError } from 'better-auth/api';
import {
  APIError,
  MalFormedRequestError,
  NotAcceptedError,
  NotAuthorizedError,
  NotFoundError,
  UnexpectedError,
} from './errors.js';

export const authErrorsHandler = (error: Error): Error | APIError => {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof BetterAuthAPIError) {
    const statusCode = error.statusCode;
    const message = error.message;

    switch (statusCode) {
      case 400:
        return new MalFormedRequestError(
          'Authentication request is invalid',
          message
        );
      case 401:
      case 403:
        return new NotAuthorizedError('Authentication failed', message);
      case 404:
        return new NotFoundError('Authentication failed', message);
      case 422:
        return new MalFormedRequestError(
          'Authentication validation failed',
          message
        );
      case 429:
        return new NotAcceptedError(
          'Authentication rate limit exceeded',
          message
        );
      default:
        return new UnexpectedError(
          'An unexpected authentication error occurred',
          message
        );
    }
  }

  return error;
};
