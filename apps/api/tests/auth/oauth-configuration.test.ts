import { describe, expect, test } from 'vitest';
import { auth } from '../../src/auth.js';

describe('OAuth Configuration', () => {
  test('should configure all OAuth providers correctly', () => {
    const config = auth.options;

    // Check that socialProviders are configured
    expect(config.socialProviders).toBeDefined();

    // Verify all five providers are configured
    const providers = Object.keys(config.socialProviders);
    expect(providers).toContain('github');
    expect(providers).toContain('google');
    expect(providers).toContain('facebook');
    expect(providers).toContain('twitter');
    expect(providers).toContain('apple');
    expect(providers).toHaveLength(5);
  });

  test('should have GitHub OAuth provider configured', () => {
    const github = auth.options.socialProviders.github;
    expect(github).toBeDefined();
    expect(github).toHaveProperty('clientId');
    expect(github).toHaveProperty('clientSecret');
  });

  test('should have Google OAuth provider configured', () => {
    const google = auth.options.socialProviders.google;
    expect(google).toBeDefined();
    expect(google).toHaveProperty('clientId');
    expect(google).toHaveProperty('clientSecret');
  });

  test('should have Facebook OAuth provider configured', () => {
    const facebook = auth.options.socialProviders.facebook;
    expect(facebook).toBeDefined();
    expect(facebook).toHaveProperty('clientId');
    expect(facebook).toHaveProperty('clientSecret');
  });

  test('should have Twitter OAuth provider configured', () => {
    const twitter = auth.options.socialProviders.twitter;
    expect(twitter).toBeDefined();
    expect(twitter).toHaveProperty('clientId');
    expect(twitter).toHaveProperty('clientSecret');
  });

  test('should have Apple OAuth provider configured with special settings', () => {
    const apple = auth.options.socialProviders.apple;
    expect(apple).toBeDefined();
    expect(apple).toHaveProperty('clientId');
    expect(apple).toHaveProperty('clientSecret');
    expect(apple).toHaveProperty('appBundleIdentifier');

    // Check that trusted origins include Apple
    expect(auth.options.trustedOrigins).toContain('https://appleid.apple.com');
  });

  test('should have correct advanced cookie configuration for persistent sessions', () => {
    const advanced = auth.options.advanced;
    expect(advanced.cookiePrefix).toBe('fav');
    expect(advanced.defaultCookieAttributes).toEqual({
      sameSite: 'none',
      secure: true,
      partitioned: true,
      httpOnly: true,
    });
  });

  test('should have persistent session configuration', () => {
    const session = auth.options.session;
    expect(session.expiresIn).toBe(60 * 60 * 24 * 30); // 30 days
    expect(session.updateAge).toBe(60 * 60 * 24); // 1 day
    expect(session.cookieCache.enabled).toBe(true);
    expect(session.cookieCache.maxAge).toBe(300); // 5 * 60 seconds
  });

  test('should have telemetry disabled', () => {
    expect(auth.options.telemetry.enabled).toBe(false);
  });

  test('should have email and password authentication enabled', () => {
    expect(auth.options.emailAndPassword.enabled).toBe(true);
  });
});
