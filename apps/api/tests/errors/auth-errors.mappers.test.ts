import { APIError as BetterAuthAPIError } from 'better-auth/api';
import { describe, expect, test } from 'vitest';
import { authErrorsHandler } from '../../src/errors/auth-errors.mappers.js';
import {
  APIError,
  MalFormedRequestError,
  NotAcceptedError,
  NotFoundError,
  UnexpectedError,
} from '../../src/errors/errors.js';

describe('authErrorsHandler', () => {
  test('should return the error unchanged if it is already an APIError', () => {
    const error = new MalFormedRequestError('Test error');

    const result = authErrorsHandler(error);

    expect(result).toBe(error);
    expect(result).toBeInstanceOf(APIError);
  });

  test('should handle Better Auth APIError with status 400', () => {
    const betterAuthError = new BetterAuthAPIError('BAD_REQUEST', {
      message: 'Invalid request data',
    });

    const result = authErrorsHandler(betterAuthError);

    expect(result).toBeInstanceOf(MalFormedRequestError);
    expect((result as APIError).message).toBe(
      'Authentication request is invalid'
    );
    expect((result as APIError).httpStatusCode).toBe(400);
  });

  test('should handle Better Auth APIError with status 401', () => {
    const betterAuthError = new BetterAuthAPIError('UNAUTHORIZED', {
      message: 'Invalid credentials',
    });

    const result = authErrorsHandler(betterAuthError);

    expect(result).toBeInstanceOf(NotAcceptedError);
    expect((result as APIError).message).toBe('Authentication failed');
    expect((result as APIError).httpStatusCode).toBe(406);
  });

  test('should handle Better Auth APIError with status 403', () => {
    const betterAuthError = new BetterAuthAPIError('FORBIDDEN', {
      message: 'Access denied',
    });

    const result = authErrorsHandler(betterAuthError);

    expect(result).toBeInstanceOf(NotAcceptedError);
    expect((result as APIError).message).toBe('Authentication failed');
    expect((result as APIError).httpStatusCode).toBe(406);
  });

  test('should handle Better Auth APIError with status 404', () => {
    const betterAuthError = new BetterAuthAPIError('NOT_FOUND', {
      message: 'Resource not found',
    });

    const result = authErrorsHandler(betterAuthError);

    expect(result).toBeInstanceOf(NotFoundError);
    expect((result as APIError).message).toBe('Authentication failed');
    expect((result as APIError).httpStatusCode).toBe(404);
  });

  test('should handle Better Auth APIError with status 422', () => {
    const betterAuthError = new BetterAuthAPIError('UNPROCESSABLE_ENTITY', {
      message: 'Validation failed',
    });

    const result = authErrorsHandler(betterAuthError);

    expect(result).toBeInstanceOf(MalFormedRequestError);
    expect((result as APIError).message).toBe(
      'Authentication validation failed'
    );
    expect((result as APIError).httpStatusCode).toBe(400);
  });

  test('should handle Better Auth APIError with status 429', () => {
    const betterAuthError = new BetterAuthAPIError('TOO_MANY_REQUESTS', {
      message: 'Rate limit exceeded',
    });

    const result = authErrorsHandler(betterAuthError);

    expect(result).toBeInstanceOf(NotAcceptedError);
    expect((result as APIError).message).toBe(
      'Authentication rate limit exceeded'
    );
    expect((result as APIError).httpStatusCode).toBe(406);
  });

  test('should handle Better Auth APIError with unknown status code', () => {
    const betterAuthError = new BetterAuthAPIError('INTERNAL_SERVER_ERROR', {
      message: 'Internal server error',
    });

    const result = authErrorsHandler(betterAuthError);

    expect(result).toBeInstanceOf(UnexpectedError);
    expect((result as APIError).message).toBe(
      'An unexpected authentication error occurred'
    );
    expect((result as APIError).httpStatusCode).toBe(500);
  });

  test('should return the error unchanged if it is not a Better Auth APIError', () => {
    const error = new Error('Generic error');

    const result = authErrorsHandler(error);

    expect(result).toBe(error);
    expect(result).not.toBeInstanceOf(APIError);
  });

  test('should preserve the cause from Better Auth APIError', () => {
    const betterAuthError = new BetterAuthAPIError('BAD_REQUEST', {
      message: 'Invalid request data',
    });

    const result = authErrorsHandler(betterAuthError);

    expect(result).toBeInstanceOf(MalFormedRequestError);
    expect((result as APIError).cause).toBe('Invalid request data');
  });
});
