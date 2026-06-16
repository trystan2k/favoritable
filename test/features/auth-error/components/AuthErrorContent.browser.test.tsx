import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useTranslation } from 'react-i18next';

import { AuthErrorContent } from '@/features/auth-error/components/AuthErrorContent';
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

function AuthErrorContentHarness() {
  const { t } = useTranslation();

  return <AuthErrorContent actionHref="/login" actionLabel={t('authError.actions.login')} />;
}

describe('AuthErrorContent', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = 'en';
  });

  test('renders shared localized error copy from the active locale', async () => {
    window.localStorage.setItem('favoritable-locale', 'pt-BR');

    render(
      <TestI18nProvider>
        <AuthErrorContentHarness />
      </TestI18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Erro de autenticação' })).toBeDefined();
    });

    expect(
      screen.getByText('Algo deu errado durante a autenticação. Tente novamente.')
    ).toBeDefined();
    expect(screen.getByRole('link', { name: 'Ir para o login' })).toHaveAttribute('href', '/login');
  });

  test('renders English copy by default', () => {
    render(
      <TestI18nProvider>
        <AuthErrorContentHarness />
      </TestI18nProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Authentication error' })).toBeDefined();
    expect(
      screen.getByText('Something went wrong during authentication. Please try again.')
    ).toBeDefined();
    expect(screen.getByText('Error')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Go to login' })).toHaveAttribute('href', '/login');
  });

  test('generates unique heading ids for each instance', () => {
    render(
      <TestI18nProvider>
        <>
          <AuthErrorContent actionHref="/" actionLabel="Go home" />
          <AuthErrorContent actionHref="/login" actionLabel="Go login" />
        </>
      </TestI18nProvider>
    );

    const headings = screen.getAllByRole('heading', {
      level: 1,
      name: 'Authentication error'
    });
    const regions = screen.getAllByRole('region', { name: 'Authentication error' });

    expect(headings[0]?.id).toBeTruthy();
    expect(headings[1]?.id).toBeTruthy();
    expect(headings[0]?.id).not.toBe(headings[1]?.id);
    expect(regions[0]).toHaveAttribute('aria-labelledby', headings[0]?.id);
    expect(regions[1]).toHaveAttribute('aria-labelledby', headings[1]?.id);
  });
});
