import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './NotFoundContent.module.css';

type NotFoundContentProps = {
  actionHref: '/' | '/login';
  actionLabel: string;
  headingLevel?: 'h1' | 'h2';
};

export function NotFoundContent({
  actionHref,
  actionLabel,
  headingLevel = 'h1'
}: NotFoundContentProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const Heading = headingLevel;

  return (
    <section aria-labelledby={headingId} className={styles.content}>
      <p aria-hidden="true" className={styles.code}>
        404
      </p>
      <div className={styles.copy}>
        <Heading className={styles.title} id={headingId}>
          {t('notFound.title')}
        </Heading>
        <p className={styles.description}>{t('notFound.description')}</p>
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
