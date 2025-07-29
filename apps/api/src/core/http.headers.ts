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

const API_VERSIONS = {
  LATEST: 'v1',
  V1: 'v1'
} as const;

type APIVersion = typeof API_VERSIONS[keyof typeof API_VERSIONS];

const DEPRECATED_VERSIONS: APIVersion[] = [];
const VERSION_REGEX = /application\/vnd\.favoritable\.v(\d+)\+json/;

export const parseAPIVersion = () => {
  return async (c: Context, next: Next) => {
    const accept = c.req.header('Accept');

    // Allow if no Accept header is present (defaults to latest version)
    if (!accept) {
      c.set('apiVersion', API_VERSIONS.LATEST);
      return next();
    }

    const versionMatch = accept.match(VERSION_REGEX);
    if (versionMatch) {
      const version = `v${versionMatch[1]}` as APIVersion;
      if (DEPRECATED_VERSIONS.includes(version)) {
        throw new NotAcceptedError('Deprecated API version', `Use ${API_VERSIONS.LATEST} instead or a newer one`);
      }

      if (Object.values(API_VERSIONS).includes(version)) {
        c.set('apiVersion', version);
        return next();
      } else {
        throw new NotAcceptedError('Invalid API version');
      }
    }

    c.set('apiVersion', API_VERSIONS.LATEST);
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
