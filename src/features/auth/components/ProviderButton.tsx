import type { MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import { authProviderIcons, type AuthProviderId } from '../lib/auth-providers';

import styles from './ProviderButton.module.css';

type ProviderButtonProps = {
  accessibleLabel?: string;
  badgeLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  provider: AuthProviderId;
};

export function ProviderButton({
  accessibleLabel,
  badgeLabel,
  disabled = false,
  isLoading = false,
  label,
  onClick,
  provider
}: ProviderButtonProps) {
  const { t } = useTranslation();
  const buttonClassName = [
    styles.button,
    styles[provider],
    disabled || isLoading ? styles.disabled : ''
  ]
    .filter(Boolean)
    .join(' ');
  const buttonLabel =
    label ??
    (isLoading
      ? t(`auth.providers.${provider}.loadingLabel`)
      : t(`auth.providers.${provider}.label`));

  return (
    <button
      aria-label={accessibleLabel}
      className={buttonClassName}
      disabled={disabled || isLoading}
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true" className={styles.icon}>
        {authProviderIcons[provider]}
      </span>
      <span className={styles.label}>{buttonLabel}</span>
      {badgeLabel ? (
        <span aria-hidden="true" className={styles.badge}>
          {badgeLabel}
        </span>
      ) : null}
    </button>
  );
}
