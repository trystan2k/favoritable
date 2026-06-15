'use client';

import { Select } from '@base-ui/react/select';
import { useCallback, useId } from 'react';
import { useTranslation } from 'react-i18next';

import { isLocale, localeFlags, supportedLocales, type Locale } from '../locale';

import styles from './LanguageSwitcher.module.css';

type LanguageSwitcherProps = {
  align?: 'start' | 'center' | 'end';
  className?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void | Promise<void>;
};

export function LanguageSwitcher({
  align = 'end',
  className,
  disabled = false,
  hideLabel = false,
  locale,
  onLocaleChange
}: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const triggerClassName = className ? `${styles.root} ${className}` : styles.root;
  const labelClassName = hideLabel ? `${styles.label} ${styles.labelHidden}` : styles.label;
  const languageLabel = t('common.language');
  const handleValueChange = useCallback(
    (value: Locale | null) => {
      if (!isLocale(value) || value === locale) {
        return;
      }

      void onLocaleChange(value);
    },
    [locale, onLocaleChange]
  );
  const resolveDisplayLocale = useCallback(
    (value: unknown) => (isLocale(value) ? value : locale),
    [locale]
  );

  return (
    <Select.Root disabled={disabled} onValueChange={handleValueChange} value={locale}>
      <div className={triggerClassName}>
        <span className={labelClassName} id={labelId}>
          {languageLabel}
        </span>
        <Select.Trigger aria-labelledby={labelId} className={styles.trigger}>
          <Select.Value>
            {(value) => {
              const displayLocale = resolveDisplayLocale(value);

              return (
                <span className={styles.value}>
                  <span aria-hidden="true" className={styles.flag}>
                    {localeFlags[displayLocale]}
                  </span>
                  <span>{t(`locale.names.${displayLocale}`)}</span>
                </span>
              );
            }}
          </Select.Value>
          <span aria-hidden="true" className={styles.icon}>
            ▾
          </span>
        </Select.Trigger>
      </div>
      <Select.Portal>
        <Select.Positioner align={align} side="bottom" sideOffset={8}>
          <Select.Popup className={styles.popup}>
            <Select.List className={styles.list}>
              {supportedLocales.map((supportedLocale) => (
                <Select.Item className={styles.item} key={supportedLocale} value={supportedLocale}>
                  <Select.ItemText className={styles.itemText}>
                    <span className={styles.itemLabel}>
                      <span aria-hidden="true" className={styles.flag}>
                        {localeFlags[supportedLocale]}
                      </span>
                      <span>{t(`locale.names.${supportedLocale}`)}</span>
                    </span>
                  </Select.ItemText>
                  <Select.ItemIndicator className={styles.itemIndicator}>✓</Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
