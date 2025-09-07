import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class APIError extends Error {
  name: string;
  code?: string;
  httpStatusCode?: ContentfulStatusCode;
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'UndefinedError';
    this.code = '00000';
    this.cause = cause;
  }
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

export class URLContentParseError extends APIError {
  code = '00007';
  name = 'URLContentParseError';
  httpStatusCode = 424 as ContentfulStatusCode;
}

export class NotAcceptedError extends APIError {
  code = '00008';
  name = 'NotAcceptedError';
  httpStatusCode = 406 as ContentfulStatusCode;
}

export class NotAuthorizedError extends APIError {
  code = '00009';
  name = 'NotAuthorizedError';
  httpStatusCode = 401 as ContentfulStatusCode;
}
