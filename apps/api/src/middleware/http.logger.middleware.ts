import type { Context, Next } from 'hono';
import { createLogger } from '../core/logger.js';

// Hono middleware for request/response logging
export const loggerMiddleware = () => {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const requestLogger = createLogger('http');

    // Get request info
    const method = c.req.method;
    const path = c.req.path;
    const requestId = c.get('requestId') || crypto.randomUUID();

    // Set request ID in context for other middleware/handlers
    c.set('requestId', requestId);
    c.set('logger', requestLogger.child({ requestId }));

    // Log incoming request (DEBUG level - only in development)
    requestLogger.debug({
      requestId,
      method,
      path,
      headers: c.req.header(),
      query: c.req.query(),
      msg: 'Incoming request',
    });

    try {
      await next();

      const duration = Date.now() - startTime;
      const status = c.res.status;

      // Determine log level based on response status
      const logMethod =
        status >= 500 ? 'error' : status >= 400 ? 'warn' : status >= 300 ? 'debug' : 'info';

      // Log request completion with appropriate level
      requestLogger[logMethod]({
        requestId,
        method,
        path,
        status,
        duration: `${duration}ms`,
        msg: `Request completed - ${method} ${path} ${status} ${duration}ms`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log failed request
      requestLogger.error({
        requestId,
        method,
        path,
        duration: `${duration}ms`,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        msg: `Request failed - ${method} ${path} ${duration}ms`,
      });

      throw error;
    }
  };
};
