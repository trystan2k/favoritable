import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { HomePage } from '@/components/HomePage';
import { appRoutes } from '@test/utils/routes';

describe('HomePage', () => {
  test('keeps home route mapped to root path', () => {
    expect(appRoutes.home).toBe('/');
  });

  test('renders foundation copy', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Favoritable' })).toBeDefined();
    expect(screen.getByText('Bookmark manager foundation.')).toBeDefined();
  });
});
