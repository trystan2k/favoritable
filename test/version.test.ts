import { describe, expect, test } from 'vitest';

import { APP_VERSION } from '@/version';

describe('APP_VERSION', () => {
  test('matches semantic version format', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/u);
  });
});
