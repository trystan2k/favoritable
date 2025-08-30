import { LibsqlError } from '@libsql/client';
import {
  APIError,
  EntityAlreadyExist,
  MalFormedRequestError,
  UnexpectedError,
} from './errors';

export const repositoryErrorsHandler = (error: Error): Error | APIError => {
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

    if (sqlError.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return new MalFormedRequestError(
        'Input data is invalid. Foreign key constraint failed',
        error.message
      );
    }

    if (sqlError.code === 'SQLITE_ERROR') {
      return new UnexpectedError(
        'An unexpected error has ocurred',
        error.message
      );
    }

    return new UnexpectedError(
      'An unexpected error has ocurred in repository',
      error.message
    );
  }

  return error;
};
