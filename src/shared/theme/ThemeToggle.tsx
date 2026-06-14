import { Switch } from '@base-ui/react/switch';
import { useCallback, useId } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from './ThemeProvider';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { t } = useTranslation();
  const labelId = useId();
  const { theme, setTheme } = useTheme();
  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      setTheme(checked ? 'dark' : 'light');
    },
    [setTheme]
  );

  return (
    <div className={styles.field}>
      <span className={styles.label} id={labelId}>
        {t('theme.darkMode')}
      </span>
      <Switch.Root
        aria-labelledby={labelId}
        checked={theme === 'dark'}
        className={styles.control}
        onCheckedChange={handleCheckedChange}
      >
        <Switch.Thumb className={styles.thumb} />
      </Switch.Root>
    </div>
  );
}
