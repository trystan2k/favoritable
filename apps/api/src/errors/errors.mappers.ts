import { LibsqlError } from '@libsql/client';
import {
  APIError,
  EntityAlreadyExist,
  MalFormedRequestError,
  UnexpectedError,
} from './errors.js';

export const serviceErrorsHandler = (error: APIError | Error) => {
  if (error instanceof APIError) {
    return error;
  }

  if ((error as Error).name === 'SyntaxError') {
    return new MalFormedRequestError(
      'Input data is invalid',
      (error as Error).message
    );
  }

  return error;
};

export const repositoryErrorsHandler = (error: Error | APIError) => {
  if (error instanceof APIError) {
    return error;
  }

  if (
    error instanceof LibsqlError ||
    (error instanceof Error && 'libsqlError' in error && error.libsqlError)
  ) {
    const sqlError = error as unknown as LibsqlError;

    if (sqlError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return new EntityAlreadyExist('Entity already exist', error.message);
    }

    if (sqlError.code === 'SQLITE_CONSTRAINT_NOTNULL') {
      return new MalFormedRequestError('Input data is invalid', error.message);
    }

    if (sqlError.code === 'SQLITE_ERROR') {
      return new UnexpectedError(
        'An unexpected error has ocurred',
        error.message
      );
    }
  }

  return error;
};
