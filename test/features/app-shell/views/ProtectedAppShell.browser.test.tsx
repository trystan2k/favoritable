import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ProtectedAppShell } from '@/features/app-shell/views/ProtectedAppShell';
import { signOutErrorMessage } from '@/features/auth/lib/auth-defaults';

const { navigateMock, signOutMock } = vi.hoisted(() => ({
  signOutMock: vi.fn<() => Promise<{ error?: { message?: string } | null } | void>>(),
  navigateMock: vi.fn<(options: { to: string }) => Promise<void>>()
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
  })
}));

describe('ProtectedAppShell', () => {
  beforeEach(() => {
    signOutMock.mockReset();
    navigateMock.mockReset();
  });

  test('renders current user details', () => {
    render(
      <ProtectedAppShell userEmail="hello@favoritable.app" userName="Thiago">
        <div>Protected content</div>
      </ProtectedAppShell>
    );

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main-content'
    );
    expect(screen.getByText('Protected shell with Better Auth session')).toBeDefined();
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

    render(
      <ProtectedAppShell userEmail="hello@favoritable.app" userName="Thiago">
        <div>Protected content</div>
      </ProtectedAppShell>
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

    render(
      <ProtectedAppShell userEmail="hello@favoritable.app" userName="Thiago">
        <div>Protected content</div>
      </ProtectedAppShell>
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

    render(
      <ProtectedAppShell userEmail="hello@favoritable.app" userName="Thiago">
        <div>Protected content</div>
      </ProtectedAppShell>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open account menu for Thiago (hello@favoritable.app)'
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(signOutErrorMessage);
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
