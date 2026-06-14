import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/shared/i18n/components/LanguageSwitcher';
import { setLocaleHintCookie } from '@/shared/i18n/locale';
import { useLocale } from '@/shared/i18n/LocaleProvider';
import { AuthPageHero } from './AuthPageHero';
import { ProviderButton } from './ProviderButton';
import { getBrowserAuthClient } from '../lib/auth-client';
import { googleOAuthCallbackPath } from '../lib/auth-defaults';
import { placeholderAuthProviderIds } from '../lib/auth-providers';
import styles from './LoginPage.module.css';

type LoginPageProps = {
  isGoogleAuthAvailable: boolean;
};

export function LoginPage({ isGoogleAuthAvailable }: LoginPageProps) {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStartingGoogleAuth, setIsStartingGoogleAuth] = useState(false);
  const isGoogleButtonDisabled = !isGoogleAuthAvailable || isStartingGoogleAuth;
  const googleButtonLabel = useMemo(
    () => (isGoogleAuthAvailable ? undefined : t('auth.googleOauthUnavailableButton')),
    [isGoogleAuthAvailable, t]
  );
  const googleOAuthSetupMessage = useMemo(
    () =>
      t('auth.googleOauthUnavailableMessage', {
        callbackPath: googleOAuthCallbackPath
      }),
    [t]
  );
  const soonLabel = useMemo(() => t('common.soon'), [t]);

  const handleGoogleSignIn = useCallback(async () => {
    if (!isGoogleAuthAvailable) {
      setErrorMessage(googleOAuthSetupMessage);
      return;
    }

    setErrorMessage(null);
    setIsStartingGoogleAuth(true);
    setLocaleHintCookie(locale);

    try {
      const response = await getBrowserAuthClient().signIn.social({
        provider: 'google',
        callbackURL: '/'
      });

      if (response.error) {
        setErrorMessage(response.error.message || googleOAuthSetupMessage);
      }
    } catch {
      setErrorMessage(googleOAuthSetupMessage);
    } finally {
      setIsStartingGoogleAuth(false);
    }
  }, [googleOAuthSetupMessage, isGoogleAuthAvailable, locale]);

  return (
    <main className={styles.viewport}>
      <h1 className={styles.srOnly}>{t('auth.loginShellHeading')}</h1>

      <div className={styles.page}>
        <AuthPageHero />

        <section aria-labelledby="login-heading" className={styles.panel}>
          <div className={styles.panelContent}>
            <h2 className={styles.panelHeading} id="login-heading">
              Favoritable
            </h2>
            <p className={styles.panelBody}>
              <span className={styles.mobileOnly}>{t('auth.panel.body.mobile')}</span>
              <span className={styles.desktopOnly}>{t('auth.panel.body.desktop')}</span>
            </p>

            <div className={styles.actions}>
              <ProviderButton
                disabled={isGoogleButtonDisabled}
                isLoading={isStartingGoogleAuth}
                label={googleButtonLabel}
                onClick={handleGoogleSignIn}
                provider="google"
              />
              {placeholderAuthProviderIds.map((provider) => {
                const providerLabel = t(`auth.providers.${provider}.label`);

                return (
                  <ProviderButton
                    accessibleLabel={`${providerLabel} ${soonLabel.toLowerCase()}`}
                    badgeLabel={soonLabel}
                    disabled
                    key={provider}
                    provider={provider}
                  />
                );
              })}
            </div>

            {!isGoogleAuthAvailable ? (
              <output aria-live="polite" className={styles.errorMessage}>
                {googleOAuthSetupMessage}
              </output>
            ) : null}

            {errorMessage ? (
              <p className={styles.errorMessage} role="alert">
                {errorMessage}
              </p>
            ) : null}

            <p className={styles.footnote}>
              <span className={styles.mobileOnly}>{t('auth.footer.mobile')}</span>
              <span className={styles.desktopOnly}>{t('auth.footer.desktop')}</span>
            </p>
          </div>

          <div className={styles.localeSwitcherCorner}>
            <LanguageSwitcher hideLabel locale={locale} onLocaleChange={setLocale} />
          </div>
        </section>
      </div>
    </main>
  );
}
