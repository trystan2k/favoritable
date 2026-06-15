import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { LanguageSwitcher } from '@/shared/i18n/components/LanguageSwitcher';
import { TestI18nProvider } from '@/test-support/TestI18nProvider';

const { selectState } = vi.hoisted(() => ({
  selectState: {
    onValueChange: undefined as ((value: string | null) => void) | undefined,
    renderedValue: null as unknown
  }
}));

vi.mock('@base-ui/react/select', () => ({
  Select: {
    Root: ({
      children,
      onValueChange
    }: {
      children: ReactNode;
      onValueChange?: (value: string | null) => void;
    }) => {
      selectState.onValueChange = onValueChange;
      return <div>{children}</div>;
    },
    Trigger: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
    Value: ({ children }: { children: (value: unknown) => ReactNode }) => (
      <>{children(selectState.renderedValue)}</>
    ),
    Portal: ({ children }: { children: ReactNode }) => <>{children}</>,
    Positioner: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Popup: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
    List: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
    Item: ({ children, value, ...props }: { children: ReactNode; value: string }) => (
      <button {...props} onClick={() => selectState.onValueChange?.(value)} type="button">
        {children}
      </button>
    ),
    ItemIndicator: ({ children, ...props }: { children: ReactNode }) => (
      <span {...props}>{children}</span>
    ),
    ItemText: ({ children, ...props }: { children: ReactNode }) => (
      <span {...props}>{children}</span>
    )
  }
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    selectState.onValueChange = undefined;
    selectState.renderedValue = null;
  });

  test('ignores null, invalid, and unchanged locale selections', () => {
    const onLocaleChange = vi.fn<(locale: 'en' | 'es' | 'pt-BR') => void>();

    render(
      <TestI18nProvider>
        <LanguageSwitcher hideLabel locale="en" onLocaleChange={onLocaleChange} />
      </TestI18nProvider>
    );

    expect(screen.getByText('Language')).toBeDefined();

    selectState.onValueChange?.(null);
    selectState.onValueChange?.('fr');
    selectState.onValueChange?.('en');

    expect(onLocaleChange).not.toHaveBeenCalled();
  });

  test('calls locale change handler when user picks a different supported locale', () => {
    const onLocaleChange = vi.fn<(locale: 'en' | 'es' | 'pt-BR') => void>();

    render(
      <TestI18nProvider>
        <LanguageSwitcher locale="en" onLocaleChange={onLocaleChange} />
      </TestI18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Español ✓' }));

    expect(onLocaleChange).toHaveBeenCalledWith('es');
  });

  test('falls back to current locale when select render value is invalid', () => {
    selectState.renderedValue = 'fr';

    render(
      <TestI18nProvider>
        <LanguageSwitcher
          locale="pt-BR"
          onLocaleChange={vi.fn<(locale: 'en' | 'es' | 'pt-BR') => void>()}
        />
      </TestI18nProvider>
    );

    expect(screen.getByText('Language').parentElement).toHaveTextContent('Português');
  });
});
