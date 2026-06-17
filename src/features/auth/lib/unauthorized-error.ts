export const unauthorizedErrorCode = 'UNAUTHORIZED';
export const unauthorizedErrorMessage = 'Authentication required.';
export const unauthorizedErrorStatusCode = 401;

export const unauthorizedServerFunctionError = {
  code: unauthorizedErrorCode,
  message: unauthorizedErrorMessage,
  statusCode: unauthorizedErrorStatusCode
} as const;
