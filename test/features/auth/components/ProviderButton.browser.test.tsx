import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ProviderButton } from '@/features/auth/components/ProviderButton';
import { TestI18nProvider } from '@/test-support/TestI18nProvider';

describe('ProviderButton', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('favoritable-locale', 'en');
    document.documentElement.lang = 'en';
  });

  test.each([
    ['google', 'Continue with Google'],
    ['facebook', 'Continue with Facebook'],
    ['github', 'Continue with GitHub'],
    ['apple', 'Continue with Apple']
  ] as const)('renders %s provider copy', (provider, label) => {
    render(
      <TestI18nProvider>
        <ProviderButton provider={provider} />
      </TestI18nProvider>
    );

    expect(screen.getByRole('button', { name: label })).toBeDefined();
  });

  test('shows provider-specific loading copy for Google sign-in launch', () => {
    render(
      <TestI18nProvider>
        <ProviderButton isLoading provider="google" />
      </TestI18nProvider>
    );

    expect(screen.getByRole('button', { name: 'Starting Google sign-in…' })).toBeDisabled();
    expect(screen.queryByText('soon')).toBeNull();
  });

  test('renders custom disabled labels without exposing the badge in the accessible name', () => {
    const onClick = vi.fn<() => void>();

    render(
      <TestI18nProvider>
        <ProviderButton
          badgeLabel="setup required"
          disabled
          label="Google OAuth unavailable"
          onClick={onClick}
          provider="google"
        />
      </TestI18nProvider>
    );

    const button = screen.getByRole('button', { name: 'Google OAuth unavailable' });

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText('setup required')).toBeVisible();
    expect(onClick).not.toHaveBeenCalled();
  });
});
