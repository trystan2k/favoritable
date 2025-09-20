import { Moon, Sun } from 'lucide-react';
import { Button } from 'react-aria-components';
import { useTheme } from '../contexts/ThemeContext';
import buttonSharedStyles from '../shared-styles/Button.module.css';
import { cx } from '../utils/cx';
import styles from './ThemeSwitcher.module.css';

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onPress={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className={cx(
        buttonSharedStyles.button,
        buttonSharedStyles.ghost,
        styles.themeSwitcher
      )}
    >
      {theme === 'light' ? (
        <Moon fill='var(--color-amber-400)' />
      ) : (
        <Sun fill='var(--color-amber-800)' stroke='var(--color-amber-800)' />
      )}
    </Button>
  );
};
