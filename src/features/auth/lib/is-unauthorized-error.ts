import {
  unauthorizedErrorCode,
  unauthorizedErrorMessage,
  unauthorizedErrorStatusCode
} from '@/features/auth/lib/unauthorized-error';

export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status === unauthorizedErrorStatusCode;
  }

  if (!error || typeof error !== 'object') {
    return false;
  }

  const status = Reflect.get(error, 'status');

  if (status === unauthorizedErrorStatusCode) {
    return true;
  }

  const statusCode = Reflect.get(error, 'statusCode');

  if (statusCode === unauthorizedErrorStatusCode) {
    return true;
  }

  const code = Reflect.get(error, 'code');

  if (code === unauthorizedErrorCode) {
    return true;
  }

  const message = Reflect.get(error, 'message');

  if (message === unauthorizedErrorMessage) {
    return true;
  }

  const data = Reflect.get(error, 'data');

  if (data !== undefined && isUnauthorizedError(data)) {
    return true;
  }

  const cause = Reflect.get(error, 'cause');

  if (cause !== undefined && isUnauthorizedError(cause)) {
    return true;
  }

  return false;
}
