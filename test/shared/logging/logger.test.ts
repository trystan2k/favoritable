import { afterEach, describe, expect, test, vi } from 'vitest';

import { appLogger } from '@/shared/logging/logger';

describe('appLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('writes warn logs without context', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    appLogger.warn('warn message');

    expect(warnSpy).toHaveBeenCalledWith('warn message');
  });

  test('writes warn logs with context', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const context = { feature: 'i18n' };

    appLogger.warn('warn message', context);

    expect(warnSpy).toHaveBeenCalledWith('warn message', context);
  });

  test('writes error logs without context', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    appLogger.error('error message');

    expect(errorSpy).toHaveBeenCalledWith('error message');
  });

  test('writes error logs with context', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const context = { error: new Error('boom') };

    appLogger.error('error message', context);

    expect(errorSpy).toHaveBeenCalledWith('error message', context);
  });
});
