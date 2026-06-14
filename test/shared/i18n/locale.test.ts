import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  applyDocumentLocale,
  clearLocaleHintCookie,
  defaultLocale,
  getBrowserLocale,
  getLocaleHintFromCookieHeader,
  getStoredLocale,
  isLocale,
  localeBootstrapScript,
  mapBrowserLanguageToLocale,
  resolveClientLocale,
  setLocaleHintCookie
} from '@/shared/i18n/locale';

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubWindow(storedLocale: string | null) {
  vi.stubGlobal('window', {
    localStorage: {
      getItem: vi.fn<(key: string) => string | null>((key) =>
        key === 'favoritable-locale' ? storedLocale : null
      )
    }
  });
}

function stubDocument() {
  vi.stubGlobal('document', {
    documentElement: {
      dataset: {},
      lang: '',
      style: {}
    }
  });
}

describe('locale helpers', () => {
  test('accepts only supported locale values', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('pt-BR')).toBe(true);
    expect(isLocale('es')).toBe(true);
    expect(isLocale('pt-PT')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  test('maps browser base languages to supported locales', () => {
    expect(mapBrowserLanguageToLocale('pt-PT')).toBe('pt-BR');
    expect(mapBrowserLanguageToLocale('es-MX')).toBe('es');
    expect(mapBrowserLanguageToLocale('en-GB')).toBe('en');
    expect(mapBrowserLanguageToLocale('fr-FR')).toBe(defaultLocale);
  });

  test('uses the browser language list when available', () => {
    vi.stubGlobal('navigator', {
      language: 'en-US',
      languages: ['es-AR', 'en-US']
    });

    expect(getBrowserLocale()).toBe('es');
  });

  test('ignores invalid stored locale values and falls back safely', () => {
    stubWindow('fr-FR');
    vi.stubGlobal('navigator', {
      language: 'pt-PT',
      languages: ['pt-PT']
    });

    expect(getStoredLocale()).toBeNull();
    expect(resolveClientLocale()).toBe('pt-BR');
  });

  test('applies locale to document safely and reads locale hint cookies', () => {
    stubDocument();

    applyDocumentLocale('es');

    expect(document.documentElement.lang).toBe('es');
    expect(getLocaleHintFromCookieHeader('favoritable-locale-hint=es')).toBe('es');
    expect(getLocaleHintFromCookieHeader('favoritable-locale-hint=fr-FR')).toBeNull();
  });

  test('uses secure locale hint cookies on https and mirrors that on clear', () => {
    stubDocument();
    vi.stubGlobal('location', {
      protocol: 'https:'
    });

    setLocaleHintCookie('pt-BR');
    expect(document.cookie).toContain('favoritable-locale-hint=pt-BR');
    expect(document.cookie).toContain('Secure');

    clearLocaleHintCookie();
    expect(document.cookie).toContain('favoritable-locale-hint=; Max-Age=0');
    expect(document.cookie).toContain('Secure');
  });

  test('keeps bootstrap logic english-safe and auth-lock aware', () => {
    expect(localeBootstrapScript).toContain("root.dataset.localeLocked === 'true'");
    expect(localeBootstrapScript).toContain('window.localStorage.getItem(storageKey)');
    expect(localeBootstrapScript).toContain(
      'navigator.languages?.find(Boolean) || navigator.language'
    );
  });
});
