import { LibsqlError } from "@libsql/client/.";
import { APIError, EntityAlreadyExist, MalFormedRequestError, UnexpectedError } from "./errors";

const mapSQLErrors = (error: LibsqlError) => {
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return EntityAlreadyExist;
  }

  if (error.code === 'SQLITE_CONSTRAINT_NOTNULL') {
    return MalFormedRequestError;
  }

  return UnexpectedError;
}

export const getErrorClass = (error: Error) => {

  console.log('error', error);

  if ('libsqlError' in error && error.libsqlError) {
    return mapSQLErrors(error as unknown as LibsqlError);
  }

  if (error instanceof APIError) {
    return APIError;
  }

  return UnexpectedError;
}
