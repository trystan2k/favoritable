import { Button } from '@radix-ui/themes';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='2'
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'var(--spacing-8)',
        height: 'var(--spacing-8)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--theme-color-border-secondary)',
        backgroundColor: 'var(--theme-color-background-card)',
        color: 'var(--theme-color-text-primary)',
        transition: 'all 0.2s ease',
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
};
