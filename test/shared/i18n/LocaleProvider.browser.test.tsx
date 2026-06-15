import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useLocale } from '@/shared/i18n/LocaleProvider';
import type { Locale } from '@/shared/i18n/locale';
import { TestI18nProvider } from '@/test-support/TestI18nProvider';

const { updateUserMock } = vi.hoisted(() => ({
  updateUserMock: vi.fn<(locale: Locale) => Promise<{ error?: { message?: string } | null }>>()
}));

vi.mock('@/features/auth/lib/auth-client', () => ({
  updateBrowserUserLocale: updateUserMock
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, reject, resolve };
}

function LocaleHarness() {
  const { isUpdatingLocale, locale, localeUpdateError, setLocale } = useLocale();

  return (
    <div>
      <span data-testid="locale-value">{locale}</span>
      <span data-testid="locale-updating">{isUpdatingLocale ? 'yes' : 'no'}</span>
      <span data-testid="locale-error">{localeUpdateError ? 'yes' : 'no'}</span>
      <button onClick={() => void setLocale('es')} type="button">
        Switch to Spanish
      </button>
    </div>
  );
}

describe('LocaleProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    updateUserMock.mockReset();
    window.localStorage.clear();
    document.documentElement.lang = 'en';
    document.cookie = 'favoritable-locale-hint=; Max-Age=0; Path=/';
  });

  test('resolves signed-out locale from localStorage before browser defaults', async () => {
    window.localStorage.setItem('favoritable-locale', 'pt-BR');

    render(
      <TestI18nProvider>
        <LocaleHarness />
      </TestI18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('locale-value')).toHaveTextContent('pt-BR');
      expect(document.documentElement.lang).toBe('pt-BR');
    });
  });

  test('falls back to default locale for signed-out tests when no locale is preset', async () => {
    document.documentElement.lang = '';
    vi.stubGlobal('navigator', {
      language: 'es-AR',
      languages: ['es-AR']
    });

    render(
      <TestI18nProvider>
        <LocaleHarness />
      </TestI18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('locale-value')).toHaveTextContent('en');
      expect(document.documentElement.lang).toBe('en');
      expect(window.localStorage.getItem('favoritable-locale')).toBe('en');
    });
  });

  test('overrides stale local storage with authenticated server locale immediately', async () => {
    window.localStorage.setItem('favoritable-locale', 'pt-BR');
    document.cookie = 'favoritable-locale-hint=pt-BR';

    render(
      <TestI18nProvider isAuthenticated serverLocale="es">
        <LocaleHarness />
      </TestI18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('locale-value')).toHaveTextContent('es');
      expect(document.documentElement.lang).toBe('es');
      expect(window.localStorage.getItem('favoritable-locale')).toBe('es');
    });
  });

  test('persists authenticated locale updates optimistically', async () => {
    updateUserMock.mockResolvedValue({ error: null });

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <LocaleHarness />
      </TestI18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Spanish' }));

    await waitFor(() => {
      expect(screen.getByTestId('locale-value')).toHaveTextContent('es');
      expect(updateUserMock).toHaveBeenCalledWith('es');
      expect(window.localStorage.getItem('favoritable-locale')).toBe('es');
      expect(screen.getByTestId('locale-error')).toHaveTextContent('no');
    });
  });

  test('rolls back failed authenticated locale updates', async () => {
    updateUserMock.mockResolvedValue({
      error: {
        message: 'nope'
      }
    });

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <LocaleHarness />
      </TestI18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Spanish' }));

    await waitFor(() => {
      expect(screen.getByTestId('locale-value')).toHaveTextContent('en');
      expect(document.documentElement.lang).toBe('en');
      expect(screen.getByTestId('locale-error')).toHaveTextContent('yes');
    });
  });

  test('rolls back to latest confirmed locale when server locale changes mid-request', async () => {
    const deferredUpdate = createDeferred<{ error?: { message?: string } | null }>();
    updateUserMock.mockReturnValue(deferredUpdate.promise);

    const { rerender } = render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <LocaleHarness />
      </TestI18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Spanish' }));

    await waitFor(() => {
      expect(screen.getByTestId('locale-value')).toHaveTextContent('es');
      expect(screen.getByTestId('locale-updating')).toHaveTextContent('yes');
    });

    rerender(
      <TestI18nProvider isAuthenticated serverLocale="pt-BR">
        <LocaleHarness />
      </TestI18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('locale-value')).toHaveTextContent('pt-BR');
      expect(document.documentElement.lang).toBe('pt-BR');
    });

    deferredUpdate.resolve({
      error: {
        message: 'nope'
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('locale-value')).toHaveTextContent('pt-BR');
      expect(document.documentElement.lang).toBe('pt-BR');
      expect(screen.getByTestId('locale-error')).toHaveTextContent('yes');
      expect(screen.getByTestId('locale-updating')).toHaveTextContent('no');
    });
  });
});
