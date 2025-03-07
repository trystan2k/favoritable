import { ContentfulStatusCode } from "hono/utils/http-status";

export class APIError extends Error {
  name: string
  code?: string
  httpStatusCode?: ContentfulStatusCode

  constructor(message: string, code?: string, name?: string) {
    super(message)
    this.name = name || 'UndefinedError';
    this.code = code || '00000';
  }
}

export class ValidationError extends APIError {
  code = '00002';
  name = 'ValidationError';
  httpStatusCode = 422 as ContentfulStatusCode;
}

export class NotFoundError extends APIError {
  code = '00003';
  name = 'NotFoundError';
  httpStatusCode = 404 as ContentfulStatusCode;
}

export class EntityAlreadyExist extends APIError {
  code = '00004';
  name = 'EntityAlreadyExist';
  httpStatusCode = 409 as ContentfulStatusCode;
}

export class UnexpectedError extends APIError {
  code = '00005';
  name = 'UnexpectedError';
  httpStatusCode = 500 as ContentfulStatusCode;
}

export class MalFormedRequestError extends APIError {
  code = '00006';
  name = 'MalFormedRequestError';
  httpStatusCode = 400 as ContentfulStatusCode;
}
