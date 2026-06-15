import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

type PinoLogMethod = (contextOrMessage: unknown, message?: string) => void;
type PinoLogger = {
  error: PinoLogMethod;
  warn: PinoLogMethod;
};

const { pinoErrorMock, pinoMock, pinoWarnMock } = vi.hoisted(() => {
  const hoistedPinoErrorMock = vi.fn<PinoLogMethod>();
  const hoistedPinoWarnMock = vi.fn<PinoLogMethod>();
  const hoistedPinoMock = vi.fn<() => PinoLogger>(() => ({
    error: hoistedPinoErrorMock,
    warn: hoistedPinoWarnMock
  }));

  return {
    pinoErrorMock: hoistedPinoErrorMock,
    pinoMock: hoistedPinoMock,
    pinoWarnMock: hoistedPinoWarnMock
  };
});

vi.mock('pino', () => ({
  default: pinoMock
}));

describe('appLogger', () => {
  beforeEach(() => {
    vi.resetModules();
    pinoMock.mockClear();
    pinoWarnMock.mockClear();
    pinoErrorMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('creates pino logger with app-safe config', async () => {
    await import('@/shared/logging/logger');

    expect(pinoMock).toHaveBeenCalledWith({
      base: undefined,
      browser: {
        asObject: true
      },
      level: 'silent',
      name: 'favoritable'
    });
  });

  test('writes warn logs without context', async () => {
    const { appLogger } = await import('@/shared/logging/logger');

    appLogger.warn('warn message');

    expect(pinoWarnMock).toHaveBeenCalledWith('warn message');
  });

  test('writes warn logs with context', async () => {
    const { appLogger } = await import('@/shared/logging/logger');
    const context = { feature: 'i18n' };

    appLogger.warn('warn message', context);

    expect(pinoWarnMock).toHaveBeenCalledWith(context, 'warn message');
  });

  test('writes error logs without context', async () => {
    const { appLogger } = await import('@/shared/logging/logger');

    appLogger.error('error message');

    expect(pinoErrorMock).toHaveBeenCalledWith('error message');
  });

  test('writes error logs with context', async () => {
    const { appLogger } = await import('@/shared/logging/logger');
    const context = { error: new Error('boom') };

    appLogger.error('error message', context);

    expect(pinoErrorMock).toHaveBeenCalledWith(context, 'error message');
  });
});
