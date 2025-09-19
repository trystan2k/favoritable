import { useTheme } from '../contexts/ThemeContext';
import { Button } from './Button';
import styles from './ThemeSwitcher.module.css';

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onPress={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      variant='ghost'
      className={styles.themeSwitcher}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
};
