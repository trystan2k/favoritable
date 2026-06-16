import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './AuthErrorContent.module.css';

type AuthErrorContentProps = {
  actionHref: '/' | '/login';
  actionLabel: string;
  headingLevel?: 'h1' | 'h2';
};

export function AuthErrorContent({
  actionHref,
  actionLabel,
  headingLevel = 'h1'
}: AuthErrorContentProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const Heading = headingLevel;

  return (
    <section aria-labelledby={headingId} className={styles.content}>
      <p aria-hidden="true" className={styles.code}>
        {t('authError.code')}
      </p>
      <div className={styles.copy}>
        <Heading className={styles.title} id={headingId}>
          {t('authError.title')}
        </Heading>
        <p className={styles.description}>{t('authError.description')}</p>
      </div>
      <Link className={styles.action} to={actionHref}>
        <span aria-hidden="true" className={styles.actionIcon}>
          ←
        </span>
        <span>{actionLabel}</span>
      </Link>
    </section>
  );
}
