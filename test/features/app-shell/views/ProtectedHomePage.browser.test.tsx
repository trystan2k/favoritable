import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { ProtectedHomePage } from '@/features/app-shell/views/ProtectedHomePage';
import { TestI18nProvider } from '@/test-support/TestI18nProvider';

describe('ProtectedHomePage', () => {
  test('renders auth foundation copy', () => {
    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <ProtectedHomePage />
      </TestI18nProvider>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Auth foundation ready for bookmark features' })
    ).toBeDefined();
    expect(
      screen.getByText(
        'Google OAuth, persisted sessions, and protected shell access now replace the placeholder auth seam from FAV-21.'
      )
    ).toBeDefined();
  });
});
