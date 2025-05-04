import { Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { NotAcceptedError } from '../errors/errors.js';

export const addCorsHeaders = () => {
  return cors({
    origin: ['http://localhost:3000'], // Add your frontend origins
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
  })
}

export const setContentTypeHeaders = (contentType = 'application/json') => {
  return async (c: Context, next: Next) => {
    // Set default content type for all responses
    c.header('Content-Type', contentType);
    await next();
  };
};

export const validateAcceptHeader = () => {
  return async (c: Context, next: Next) => {
    const accept = c.req.header('Accept');
    if (accept && !accept.includes('application/json') && !accept.includes('multipart/form-data') && !accept.includes('*/*')) {
      throw new NotAcceptedError('Unsupported Accept header', `Accept header must be application/json or */*`);
    }
    return next();
  };
};

export const addSecurityHeaders = () => {
  return async (c: Context, next: Next) => {
    // Security headers
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    await next();
  };
};

export const addCacheHeaders = () => {
  return async (c: Context, next: Next) => {
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    c.header('Pragma', 'no-cache');
    await next();
  };
};
