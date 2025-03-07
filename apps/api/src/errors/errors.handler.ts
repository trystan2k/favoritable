
import { Context } from "hono";
import { getErrorClass } from "./errors.mapper";
import { env } from "process";
import { NodeEnvs } from "../env";
import { APIError } from "./errors";
import { ErrorResponse } from "./errors.type";

const buildErrorResponse = (err: APIError) => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: err.code,
      message: err.message,
      name: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.name : undefined,
      details: env.NODE_ENV === NodeEnvs.DEVELOPMENT ? err.stack : undefined
    },
    timestamp: new Date().toISOString()
  };

  return response;
}

export const errorHandler = async (err: Error, c: Context) => {

  const ErrorClass = getErrorClass(err);
  const error = new ErrorClass(err.message);

  const response = buildErrorResponse(error);

  return c.json(response, error.httpStatusCode || 500)
}
