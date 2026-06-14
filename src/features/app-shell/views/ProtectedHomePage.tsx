import { useTranslation } from 'react-i18next';

import styles from './ProtectedHomePage.module.css';

export function ProtectedHomePage() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="protected-home-heading" className={styles.panel}>
      <p className={styles.eyebrow}>{t('home.eyebrow')}</p>
      <h2 className={styles.heading} id="protected-home-heading">
        {t('home.heading')}
      </h2>
      <p className={styles.body}>{t('home.body')}</p>
      <div className={styles.statusRow}>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>{t('home.status.session')}</span>
          <strong className={styles.statusValue}>{t('home.status.protected')}</strong>
        </div>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>{t('home.status.theme')}</span>
          <strong className={styles.statusValue}>{t('home.status.themeValue')}</strong>
        </div>
      </div>
    </section>
  );
}
