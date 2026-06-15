import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TestI18nProvider } from '@/test-support/TestI18nProvider';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';

function createMatchMediaEventTarget() {
  const listeners = new Set<EventListenerOrEventListenerObject>();
  let matches = false;

  const notifyListener = (
    listener: EventListenerOrEventListenerObject,
    event: MediaQueryListEvent
  ) => {
    if (typeof listener === 'function') {
      listener.call(window, event);
      return;
    }

    listener.handleEvent(event);
  };

  return {
    addEventListener: (_eventName: string, listener: EventListenerOrEventListenerObject) => {
      listeners.add(listener);
    },
    dispatch(matchesValue: boolean) {
      matches = matchesValue;
      const event = { matches: matchesValue } as MediaQueryListEvent;

      for (const listener of listeners) {
        notifyListener(listener, event);
      }
    },
    get matches() {
      return matches;
    },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    removeEventListener: (_eventName: string, listener: EventListenerOrEventListenerObject) => {
      listeners.delete(listener);
    }
  } satisfies Pick<
    MediaQueryList,
    'addEventListener' | 'matches' | 'media' | 'onchange' | 'removeEventListener'
  > & {
    dispatch: (matchesValue: boolean) => void;
  };
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  test('toggles theme and persists preference', async () => {
    const mediaQueryList = createMatchMediaEventTarget();

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mediaQueryList));

    render(
      <TestI18nProvider>
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      </TestI18nProvider>
    );

    const switchControl = screen.getByRole('switch', { name: 'Dark mode' });

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('light');
      expect(window.localStorage.getItem('favoritable-theme')).toBeNull();
    });

    fireEvent.click(switchControl);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(document.documentElement.style.colorScheme).toBe('dark');
      expect(window.localStorage.getItem('favoritable-theme')).toBe('dark');
      expect(switchControl).toHaveAttribute('aria-checked', 'true');
    });
  });

  test('follows system theme changes until user picks a theme', async () => {
    const mediaQueryList = createMatchMediaEventTarget();

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mediaQueryList));

    render(
      <TestI18nProvider>
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      </TestI18nProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('light');
      expect(window.localStorage.getItem('favoritable-theme')).toBeNull();
    });

    mediaQueryList.dispatch(true);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(window.localStorage.getItem('favoritable-theme')).toBeNull();
    });
  });

  test('respects stored theme and ignores system changes after preference saved', async () => {
    const mediaQueryList = createMatchMediaEventTarget();

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mediaQueryList));
    window.localStorage.setItem('favoritable-theme', 'dark');

    render(
      <TestI18nProvider>
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      </TestI18nProvider>
    );

    const switchControl = screen.getByRole('switch', { name: 'Dark mode' });

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(switchControl).toHaveAttribute('aria-checked', 'true');
    });

    mediaQueryList.dispatch(false);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(window.localStorage.getItem('favoritable-theme')).toBe('dark');
    });
  });
});
