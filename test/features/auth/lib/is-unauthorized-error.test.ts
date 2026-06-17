import { describe, expect, test } from 'vitest';

import { isUnauthorizedError } from '@/features/auth/lib/is-unauthorized-error';
import { unauthorizedServerFunctionError } from '@/features/auth/lib/unauthorized-error';

describe('isUnauthorizedError', () => {
  test('returns true for response 401 errors', () => {
    expect(isUnauthorizedError(new Response(null, { status: 401 }))).toBe(true);
  });

  test('returns true for structured unauthorized payloads', () => {
    expect(
      isUnauthorizedError({
        cause: {
          data: unauthorizedServerFunctionError
        }
      })
    ).toBe(true);
  });

  test('returns false for plain error messages that only mention unauthorized text', () => {
    expect(isUnauthorizedError(new Error('401 UNAUTHORIZED'))).toBe(false);
  });
});
