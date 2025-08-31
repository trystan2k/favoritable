import type { Context } from 'hono';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { errorHandler } from '../../src/errors/errors.handlers.js';
import {
  APIError,
  MalFormedRequestError,
  NotFoundError,
  UnexpectedError,
} from '../../src/errors/errors.js';

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
let mockNodeEnv = 'development';
vi.mock('../../src/env.js', () => ({
  get env() {
    return {
      NODE_ENV: mockNodeEnv,
    };
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
    mockNodeEnv = 'development';
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

  test('should hide error message details if in PRODUCTION NODE_ENV', () => {
    mockNodeEnv = 'production';
    const notFoundError = new NotFoundError('Resource not found', {
      cause: 'Some cause',
    });
    const handler = errorHandler([]);

    handler(notFoundError, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: '00003',
          message: 'An unexpected error occurred',
          cause: undefined,
          name: undefined,
          stack: undefined,
        }),
      }),
      404
    );
  });

  test('should default to 500 HTTP code if API Error does not have a default value', () => {
    class WrongAPIError extends APIError {
      code = '99999';
      name = 'WrongAPIError';
      httpStatusCode = undefined;
    }

    const customError = new WrongAPIError('Custom error');

    const handler = errorHandler([]);

    handler(customError, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: '99999',
          message: 'Custom error',
          name: 'WrongAPIError',
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
          message: 'An unexpected error has occurred',
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
