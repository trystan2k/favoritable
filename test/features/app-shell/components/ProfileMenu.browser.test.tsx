import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { ProfileMenu } from '@/features/app-shell/components/ProfileMenu';
import type { Locale } from '@/shared/i18n/locale';
import { TestI18nProvider } from '@/test-support/TestI18nProvider';

const { updateUserMock } = vi.hoisted(() => ({
  updateUserMock: vi.fn<(locale: Locale) => Promise<{ error?: { message?: string } | null }>>()
}));

vi.mock('@/features/auth/lib/auth-client', () => ({
  updateBrowserUserLocale: updateUserMock
}));

describe('ProfileMenu', () => {
  test('renders fallback initials when user name is empty', async () => {
    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <ProfileMenu
          isSigningOut={false}
          onSignOut={vi.fn<() => Promise<void>>().mockResolvedValue(undefined)}
          userEmail="hello@favoritable.app"
          userName=""
        />
      </TestI18nProvider>
    );

    expect(
      screen.getByRole('button', {
        name: 'Open account menu for hello@favoritable.app'
      })
    ).toHaveTextContent('FV');
  });

  test('uses account identity in the trigger accessible name', async () => {
    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <ProfileMenu
          isSigningOut={false}
          onSignOut={vi.fn<() => Promise<void>>().mockResolvedValue(undefined)}
          userEmail="hello@favoritable.app"
          userName="Thiago Mendonca"
        />
      </TestI18nProvider>
    );

    expect(
      screen.getByRole('button', {
        name: 'Open account menu for Thiago Mendonca (hello@favoritable.app)'
      })
    ).toHaveTextContent('TM');
  });

  test('shows language switcher and disabled signing-out state inside the menu', async () => {
    updateUserMock.mockResolvedValue({ error: null });

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <ProfileMenu
          isSigningOut
          onSignOut={vi.fn<() => Promise<void>>().mockResolvedValue(undefined)}
          userEmail="hello@favoritable.app"
          userName="Thiago Mendonca"
        />
      </TestI18nProvider>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open account menu for Thiago Mendonca (hello@favoritable.app)'
      })
    );

    expect(await screen.findByRole('button', { name: 'Signing out…' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveTextContent('🇺🇸');
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveTextContent('English');
  });

  test('reflects the authenticated locale inside the menu', async () => {
    updateUserMock.mockResolvedValue({ error: null });

    render(
      <TestI18nProvider isAuthenticated serverLocale="es">
        <ProfileMenu
          isSigningOut={false}
          onSignOut={vi.fn<() => Promise<void>>().mockResolvedValue(undefined)}
          userEmail="hello@favoritable.app"
          userName="Thiago Mendonca"
        />
      </TestI18nProvider>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Abrir menú de cuenta para Thiago Mendonca (hello@favoritable.app)'
      })
    );

    expect(screen.getByRole('combobox', { name: 'Idioma' })).toHaveTextContent('🇪🇸');
    expect(screen.getByRole('combobox', { name: 'Idioma' })).toHaveTextContent('Español');
  });
});
