import { createElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { routeAuthErrorMessage } from '@/features/auth/routes/route-auth';
import { Route as RootRoute, loadOptionalRouteSession } from '@/routes/__root';

const { appLoggerErrorMock, appLoggerWarnMock, getRouteAuthSessionMock } = vi.hoisted(() => ({
  appLoggerErrorMock: vi.fn<(message: string, context?: Record<string, unknown>) => void>(),
  appLoggerWarnMock: vi.fn<(message: string, context?: Record<string, unknown>) => void>(),
  getRouteAuthSessionMock: vi.fn<() => Promise<unknown>>()
}));

vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');

  return {
    ...actual,
    HeadContent: () => null,
    Scripts: () => null
  };
});

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
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  test('root route beforeLoad returns session context payload', async () => {
    const session = { user: { id: 'user-2' } };

    getRouteAuthSessionMock.mockResolvedValue(session);

    await expect(RootRoute.options.beforeLoad?.({} as never)).resolves.toEqual({ session });
  });

  test('root route head includes app metadata and stylesheet link', () => {
    expect(RootRoute.options.head?.({} as never)).toEqual({
      links: [
        {
          href: expect.any(String),
          rel: 'stylesheet'
        }
      ],
      meta: [
        {
          charSet: 'utf-8'
        },
        {
          content: 'width=device-width, initial-scale=1',
          name: 'viewport'
        },
        {
          title: 'Favoritable'
        }
      ]
    });
  });

  test('root shell locks authenticated locale and normalizes lang attribute', () => {
    vi.spyOn(RootRoute, 'useRouteContext').mockReturnValue({
      session: {
        user: {
          email: 'hello@favoritable.app',
          locale: 'es',
          name: 'Thiago'
        }
      }
    } as never);

    const { shellComponent } = RootRoute.options as unknown as {
      shellComponent: (props: { children: ReactNode }) => ReactElement;
    };
    const markup = renderToStaticMarkup(
      shellComponent({ children: createElement('main', null, 'app') })
    );

    expect(markup).toContain('data-locale-locked="true"');
    expect(markup).toContain('lang="es"');
    expect(markup).toContain('<main>app</main>');
  });

  test('root shell uses default locale when no session exists', () => {
    vi.spyOn(RootRoute, 'useRouteContext').mockReturnValue({ session: null } as never);

    const { shellComponent } = RootRoute.options as unknown as {
      shellComponent: (props: { children: ReactNode }) => ReactElement;
    };
    const markup = renderToStaticMarkup(
      shellComponent({ children: createElement('main', null, 'app') })
    );

    expect(markup).toContain('lang="en"');
    expect(markup).not.toContain('data-locale-locked');
  });
});
