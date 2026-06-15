import { useEffect, useState, type ReactNode } from 'react';

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
  const shouldBootstrapLocale =
    !isAuthenticated &&
    getStoredLocale() === null &&
    (typeof document === 'undefined' || !isLocale(document.documentElement.lang));
  const [isLocaleReady, setIsLocaleReady] = useState(() => !shouldBootstrapLocale);

  useEffect(() => {
    if (!shouldBootstrapLocale) {
      setIsLocaleReady(true);
      return;
    }

    setStoredLocale(defaultLocale);
    applyDocumentLocale(defaultLocale);
    setIsLocaleReady(true);
  }, [shouldBootstrapLocale]);

  if (!isLocaleReady) {
    return null;
  }

  return (
    <LocaleProvider isAuthenticated={isAuthenticated} serverLocale={serverLocale}>
      {children}
    </LocaleProvider>
  );
}
