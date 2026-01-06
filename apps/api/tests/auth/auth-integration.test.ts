import { describe, expect, test } from 'vitest';
import type { ErrorResponse } from '../../src/errors/errors.types.js';
import app from '../../src/index.js';

describe('Auth Error Integration Tests', () => {
  describe('Protected Endpoints Error Handling', () => {
    test('should return standardized error format for authentication failures', async () => {
      const response = await app.request('/api/test/with-auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(401);

      const body = (await response.json()) as ErrorResponse;

      // Should follow the standardized error format
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('timestamp');
      expect(body.error).toHaveProperty('code');
      expect(body.error).toHaveProperty('message');
      expect(body.error).toHaveProperty('name');

      // Verify specific error details
      expect(body.error.code).toBe('00009');
      expect(body.error.name).toBe('NotAuthorizedError');
      expect(body.error.message).toBe('Unauthorized');
    });

    test('should return standardized error format for session endpoint', async () => {
      const response = await app.request('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(401);

      const body = (await response.json()) as ErrorResponse;

      // Should follow the standardized error format
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('timestamp');
      expect(body.error).toHaveProperty('code');
      expect(body.error).toHaveProperty('message');
      expect(body.error).toHaveProperty('name');

      // Verify specific error details
      expect(body.error.code).toBe('00009');
      expect(body.error.name).toBe('NotAuthorizedError');
      expect(body.error.message).toBe('Unauthorized');
    });

    test('should return JSON content-type for all auth errors', async () => {
      const response = await app.request('/api/test/with-auth', {
        method: 'GET',
      });

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    test('should handle CORS preflight requests to auth endpoints', async () => {
      const response = await app.request('/api/auth/sign-in/email', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      // Should handle CORS preflight without throwing errors
      expect([200, 204]).toContain(response.status);
    });

    test('should include proper timestamp in error responses', async () => {
      const response = await app.request('/api/test/with-auth', {
        method: 'GET',
      });

      const body = (await response.json()) as ErrorResponse;

      // Timestamp should be valid ISO format
      expect(body.timestamp).toBeDefined();
      expect(() => new Date(body.timestamp)).not.toThrow();

      // Should be recent (within last 5 seconds)
      const timestamp = new Date(body.timestamp);
      const now = new Date();
      const diff = Math.abs(now.getTime() - timestamp.getTime());
      expect(diff).toBeLessThan(5000); // 5 seconds
    });
  });

  describe('Global Error Handler Integration', () => {
    test('should process auth errors through global error handler pipeline', async () => {
      // Test that auth middleware errors go through the global error handler
      const response = await app.request('/api/test/with-auth', {
        method: 'GET',
      });

      const body = (await response.json()) as ErrorResponse;

      // The response should be formatted by the global error handler
      // which includes the timestamp and standardized error structure
      expect(body).toMatchObject({
        error: {
          code: expect.any(String),
          message: expect.any(String),
          name: expect.any(String),
        },
        timestamp: expect.any(String),
      });

      // Should not include raw error format (which would be just {error: "message"})
      expect(typeof body.error).toBe('object');
      expect(body.error).not.toBeUndefined();
    });

    test('should maintain consistent error response schema across different auth endpoints', async () => {
      const endpoints = [
        { path: '/api/test/with-auth', method: 'GET' },
        { path: '/api/auth/session', method: 'GET' },
      ];

      for (const endpoint of endpoints) {
        const response = await app.request(endpoint.path, {
          method: endpoint.method as 'GET' | 'POST',
        });

        if (response.status >= 400) {
          const body = (await response.json()) as ErrorResponse;

          // All error responses should have the same schema
          expect(body).toHaveProperty('error');
          expect(body).toHaveProperty('timestamp');

          expect(body.error).toHaveProperty('code');
          expect(body.error).toHaveProperty('message');
          expect(body.error).toHaveProperty('name');

          // Types should be consistent
          expect(typeof body.error.code).toBe('string');
          expect(typeof body.error.message).toBe('string');
          expect(typeof body.error.name).toBe('string');
          expect(typeof body.timestamp).toBe('string');
        }
      }
    });
  });
});
