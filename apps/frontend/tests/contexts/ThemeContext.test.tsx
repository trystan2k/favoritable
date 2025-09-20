import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  getInitialTheme,
  ThemeProvider,
  useTheme,
} from '../../src/contexts/ThemeContext';

const mockMatchMedia = vi.fn();
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const mockSetAttribute = vi.fn();
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: mockSetAttribute,
});

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  describe('useTheme hook', () => {
    test('should throw error when used outside ThemeProvider', () => {
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');
    });

    test('should return theme context when used within ThemeProvider', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toEqual({
        theme: 'light',
        toggleTheme: expect.any(Function),
        setTheme: expect.any(Function),
      });
    });
  });

  describe('ThemeProvider', () => {
    test('should initialize with light theme by default', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('light');
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    test('should initialize with saved theme from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('dark');
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    test('should initialize with system preference when no saved theme', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('dark');
    });

    test('should ignore invalid saved theme from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-theme');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('light');
    });

    test('should setThem updates theme and saves to localStorage', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'favoritable-theme',
        'dark'
      );
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    test('should toggleThem switches between light and dark', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'favoritable-theme',
        'dark'
      );

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'favoritable-theme',
        'light'
      );
    });

    test('should respond to system theme changes when no saved preference', () => {
      const eventHandlers: { [key: string]: (e: MediaQueryListEvent) => void } =
        {};
      const mockAddEventListener = vi.fn((event, handler) => {
        eventHandlers[event] = handler;
      });

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      mockLocalStorage.getItem.mockReturnValue(null);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );

      // Test system change to dark theme (e.matches: true)
      act(() => {
        const handler = eventHandlers.change;
        if (handler) {
          handler({ matches: true } as MediaQueryListEvent);
        }
      });

      expect(result.current.theme).toBe('dark');

      // Test system change to light theme (e.matches: false)
      act(() => {
        const handler = eventHandlers.change;
        if (handler) {
          handler({ matches: false } as MediaQueryListEvent);
        }
      });

      expect(result.current.theme).toBe('light');
    });

    test('should doe not respond to system theme changes when theme is saved', () => {
      const eventHandlers: { [key: string]: (e: MediaQueryListEvent) => void } =
        {};
      const mockAddEventListener = vi.fn((event, handler) => {
        eventHandlers[event] = handler;
      });

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      mockLocalStorage.getItem
        .mockReturnValueOnce('light')
        .mockReturnValue('light');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('light');

      act(() => {
        const handler = eventHandlers.change;
        if (handler) {
          handler({ matches: true } as MediaQueryListEvent);
        }
      });

      expect(result.current.theme).toBe('light');
    });

    test('should clean up media query listener on unmount', () => {
      const mockRemoveEventListener = vi.fn();
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: vi.fn(),
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { unmount } = renderHook(() => useTheme(), { wrapper });

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    test('should initialize with light theme in SSR environment (window undefined)', () => {
      // Test the getInitialTheme function directly when window is undefined
      const originalWindow = globalThis.window;

      // Temporarily make window undefined to simulate SSR
      // @ts-expect-error - We're intentionally making window undefined for SSR simulation
      delete globalThis.window;

      try {
        const result = getInitialTheme();
        expect(result).toBe('light');
      } catch (_error) {
        expect(true).toBe(false);
      } finally {
        // Restore window for other tests
        globalThis.window = originalWindow;
      }
    });
  });
});
