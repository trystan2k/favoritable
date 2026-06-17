import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { BookmarkLibraryPage } from '@/features/bookmarks/views/BookmarkLibraryPage';
import { TestI18nProvider } from '@/test-support/TestI18nProvider';

vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');

  return {
    ...actual,
    Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
      <a href={to} {...props}>
        {children}
      </a>
    )
  };
});

describe('BookmarkLibraryPage', () => {
  test('renders empty state and add action when no bookmarks exist', () => {
    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <BookmarkLibraryPage bookmarks={[]} />
      </TestI18nProvider>
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Your bookmarks' })).toBeDefined();
    expect(screen.getByText('No bookmarks saved yet')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Add bookmark' })).toBeDefined();
  });

  test('renders saved bookmarks with optional description', () => {
    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <BookmarkLibraryPage
          bookmarks={[
            {
              description: 'Launch note.',
              id: 'bookmark-1',
              title: 'Favoritable Launch',
              url: 'https://favoritable.app/articles/launch'
            }
          ]}
        />
      </TestI18nProvider>
    );

    expect(screen.getByRole('heading', { level: 3, name: 'Favoritable Launch' })).toBeDefined();
    expect(
      screen.getByRole('link', {
        name: 'https://favoritable.app/articles/launch opens in a new tab'
      })
    ).toBeDefined();
    expect(screen.getByText('Launch note.')).toBeDefined();
  });
});
