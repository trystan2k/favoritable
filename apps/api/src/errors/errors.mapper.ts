import { LibsqlError } from "@libsql/client/.";
import { APIError, EntityAlreadyExist, MalFormedRequestError, UnexpectedError } from "./errors";

export const mapErrors = (error: unknown, entity: string) => {

  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof Error && 'libsqlError' in error && error.libsqlError) {
    const sqlError = error as unknown as LibsqlError;

    if (sqlError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return new EntityAlreadyExist(`${entity} already exist`, error.message);
    }

    if (sqlError.code === 'SQLITE_CONSTRAINT_NOTNULL') {
      return new MalFormedRequestError(`${entity} input data is invalid`, error.message);
    }
  }

  return new UnexpectedError('An unexpected error has ocurred', (error as Error).message);
}