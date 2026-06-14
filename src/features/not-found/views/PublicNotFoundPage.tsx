import { useTranslation } from 'react-i18next';

import { AuthPageHero } from '@/features/auth/components/AuthPageHero';
import loginStyles from '@/features/auth/components/LoginPage.module.css';
import { LanguageSwitcher } from '@/shared/i18n/components/LanguageSwitcher';
import { useLocale } from '@/shared/i18n/LocaleProvider';

import { NotFoundContent } from '../components/NotFoundContent';
import styles from '../components/NotFoundContent.module.css';

export function PublicNotFoundPage() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  return (
    <main className={loginStyles.viewport}>
      <div className={loginStyles.page}>
        <AuthPageHero />

        <div className={loginStyles.panel}>
          <div className={`${loginStyles.panelContent} ${styles.publicPanelContent}`}>
            <NotFoundContent actionHref="/login" actionLabel={t('notFound.actions.login')} />
          </div>

          <div className={loginStyles.localeSwitcherCorner}>
            <LanguageSwitcher hideLabel locale={locale} onLocaleChange={setLocale} />
          </div>
        </div>
      </div>
    </main>
  );
}
