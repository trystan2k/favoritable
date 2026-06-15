import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { APP_VERSION } from '@/version';

import styles from './AuthPageHero.module.css';

export function AuthPageHero() {
  const { t } = useTranslation();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <section aria-labelledby="login-welcome" className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroBrand}>
          <span aria-hidden="true" className={styles.heroBadge}>
            F
          </span>
          <span className={styles.heroLabel}>Favoritable</span>
        </div>

        <div className={styles.heroCopy}>
          <h2 className={styles.heroHeading} id="login-welcome">
            {t('auth.hero.welcome')}
          </h2>
          <p className={styles.heroBody}>
            <span className={styles.mobileOnly}>{t('auth.hero.body.mobile')}</span>
            <span className={styles.desktopOnly}>{t('auth.hero.body.desktop')}</span>
          </p>
        </div>
      </div>

      <div className={styles.heroFooter}>
        <div aria-hidden="true" className={styles.heroShapes}>
          <span className={styles.shapeCircleLarge} />
          <span className={styles.shapeDiamond} />
          <span className={styles.shapeCircleSmall} />
        </div>
        <p className={styles.heroFootnote}>
          <span className={styles.mobileOnly}>
            {t('auth.hero.footer.mobile', { year: currentYear })}
          </span>
          <span className={styles.desktopOnly}>
            {t('auth.hero.footer.desktop', { year: currentYear })}
          </span>
          <span className={styles.desktopOnly}>{APP_VERSION}</span>
        </p>
      </div>
    </section>
  );
}
