import { beforeEach, describe, expect, test, vi } from 'vitest';

import { routeAuthErrorMessage } from '@/features/auth/routes/route-auth';
import { loadOptionalRouteSession } from '@/routes/__root';

const { appLoggerErrorMock, appLoggerWarnMock, getRouteAuthSessionMock } = vi.hoisted(() => ({
  appLoggerErrorMock: vi.fn<(message: string, context?: Record<string, unknown>) => void>(),
  appLoggerWarnMock: vi.fn<(message: string, context?: Record<string, unknown>) => void>(),
  getRouteAuthSessionMock: vi.fn<() => Promise<unknown>>()
}));

vi.mock('@/features/auth/routes/route-auth', () => ({
  getRouteAuthSession: getRouteAuthSessionMock,
  routeAuthErrorMessage: 'Failed to load Better Auth session.'
}));

vi.mock('@/shared/logging/logger', () => ({
  appLogger: {
    error: appLoggerErrorMock,
    warn: appLoggerWarnMock
  }
}));

describe('root route optional session loader', () => {
  beforeEach(() => {
    appLoggerErrorMock.mockReset();
    appLoggerWarnMock.mockReset();
    getRouteAuthSessionMock.mockReset();
  });

  test('returns session when auth session load succeeds', async () => {
    const session = { user: { id: 'user-1' } };

    getRouteAuthSessionMock.mockResolvedValue(session);

    await expect(loadOptionalRouteSession()).resolves.toBe(session);
  });

  test('degrades to signed-out state for expected auth session load failures', async () => {
    getRouteAuthSessionMock.mockRejectedValue(new Error(routeAuthErrorMessage));

    await expect(loadOptionalRouteSession()).resolves.toBeNull();

    expect(appLoggerWarnMock).toHaveBeenCalledWith(
      '[auth] Optional Better Auth session load failed. Rendering signed-out fallback.'
    );
    expect(appLoggerErrorMock).not.toHaveBeenCalled();
  });

  test('logs unexpected auth session failures before rendering signed-out fallback', async () => {
    const error = new Error('session failed');

    getRouteAuthSessionMock.mockRejectedValue(error);

    await expect(loadOptionalRouteSession()).resolves.toBeNull();

    expect(appLoggerErrorMock).toHaveBeenCalledWith(
      '[auth] Unexpected optional Better Auth session load failure.',
      { error }
    );
  });
});
