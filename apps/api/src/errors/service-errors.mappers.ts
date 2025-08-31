import { APIError, MalFormedRequestError } from './errors';

export const serviceErrorsHandler = (error: Error): Error | APIError => {
  if (error instanceof APIError) {
    return error;
  }

  if (error.name === 'SyntaxError') {
    return new MalFormedRequestError('Input data is invalid', error.message);
  }

  return error;
};
