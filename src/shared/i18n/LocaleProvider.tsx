'use client';

import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { I18nextProvider } from 'react-i18next';

import { updateBrowserUserLocale } from '@/features/auth/lib/auth-client';

import { createI18nInstance } from './i18n';
import {
  applyDocumentLocale,
  clearLocaleHintCookie,
  defaultLocale,
  normalizeLocale,
  resolveClientLocale,
  setStoredLocale,
  type Locale
} from './locale';

type LocaleProviderProps = {
  children: ReactNode;
  isAuthenticated?: boolean;
  serverLocale?: unknown;
};

type LocaleContextValue = {
  clearLocaleUpdateError: () => void;
  isAuthenticated: boolean;
  isUpdatingLocale: boolean;
  locale: Locale;
  localeUpdateError: boolean;
  setLocale: (locale: Locale) => Promise<void>;
};

const fallbackLocaleContextValue: LocaleContextValue = {
  clearLocaleUpdateError: () => {},
  isAuthenticated: false,
  isUpdatingLocale: false,
  locale: defaultLocale,
  localeUpdateError: false,
  setLocale: async () => {}
};

const LocaleContext = createContext<LocaleContextValue>(fallbackLocaleContextValue);

export function LocaleProvider({
  children,
  isAuthenticated = false,
  serverLocale
}: LocaleProviderProps) {
  const normalizedServerLocale = isAuthenticated ? normalizeLocale(serverLocale) : null;
  const [locale, setLocaleState] = useState<Locale>(
    () => normalizedServerLocale ?? resolveClientLocale()
  );
  const [isUpdatingLocale, setIsUpdatingLocale] = useState(false);
  const [localeUpdateError, setLocaleUpdateError] = useState(false);
  const confirmedLocaleRef = useRef<Locale>(normalizedServerLocale ?? defaultLocale);
  const localeUpdateRequestIdRef = useRef(0);
  const [i18n] = useState(() => createI18nInstance(locale));

  useEffect(() => {
    applyDocumentLocale(locale);
    setStoredLocale(locale);
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  useEffect(() => {
    if (!isAuthenticated || !normalizedServerLocale) {
      return;
    }

    confirmedLocaleRef.current = normalizedServerLocale;
    setStoredLocale(normalizedServerLocale);
    clearLocaleHintCookie();
    setLocaleState((currentLocale) =>
      currentLocale === normalizedServerLocale ? currentLocale : normalizedServerLocale
    );
  }, [isAuthenticated, normalizedServerLocale]);

  const clearLocaleUpdateError = useCallback(() => {
    setLocaleUpdateError(false);
  }, []);

  const handleLocaleChange = useCallback(
    async (nextLocale: Locale) => {
      const normalizedLocale = normalizeLocale(nextLocale);

      setLocaleUpdateError(false);

      if (normalizedLocale === locale) {
        return;
      }

      if (!isAuthenticated) {
        setLocaleState(normalizedLocale);
        return;
      }

      const previousConfirmedLocale = confirmedLocaleRef.current;
      const requestId = localeUpdateRequestIdRef.current + 1;

      localeUpdateRequestIdRef.current = requestId;
      setLocaleState(normalizedLocale);
      setIsUpdatingLocale(true);

      try {
        const response = await updateBrowserUserLocale(normalizedLocale);

        if (response.error) {
          throw new Error(response.error.message || 'Locale update failed.');
        }

        confirmedLocaleRef.current = normalizedLocale;
      } catch {
        if (localeUpdateRequestIdRef.current !== requestId) {
          return;
        }

        confirmedLocaleRef.current = previousConfirmedLocale;
        setLocaleState(previousConfirmedLocale);
        setLocaleUpdateError(true);
      } finally {
        if (localeUpdateRequestIdRef.current === requestId) {
          setIsUpdatingLocale(false);
        }
      }
    },
    [isAuthenticated, locale]
  );

  const value = useMemo(
    () => ({
      clearLocaleUpdateError,
      isAuthenticated,
      isUpdatingLocale,
      locale,
      localeUpdateError,
      setLocale: handleLocaleChange
    }),
    [
      clearLocaleUpdateError,
      handleLocaleChange,
      isAuthenticated,
      isUpdatingLocale,
      locale,
      localeUpdateError
    ]
  );

  return (
    <LocaleContext.Provider value={value}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
