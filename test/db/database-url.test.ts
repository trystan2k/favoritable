import { describe, expect, test } from 'vitest';

import {
  getDatabaseFilePath,
  resolveDatabaseCredentials,
  resolveDatabaseUrl
} from '@/db/database-url';

describe('resolveDatabaseUrl', () => {
  test('resolves relative SQLite file urls from project root', () => {
    expect(resolveDatabaseUrl('file:./data/favoritable.db')).toMatch(
      /file:.*\/data\/favoritable\.db$/
    );
  });

  test('preserves libsql urls without filesystem rewriting', () => {
    expect(resolveDatabaseUrl('libsql://favoritable.turso.io')).toBe(
      'libsql://favoritable.turso.io'
    );
  });
});

describe('resolveDatabaseCredentials', () => {
  test('adds auth token for secured libsql deployments', () => {
    expect(
      resolveDatabaseCredentials('libsql://favoritable.turso.io', '  turso-auth-token  ')
    ).toEqual({
      authToken: 'turso-auth-token',
      url: 'libsql://favoritable.turso.io'
    });
  });

  test('omits auth token when none is configured', () => {
    expect(resolveDatabaseCredentials('file:./data/favoritable.db')).toEqual({
      url: resolveDatabaseUrl('file:./data/favoritable.db')
    });
  });
});

describe('getDatabaseFilePath', () => {
  test('returns null for non-file databases', () => {
    expect(getDatabaseFilePath('libsql://favoritable.turso.io')).toBeNull();
  });
});
