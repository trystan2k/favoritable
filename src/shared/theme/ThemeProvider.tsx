'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  themeMediaQuery,
  themeStorageKey,
  type Theme
} from './theme';

type ThemeContextValue = {
  setTheme: (theme: Theme) => void;
  theme: Theme;
  toggleTheme: () => void;
};

const fallbackThemeContextValue: ThemeContextValue = {
  setTheme: () => {},
  theme: 'light',
  toggleTheme: () => {}
};

const ThemeContext = createContext<ThemeContextValue>(fallbackThemeContextValue);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(() => getStoredTheme());
  const [systemTheme, setSystemTheme] = useState<Theme>(() => getSystemTheme());
  const theme = selectedTheme ?? systemTheme;

  useEffect(() => {
    applyTheme(theme);

    try {
      if (selectedTheme) {
        window.localStorage.setItem(themeStorageKey, selectedTheme);
        return;
      }

      window.localStorage.removeItem(themeStorageKey);
    } catch {
      return;
    }
  }, [selectedTheme, theme]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQueryList = window.matchMedia(themeMediaQuery);

    const handleMediaQueryChange = () => {
      if (selectedTheme) {
        return;
      }

      setSystemTheme(getSystemTheme());
    };

    handleMediaQueryChange();
    mediaQueryList.addEventListener('change', handleMediaQueryChange);

    // oxlint-disable-next-line typescript/consistent-return
    return () => {
      mediaQueryList.removeEventListener('change', handleMediaQueryChange);
    };
  }, [selectedTheme]);

  const handleThemeChange = useCallback((nextTheme: Theme) => {
    setSelectedTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    handleThemeChange(theme === 'light' ? 'dark' : 'light');
  }, [handleThemeChange, theme]);

  const value = useMemo(
    () => ({ setTheme: handleThemeChange, theme, toggleTheme }),
    [handleThemeChange, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
