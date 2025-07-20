import { Context, Next } from 'hono';
import pinoHttp from 'pino-http';
import { baseLogger, createLogger } from './logger.js';

// Create HTTP logger instance
const httpLogger = pinoHttp({
  logger: baseLogger,
  customProps: (req) => {
    return {
      requestId: req.id,
    };
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    if (res.statusCode >= 300) {
      return 'debug';
    }
    return 'info';
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.headers,
    }),
  },
  // Configure auto logging behavior
  autoLogging: {
    ignore: (req) => [
      '/health',
      '/favicon.ico',
    ].includes(req.url!),
  },
});

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
      msg: 'Incoming request'
    });

    try {
      await next();
      
      const duration = Date.now() - startTime;
      const status = c.res.status;
      
      // Determine log level based on response status
      const logMethod = status >= 500 ? 'error' 
                      : status >= 400 ? 'warn'
                      : status >= 300 ? 'debug'
                      : 'info';

      // Log request completion with appropriate level
      requestLogger[logMethod]({
        requestId,
        method,
        path,
        status,
        duration: `${duration}ms`,
        msg: `Request completed - ${method} ${path} ${status} ${duration}ms`
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log failed request
      requestLogger.error({
        requestId,
        method,
        path,
        duration: `${duration}ms`,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        msg: `Request failed - ${method} ${path} ${duration}ms`
      });
      
      throw error;
    }
  };
};

// Helper function to get logger from context
export const getRequestLogger = (c: Context) => {
  return c.get('logger') || createLogger('http');
};

// Export the raw HTTP logger for direct use if needed
export { httpLogger };
