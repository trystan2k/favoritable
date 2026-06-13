import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { ProfileMenu } from '@/features/app-shell/components/ProfileMenu';

describe('ProfileMenu', () => {
  test('renders fallback initials when user name is empty', async () => {
    render(
      <ProfileMenu
        isSigningOut={false}
        onSignOut={vi.fn<() => Promise<void>>().mockResolvedValue(undefined)}
        userEmail="hello@favoritable.app"
        userName=""
      />
    );

    expect(
      screen.getByRole('button', {
        name: 'Open account menu for hello@favoritable.app'
      })
    ).toHaveTextContent('FV');
  });

  test('uses account identity in the trigger accessible name', async () => {
    render(
      <ProfileMenu
        isSigningOut={false}
        onSignOut={vi.fn<() => Promise<void>>().mockResolvedValue(undefined)}
        userEmail="hello@favoritable.app"
        userName="Thiago Mendonca"
      />
    );

    expect(
      screen.getByRole('button', {
        name: 'Open account menu for Thiago Mendonca (hello@favoritable.app)'
      })
    ).toHaveTextContent('TM');
  });

  test('shows disabled signing-out state inside the menu', async () => {
    render(
      <ProfileMenu
        isSigningOut
        onSignOut={vi.fn<() => Promise<void>>().mockResolvedValue(undefined)}
        userEmail="hello@favoritable.app"
        userName="Thiago Mendonca"
      />
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open account menu for Thiago Mendonca (hello@favoritable.app)'
      })
    );

    expect(await screen.findByRole('button', { name: 'Signing out…' })).toBeDisabled();
  });
});
