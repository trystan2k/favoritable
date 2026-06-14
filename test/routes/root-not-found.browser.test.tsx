import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';

import { RootNotFoundComponent, Route as RootRoute } from '@/routes/__root';
import { TestI18nProvider } from '@/test-support/TestI18nProvider';

const { navigateMock, signOutMock, updateUserMock } = vi.hoisted(() => ({
  signOutMock: vi.fn<() => Promise<{ error?: { message?: string } | null } | void>>(),
  navigateMock: vi.fn<(options: { to: string }) => Promise<void>>(),
  updateUserMock:
    vi.fn<(data: { locale: string }) => Promise<{ error?: { message?: string } | null }>>()
}));

vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');

  return {
    ...actual,
    Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => navigateMock
  };
});

vi.mock('@/features/auth/lib/auth-client', () => ({
  getBrowserAuthClient: () => ({
    signOut: signOutMock
  }),
  updateBrowserUserLocale: updateUserMock
}));

describe('RootNotFoundComponent', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    signOutMock.mockReset();
    updateUserMock.mockReset();
    window.localStorage.clear();
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders standalone localized 404 for signed-out sessions', async () => {
    window.localStorage.setItem('favoritable-locale', 'es');
    vi.spyOn(RootRoute, 'useRouteContext').mockReturnValue({ session: null } as never);

    render(
      <TestI18nProvider>
        <RootNotFoundComponent />
      </TestI18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Página no encontrada' })).toBeDefined();
    });

    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('region', { name: 'Página no encontrada' })).toHaveLength(1);
    expect(screen.getByText('Favoritable')).toBeDefined();
    expect(screen.getByRole('combobox', { name: 'Idioma' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Ir al acceso' })).toHaveAttribute('href', '/login');
    expect(screen.queryByText('Protected shell with Better Auth session')).toBeNull();
  });

  test('renders protected-shell 404 for signed-in sessions', async () => {
    vi.spyOn(RootRoute, 'useRouteContext').mockReturnValue({
      session: {
        user: {
          email: 'hello@favoritable.app',
          locale: 'en',
          name: 'Thiago'
        }
      }
    } as never);
    updateUserMock.mockResolvedValue({ error: null });

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <RootNotFoundComponent />
      </TestI18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Page not found' })).toBeDefined();
    });

    expect(screen.getByText('Protected shell with Better Auth session')).toBeDefined();
    expect(screen.getByText('Thiago · hello@favoritable.app')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
  });
});
