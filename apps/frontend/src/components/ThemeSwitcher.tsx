import { Button } from 'react-aria-components';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onPress={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className='button-ghost'
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'var(--spacing-8)',
        height: 'var(--spacing-8)',
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
};
