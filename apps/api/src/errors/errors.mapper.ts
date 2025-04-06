import { LibsqlError } from "@libsql/client";
import { APIError, EntityAlreadyExist, MalFormedRequestError, UnexpectedError } from "./errors.js";

export const mapServiceErrors = (error: unknown, entity: string) => {

  if (error instanceof APIError) {
    error.message = `[${entity}] - ${error.message}`;
    return error;
  }

  const errorObj = (error as Error);

  // TODO use logging system
  console.log('mapServiceErrors', error)

  if (errorObj.name === 'SyntaxError') {
    return new MalFormedRequestError('Input data is invalid', `[${entity}] - ${errorObj.message}`);
  }

  return new UnexpectedError('An unexpected error has ocurred', `[${entity}] - ${errorObj.message}`);
}

export const mapRepositoryErrors = (error: unknown, entity: string) => {

  if (error instanceof APIError) {
    error.message = `[${entity}] - ${error.message}`;
    return error;
  }

  // TODO use logging system
  console.log('mapRepositoryErrors', error)

  if (error instanceof LibsqlError || (error instanceof Error && 'libsqlError' in error && error.libsqlError)) {
    const sqlError = error as unknown as LibsqlError;

    if (sqlError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return new EntityAlreadyExist('Entity already exist', `[${entity}] - ${error.message}`);
    }

    if (sqlError.code === 'SQLITE_CONSTRAINT_NOTNULL') {
      return new MalFormedRequestError('Input data is invalid', `[${entity}] - ${error.message}`);
    }

    if (sqlError.code === 'SQLITE_ERROR') {
      return new UnexpectedError('An unexpected error has ocurred', `[${entity}] - ${error.message}`);
    }
  }

  return new UnexpectedError('An unexpected error has ocurred', `[${entity}] - ${(error as Error).message}`);
}


