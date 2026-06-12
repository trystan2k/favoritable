import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { LoginPage } from '@/features/auth/components/LoginPage';
import { googleOAuthSetupMessage } from '@/features/auth/lib/auth-defaults';

const { signInSocialMock } = vi.hoisted(() => ({
  signInSocialMock:
    vi.fn<
      (options: {
        provider: string;
        callbackURL: string;
      }) => Promise<{ error: { message: string } | null }>
    >()
}));

vi.mock('@/features/auth/lib/auth-client', () => ({
  getBrowserAuthClient: () => ({
    signIn: {
      social: signInSocialMock
    }
  })
}));

describe('LoginPage', () => {
  beforeEach(() => {
    signInSocialMock.mockReset();
  });

  test('renders active Google action and provider placeholders when Google OAuth is configured', () => {
    render(<LoginPage isGoogleAuthAvailable />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Favoritable login shell' })
    ).toBeDefined();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Continue with Facebook soon' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continue with GitHub soon' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continue with Apple soon' })).toBeDisabled();
    expect(screen.queryByRole('status')).toBeNull();
  });

  test('disables and relabels Google action when OAuth credentials are missing', () => {
    render(<LoginPage isGoogleAuthAvailable={false} />);

    expect(screen.getByRole('button', { name: 'Google OAuth unavailable' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(googleOAuthSetupMessage);
  });

  test('shows auth setup error when Google OAuth fails', async () => {
    signInSocialMock.mockResolvedValue({
      error: {
        message: 'Missing Google credentials'
      }
    });

    render(<LoginPage isGoogleAuthAvailable />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Missing Google credentials');
    });
  });

  test('shows fallback error when Google OAuth throws', async () => {
    signInSocialMock.mockRejectedValue(new Error('network failed'));

    render(<LoginPage isGoogleAuthAvailable />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(googleOAuthSetupMessage);
    });
  });
});
