import { useCallback, useMemo, useState } from 'react';

import { getBrowserAuthClient } from '../lib/auth-client';
import { googleOAuthSetupMessage } from '../lib/auth-defaults';
import { authProviderCopy, placeholderAuthProviderIds } from '../lib/auth-providers';

import { ProviderButton } from './ProviderButton';
import styles from './LoginPage.module.css';

type LoginPageProps = {
  isGoogleAuthAvailable: boolean;
};

export function LoginPage({ isGoogleAuthAvailable }: LoginPageProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStartingGoogleAuth, setIsStartingGoogleAuth] = useState(false);
  const isGoogleButtonDisabled = !isGoogleAuthAvailable || isStartingGoogleAuth;
  const googleButtonLabel = useMemo(
    () => (isGoogleAuthAvailable ? undefined : 'Google OAuth unavailable'),
    [isGoogleAuthAvailable]
  );
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const handleGoogleSignIn = useCallback(async () => {
    if (!isGoogleAuthAvailable) {
      setErrorMessage(googleOAuthSetupMessage);
      return;
    }

    setErrorMessage(null);
    setIsStartingGoogleAuth(true);

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
  }, [isGoogleAuthAvailable]);

  return (
    <main className={styles.viewport}>
      <h1 className={styles.srOnly}>Favoritable login shell</h1>

      <div className={styles.page}>
        <section aria-labelledby="login-welcome" className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroBrand}>
              <span aria-hidden="true" className={styles.heroBadge}>
                F
              </span>
              <span className={styles.heroLabel}>Favoritable</span>
            </div>

            <div className={styles.heroCopy}>
              <p className={styles.heroHeading} id="login-welcome">
                Welcome
              </p>
              <p className={styles.heroBody}>
                <span className={styles.mobileOnly}>
                  Save, organize, and rediscover your favorite pages.
                </span>
                <span className={styles.desktopOnly}>
                  Save, organize, and rediscover your favorite pages from across the web. Your
                  modern bookmark library awaits.
                </span>
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
              <span className={styles.mobileOnly}>© {currentYear} Favoritable</span>
              <span className={styles.desktopOnly}>
                © {currentYear} Favoritable. All rights reserved.
              </span>
            </p>
          </div>
        </section>

        <section aria-labelledby="login-heading" className={styles.panel}>
          <div className={styles.panelContent}>
            <h2 className={styles.panelHeading} id="login-heading">
              Favoritable
            </h2>
            <p className={styles.panelBody}>
              <span className={styles.mobileOnly}>Sign in to continue</span>
              <span className={styles.desktopOnly}>Sign in to your account to continue</span>
            </p>

            <div className={styles.actions}>
              <ProviderButton
                disabled={isGoogleButtonDisabled}
                isLoading={isStartingGoogleAuth}
                label={googleButtonLabel}
                onClick={handleGoogleSignIn}
                provider="google"
              />
              {placeholderAuthProviderIds.map((provider) => (
                <ProviderButton
                  accessibleLabel={`${authProviderCopy[provider].label} soon`}
                  disabled
                  key={provider}
                  provider={provider}
                  badgeLabel="soon"
                />
              ))}
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
              <span className={styles.mobileOnly}>
                By signing in, you agree to our Terms and Privacy Policy
              </span>
              <span className={styles.desktopOnly}>
                By signing in, you agree to our Terms of Service and Privacy Policy
              </span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
