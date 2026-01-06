import { describe, expect, test } from 'vitest';
import { APIError, MalFormedRequestError, URLContentParseError } from '../../src/errors/errors.js';
import { serviceErrorsHandler } from '../../src/errors/service-errors.mappers.js';

describe('authErrorsHandler', () => {
  test('should return the error unchanged if it is already an APIError', () => {
    const error = new URLContentParseError('Test error');

    const result = serviceErrorsHandler(error);

    expect(result).toBe(error);
    expect(result).toBeInstanceOf(APIError);
  });

  test('should handle Syntax error and return MalFormedRequestError', () => {
    const syntaxError = new SyntaxError('Invalid JSON');

    const result = serviceErrorsHandler(syntaxError);

    expect(result).toBeInstanceOf(MalFormedRequestError);
    expect((result as APIError).message).toBe('Input data is invalid');
    expect((result as APIError).httpStatusCode).toBe(400);
  });

  test('should return the error unchanged if it is not a Syntax error', () => {
    const error = new Error('Generic error');

    const result = serviceErrorsHandler(error);

    expect(result).toBe(error);
    expect(result).not.toBeInstanceOf(APIError);
  });

  test('should preserve the cause from Syntax error', () => {
    const syntaxError = new SyntaxError('Invalid JSON');

    const result = serviceErrorsHandler(syntaxError);

    expect(result).toBeInstanceOf(MalFormedRequestError);
    expect((result as APIError).cause).toBe('Invalid JSON');
  });
});
