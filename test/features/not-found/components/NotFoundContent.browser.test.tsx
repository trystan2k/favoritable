import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useTranslation } from 'react-i18next';

import { NotFoundContent } from '@/features/not-found/components/NotFoundContent';
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

function NotFoundContentHarness() {
  const { t } = useTranslation();

  return <NotFoundContent actionHref="/login" actionLabel={t('notFound.actions.login')} />;
}

describe('NotFoundContent', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = 'en';
  });

  test('renders shared localized 404 copy from the active locale', async () => {
    window.localStorage.setItem('favoritable-locale', 'pt-BR');

    render(
      <TestI18nProvider>
        <NotFoundContentHarness />
      </TestI18nProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })
      ).toBeDefined();
    });

    expect(screen.getByText('A página que você procura não existe ou foi movida.')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Ir para o login' })).toHaveAttribute('href', '/login');
  });

  test('generates unique heading ids for each instance', () => {
    render(
      <TestI18nProvider>
        <>
          <NotFoundContent actionHref="/" actionLabel="Go home" />
          <NotFoundContent actionHref="/login" actionLabel="Go login" />
        </>
      </TestI18nProvider>
    );

    const headings = screen.getAllByRole('heading', { level: 1, name: 'Page not found' });
    const regions = screen.getAllByRole('region', { name: 'Page not found' });

    expect(headings[0]?.id).toBeTruthy();
    expect(headings[1]?.id).toBeTruthy();
    expect(headings[0]?.id).not.toBe(headings[1]?.id);
    expect(regions[0]).toHaveAttribute('aria-labelledby', headings[0]?.id);
    expect(regions[1]).toHaveAttribute('aria-labelledby', headings[1]?.id);
  });
});
