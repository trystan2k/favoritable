import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { ProtectedHomePage } from '@/features/app-shell/views/ProtectedHomePage';

describe('ProtectedHomePage', () => {
  test('renders auth foundation copy', () => {
    render(<ProtectedHomePage />);

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
