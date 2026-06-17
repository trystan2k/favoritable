import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ProtectedAppShell } from '@/features/app-shell/views/ProtectedAppShell';
import type { Locale } from '@/shared/i18n/locale';
import { TestI18nProvider } from '@/test-support/TestI18nProvider';

const { navigateMock, signOutMock, updateUserMock } = vi.hoisted(() => ({
  signOutMock: vi.fn<() => Promise<{ error?: { message?: string } | null } | void>>(),
  navigateMock: vi.fn<(options: { to: string }) => Promise<void>>(),
  updateUserMock: vi.fn<(locale: Locale) => Promise<{ error?: { message?: string } | null }>>()
}));

vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

vi.mock('@/features/auth/lib/auth-client', () => ({
  getBrowserAuthClient: () => ({
    signOut: signOutMock
  }),
  updateBrowserUserLocale: updateUserMock
}));

describe('ProtectedAppShell', () => {
  beforeEach(() => {
    signOutMock.mockReset();
    navigateMock.mockReset();
    updateUserMock.mockReset();
    window.localStorage.clear();
  });

  test('renders current user details', () => {
    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <ProtectedAppShell userEmail="hello@favoritable.app" userName="Thiago">
          <div>Protected content</div>
        </ProtectedAppShell>
      </TestI18nProvider>
    );

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main-content'
    );
    expect(screen.getByText('Protected library with Better Auth session')).toBeDefined();
    expect(screen.getByText('Thiago · hello@favoritable.app')).toBeDefined();
    expect(screen.getByText('Protected content')).toBeDefined();
  });

  test('prevents duplicate sign-out requests from the profile menu while pending', async () => {
    let resolveSignOut: (() => void) | undefined;

    signOutMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSignOut = () => resolve();
        })
    );
    navigateMock.mockResolvedValue(undefined);
    updateUserMock.mockResolvedValue({ error: null });

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <ProtectedAppShell userEmail="hello@favoritable.app" userName="Thiago">
          <div>Protected content</div>
        </ProtectedAppShell>
      </TestI18nProvider>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open account menu for Thiago (hello@favoritable.app)'
      })
    );

    const menuSignOutButton = screen.getByRole('button', { name: 'Sign out' });

    fireEvent.click(menuSignOutButton);
    fireEvent.click(menuSignOutButton);

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Signing out…' })).toBeDisabled();
    });

    resolveSignOut?.();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({ to: '/login' });
    });
  });

  test('shows sign-out error feedback when Better Auth returns an error response', async () => {
    signOutMock.mockResolvedValue({
      error: {
        message: 'Sign-out failed.'
      }
    });
    updateUserMock.mockResolvedValue({ error: null });

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <ProtectedAppShell userEmail="hello@favoritable.app" userName="Thiago">
          <div>Protected content</div>
        </ProtectedAppShell>
      </TestI18nProvider>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open account menu for Thiago (hello@favoritable.app)'
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledTimes(1);
    });

    expect(navigateMock).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Sign-out failed.');
    });

    expect(screen.getByRole('button', { name: 'Sign out' })).toBeEnabled();
    expect(screen.getByText('Protected content')).toBeDefined();
  });

  test('shows fallback sign-out error feedback when Better Auth throws', async () => {
    signOutMock.mockRejectedValue(new Error('network failed'));
    updateUserMock.mockResolvedValue({ error: null });

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <ProtectedAppShell userEmail="hello@favoritable.app" userName="Thiago">
          <div>Protected content</div>
        </ProtectedAppShell>
      </TestI18nProvider>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open account menu for Thiago (hello@favoritable.app)'
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Sign-out failed. Try again.');
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
