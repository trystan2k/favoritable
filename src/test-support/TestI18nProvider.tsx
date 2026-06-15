import type { ReactNode } from 'react';

import { LocaleProvider } from '@/shared/i18n/LocaleProvider';
import {
  applyDocumentLocale,
  defaultLocale,
  getStoredLocale,
  isLocale,
  setStoredLocale
} from '@/shared/i18n/locale';

type TestI18nProviderProps = {
  children: ReactNode;
  isAuthenticated?: boolean;
  serverLocale?: unknown;
};

export function TestI18nProvider({
  children,
  isAuthenticated = false,
  serverLocale
}: TestI18nProviderProps) {
  if (
    !isAuthenticated &&
    getStoredLocale() === null &&
    (typeof document === 'undefined' || !isLocale(document.documentElement.lang))
  ) {
    setStoredLocale(defaultLocale);
    applyDocumentLocale(defaultLocale);
  }

  return (
    <LocaleProvider isAuthenticated={isAuthenticated} serverLocale={serverLocale}>
      {children}
    </LocaleProvider>
  );
}
