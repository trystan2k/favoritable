import { describe, expect, test } from 'vitest';
import { auth } from '../../src/auth.js';

describe('Session Persistence', () => {
  test('should have persistent session configuration', () => {
    const sessionConfig = auth.options.session;

    // Verify session duration is set to 30 days (for persistence)
    expect(sessionConfig.expiresIn).toBe(60 * 60 * 24 * 30); // 30 days

    // Verify session update age is set to 1 day
    expect(sessionConfig.updateAge).toBe(60 * 60 * 24); // 1 day

    // Verify cookie cache is enabled
    expect(sessionConfig.cookieCache.enabled).toBe(true);
    expect(sessionConfig.cookieCache.maxAge).toBe(300); // 5 minutes
  });

  test('should have secure cookie attributes for persistent sessions', () => {
    const cookieAttributes = auth.options.advanced.defaultCookieAttributes;

    // Verify security attributes
    expect(cookieAttributes.httpOnly).toBe(true); // Prevents XSS attacks
    expect(cookieAttributes.secure).toBe(true); // Requires HTTPS
    expect(cookieAttributes.sameSite).toBe('none'); // Cross-site requests allowed
    expect(cookieAttributes.partitioned).toBe(true); // Modern browser standards
  });

  test('should have database storage enabled for sessions', () => {
    // Verify that database adapter is configured
    // This ensures sessions are stored persistently in the database
    expect(auth.options.database).toBeDefined();
  });

  test('should have proper cookie prefix for session identification', () => {
    const cookiePrefix = auth.options.advanced.cookiePrefix;

    // Verify cookie prefix is set for session identification
    expect(cookiePrefix).toBe('fav');
  });
});
