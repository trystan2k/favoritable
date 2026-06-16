import { useTranslation } from 'react-i18next';

import { AuthPageHero } from '@/features/auth/components/AuthPageHero';
import loginStyles from '@/features/auth/components/LoginPage.module.css';
import { LanguageSwitcher } from '@/shared/i18n/components/LanguageSwitcher';
import { useLocale } from '@/shared/i18n/LocaleProvider';

import { AuthErrorContent } from '../components/AuthErrorContent';
import styles from '../components/AuthErrorContent.module.css';

export function AuthErrorPage() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  return (
    <main className={loginStyles.viewport}>
      <div className={loginStyles.page}>
        <AuthPageHero />

        <div className={loginStyles.panel}>
          <div className={`${loginStyles.panelContent} ${styles.publicPanelContent}`}>
            <AuthErrorContent actionHref="/login" actionLabel={t('authError.actions.login')} />
          </div>

          <div className={loginStyles.localeSwitcherCorner}>
            <LanguageSwitcher hideLabel locale={locale} onLocaleChange={setLocale} />
          </div>
        </div>
      </div>
    </main>
  );
}
