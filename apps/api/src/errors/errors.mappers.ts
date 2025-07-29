import { LibsqlError } from "@libsql/client";
import { APIError, EntityAlreadyExist, MalFormedRequestError, UnexpectedError } from "./errors.js";

export const serviceErrorsHandler = (error: unknown) => {

  if (error instanceof APIError) {
    return error;
  }

  const errorObj = (error as Error);

  if (errorObj.name === 'SyntaxError') {
    return new MalFormedRequestError('Input data is invalid', errorObj.message);
  }

  return new UnexpectedError('An unexpected error has ocurred', errorObj.message);
}

export const repositoryErrorsHandler = (error: unknown) => {

  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof LibsqlError || (error instanceof Error && 'libsqlError' in error && error.libsqlError)) {
    const sqlError = error as unknown as LibsqlError;

    if (sqlError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return new EntityAlreadyExist('Entity already exist', error.message);
    }

    if (sqlError.code === 'SQLITE_CONSTRAINT_NOTNULL') {
      return new MalFormedRequestError('Input data is invalid', error.message);
    }

    if (sqlError.code === 'SQLITE_ERROR') {
      return new UnexpectedError('An unexpected error has ocurred', error.message);
    }
  }

  return new UnexpectedError('An unexpected error has ocurred', (error as Error).message);
}


