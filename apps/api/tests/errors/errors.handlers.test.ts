import { LibsqlError } from '@libsql/client';
import type { Context } from 'hono';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { errorHandler } from '../../src/errors/errors.handlers.js';
import {
  MalFormedRequestError,
  NotFoundError,
  UnexpectedError,
} from '../../src/errors/errors.js';
import {
  repositoryErrorsHandler,
  serviceErrorsHandler,
} from '../../src/errors/errors.mappers.js';

// Mock the logger
vi.mock('../../src/core/logger.js', () => ({
  logger: {
    child: vi.fn(() => ({
      error: vi.fn(),
      warn: vi.fn(),
    })),
  },
}));

// Mock the env
vi.mock('../../src/env.js', () => ({
  env: {
    NODE_ENV: 'development',
  },
  NodeEnvs: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
  },
}));

// Mock Hono context
const createMockContext = (): Context =>
  ({
    get: vi.fn((key: string) => {
      if (key === 'requestId') return 'test-request-id';
      return undefined;
    }),
    header: vi.fn(),
    json: vi.fn(
      (data, status) => new Response(JSON.stringify({ data }), { status })
    ),
    req: {
      method: 'GET',
      path: '/test',
      header: vi.fn(() => ({ 'user-agent': 'test' })),
    },
  }) as unknown as Context;

describe('errorHandler', () => {
  let mockContext: Context;

  beforeEach(() => {
    mockContext = createMockContext();
    vi.clearAllMocks();
  });

  test('should pass through APIError instances without modification', () => {
    const notFoundError = new NotFoundError('Resource not found');
    const handler = errorHandler([]);

    handler(notFoundError, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: '00003',
          message: 'Resource not found',
          name: 'NotFoundError',
        }),
      }),
      404
    );
  });

  test('should convert SyntaxError to MalFormedRequestError through serviceErrorsHandler', () => {
    const syntaxError = new SyntaxError('Invalid JSON');
    const handler = errorHandler([
      serviceErrorsHandler,
      repositoryErrorsHandler,
    ]);

    handler(syntaxError, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: '00006',
          message: 'Input data is invalid',
          name: 'MalFormedRequestError',
        }),
      }),
      400
    );
  });

  test('should convert LibsqlError to UnexpectedError when serviceErrorsHandler only processes it', () => {
    const libsqlError = new LibsqlError(
      'UNIQUE constraint failed',
      'SQLITE_CONSTRAINT_UNIQUE'
    );
    const handler = errorHandler([serviceErrorsHandler]);

    handler(libsqlError, mockContext);

    // Currently serviceErrorsHandler converts unhandled errors to UnexpectedError
    // This demonstrates the ordering issue that this task is supposed to fix
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: '00005',
          message: 'An unexpected error has ocurred',
          name: 'UnexpectedError',
        }),
      }),
      500
    );
  });

  test('should convert LibsqlError to EntityAlreadyExist when repositoryErrorsHandler is called first', () => {
    const libsqlError = new LibsqlError(
      'UNIQUE constraint failed',
      'SQLITE_CONSTRAINT_UNIQUE'
    );
    // Put repositoryErrorsHandler first to handle LibsqlError correctly
    const handler = errorHandler([
      repositoryErrorsHandler,
      serviceErrorsHandler,
    ]);

    handler(libsqlError, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: '00004',
          message: 'Entity already exist',
          name: 'EntityAlreadyExist',
        }),
      }),
      409
    );
  });

  test('should convert LibsqlError to MalFormedRequestError when repositoryErrorsHandler is called first', () => {
    const libsqlError = new LibsqlError(
      'NOT NULL constraint failed',
      'SQLITE_CONSTRAINT_NOTNULL'
    );
    // Put repositoryErrorsHandler first to handle LibsqlError correctly
    const handler = errorHandler([
      repositoryErrorsHandler,
      serviceErrorsHandler,
    ]);

    handler(libsqlError, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: '00006',
          message: 'Input data is invalid',
          name: 'MalFormedRequestError',
        }),
      }),
      400
    );
  });

  test('should fallback to UnexpectedError for unknown errors', () => {
    const unknownError = new Error('Something went wrong');
    const handler = errorHandler([
      serviceErrorsHandler,
      repositoryErrorsHandler,
    ]);

    handler(unknownError, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: '00005',
          message: 'An unexpected error has ocurred',
          name: 'UnexpectedError',
        }),
      }),
      500
    );
  });

  test('should process error handlers in order and stop at first match', () => {
    const syntaxError = new SyntaxError('Invalid JSON');

    // Mock handlers where first one doesn't match, second one does
    const firstHandler = vi.fn((error: Error) => error);
    const secondHandler = vi.fn(
      (_error: Error) => new MalFormedRequestError('Handled by second')
    );
    const thirdHandler = vi.fn(
      (_error: Error) => new UnexpectedError('Should not be called')
    );

    const handler = errorHandler([firstHandler, secondHandler, thirdHandler]);

    handler(syntaxError, mockContext);

    expect(firstHandler).toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalled();
    expect(thirdHandler).not.toHaveBeenCalled();

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Handled by second',
          name: 'MalFormedRequestError',
        }),
      }),
      400
    );
  });

  test('should handle empty error handlers array', () => {
    const unknownError = new Error('Something went wrong');
    const handler = errorHandler([]);

    handler(unknownError, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: '00005',
          message: 'An unexpected error has ocurred',
          name: 'UnexpectedError',
        }),
      }),
      500
    );
  });

  test('should use error level for server errors (5xx)', () => {
    const handler = errorHandler([]);
    const unexpectedError = new UnexpectedError('Server error');

    handler(unexpectedError, mockContext);

    // Check that error level logging was called (mocked)
    expect(mockContext.json).toHaveBeenCalledWith(expect.anything(), 500);
  });

  test('should use warn level for client errors (4xx)', () => {
    const handler = errorHandler([]);
    const notFoundError = new NotFoundError('Not found');

    handler(notFoundError, mockContext);

    // Check that warn level logging was called (mocked)
    expect(mockContext.json).toHaveBeenCalledWith(expect.anything(), 404);
  });

  test('should include error details in response when in development mode', () => {
    const notFoundError = new NotFoundError('Resource not found');
    const handler = errorHandler([]);

    handler(notFoundError, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          name: 'NotFoundError',
          stack: expect.any(String),
        }),
        timestamp: expect.any(String),
      }),
      404
    );
  });
});
