import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { LoginPage } from '@/features/auth/components/LoginPage';
import { TestI18nProvider } from '@/test-support/TestI18nProvider';

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
  }),
  updateBrowserUserLocale:
    vi.fn<(locale: string) => Promise<{ error?: { message?: string } | null }>>()
}));

describe('LoginPage', () => {
  beforeEach(() => {
    signInSocialMock.mockReset();
    window.localStorage.clear();
    document.documentElement.lang = 'en';
    document.cookie = 'favoritable-locale-hint=; Max-Age=0; Path=/';
  });

  test('renders active Google action and provider placeholders when Google OAuth is configured', () => {
    render(
      <TestI18nProvider>
        <LoginPage isGoogleAuthAvailable />
      </TestI18nProvider>
    );

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
    render(
      <TestI18nProvider>
        <LoginPage isGoogleAuthAvailable={false} />
      </TestI18nProvider>
    );

    expect(screen.getByRole('button', { name: 'Google OAuth unavailable' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Google OAuth is unavailable.');
  });

  test('uses the stored signed-out locale on first render', async () => {
    window.localStorage.setItem('favoritable-locale', 'es');

    render(
      <TestI18nProvider>
        <LoginPage isGoogleAuthAvailable />
      </TestI18nProvider>
    );

    await waitFor(() => {
      const localeSwitcher = screen.getByRole('combobox', { name: 'Idioma' });

      expect(window.localStorage.getItem('favoritable-locale')).toBe('es');
      expect(document.documentElement.lang).toBe('es');
      expect(localeSwitcher).toHaveTextContent('🇪🇸');
      expect(localeSwitcher).toHaveTextContent('Español');
      expect(
        screen.getByRole('heading', { level: 1, name: 'Shell de inicio de sesión de Favoritable' })
      ).toBeDefined();
    });
  });

  test('writes locale hint cookie before Google OAuth starts', async () => {
    signInSocialMock.mockResolvedValue({ error: null });
    window.localStorage.setItem('favoritable-locale', 'pt-BR');

    render(
      <TestI18nProvider>
        <LoginPage isGoogleAuthAvailable />
      </TestI18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continuar com Google' }));

    await waitFor(() => {
      expect(document.cookie).toContain('favoritable-locale-hint=pt-BR');
      expect(signInSocialMock).toHaveBeenCalledWith({
        callbackURL: '/',
        provider: 'google'
      });
    });
  });

  test('shows auth setup error when Google OAuth fails', async () => {
    signInSocialMock.mockResolvedValue({
      error: {
        message: 'Missing Google credentials'
      }
    });

    render(
      <TestI18nProvider>
        <LoginPage isGoogleAuthAvailable />
      </TestI18nProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Missing Google credentials');
    });
  });

  test('shows fallback error when Google OAuth throws', async () => {
    signInSocialMock.mockRejectedValue(new Error('network failed'));

    render(
      <TestI18nProvider>
        <LoginPage isGoogleAuthAvailable />
      </TestI18nProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Google OAuth is unavailable.');
    });
  });
});
