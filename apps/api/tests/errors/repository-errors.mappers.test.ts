import { LibsqlError } from '@libsql/client';
import { describe, expect, test } from 'vitest';
import {
  APIError,
  EntityAlreadyExist,
  MalFormedRequestError,
  UnexpectedError,
} from '../../src/errors/errors.js';
import { repositoryErrorsHandler } from '../../src/errors/repository-errors.mappers.js';

describe('repositoryErrorsHandler', () => {
  test('should return the error unchanged if it is already an APIError', () => {
    const error = new MalFormedRequestError('Test error');

    const result = repositoryErrorsHandler(error);

    expect(result).toBe(error);
    expect(result).toBeInstanceOf(APIError);
  });

  test('should handle SQLITE_CONSTRAINT_UNIQUE with status EntityAlreadyExist', () => {
    const error = new LibsqlError(
      'Entity already exist',
      'SQLITE_CONSTRAINT_UNIQUE'
    );

    const result = repositoryErrorsHandler(error);

    expect(result).toBeInstanceOf(EntityAlreadyExist);
    expect((result as APIError).message).toBe('Entity already exist');
    expect((result as APIError).httpStatusCode).toBe(409);
  });

  test('should handle SQLITE_CONSTRAINT_NOTNULL with status MalFormedRequestError', () => {
    const error = new LibsqlError(
      'Input data is invalid',
      'SQLITE_CONSTRAINT_NOTNULL'
    );

    const result = repositoryErrorsHandler(error);

    expect(result).toBeInstanceOf(MalFormedRequestError);
    expect((result as APIError).message).toBe('Input data is invalid');
    expect((result as APIError).httpStatusCode).toBe(400);
  });

  test('should handle SQLITE_CONSTRAINT_FOREIGNKEY with status MalFormedRequestError', () => {
    const error = new LibsqlError(
      'Foreign key constraint failed',
      'SQLITE_CONSTRAINT_FOREIGNKEY'
    );

    const result = repositoryErrorsHandler(error);

    expect(result).toBeInstanceOf(MalFormedRequestError);
    expect((result as APIError).message).toBe(
      'Input data is invalid. Foreign key constraint failed'
    );
    expect((result as APIError).httpStatusCode).toBe(400);
  });

  test('should handle SQLITE_ERROR with status UnexpectedError', () => {
    const error = new LibsqlError('Database Error', 'SQLITE_ERROR');

    const result = repositoryErrorsHandler(error);

    expect(result).toBeInstanceOf(UnexpectedError);
    expect((result as APIError).message).toBe(
      'An unexpected error has ocurred'
    );
    expect((result as APIError).httpStatusCode).toBe(500);
  });

  test('should handle any other error with status UnexpectedError', () => {
    class CustomError extends Error {
      libsqlError: string;

      constructor(message: string, error: string) {
        super(message);
        this.libsqlError = error;
      }
    }
    const error = new CustomError('Unknown Error', 'SQLLITE_UNKNOWN_ERROR');

    const result = repositoryErrorsHandler(error);

    expect(result).toBeInstanceOf(UnexpectedError);
    expect((result as APIError).message).toBe(
      'An unexpected error has ocurred in repository'
    );
    expect((result as APIError).httpStatusCode).toBe(500);
  });

  test('should return the error unchanged if it is not a LibsqlError', () => {
    const error = new Error('Generic error');

    const result = repositoryErrorsHandler(error);

    expect(result).toBe(error);
    expect(result).not.toBeInstanceOf(APIError);
  });

  test('should preserve the cause from LibsqlError', () => {
    const error = new LibsqlError(
      'Entity already exist',
      'SQLITE_CONSTRAINT_UNIQUE'
    );

    const result = repositoryErrorsHandler(error);

    expect(result).toBeInstanceOf(EntityAlreadyExist);
    expect((result as APIError).cause).toBe(
      'SQLITE_CONSTRAINT_UNIQUE: Entity already exist'
    );
  });
});
