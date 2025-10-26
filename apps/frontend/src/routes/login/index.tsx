import { createFileRoute } from '@tanstack/react-router';
import { SocialLoginButton } from '../../components/SocialLoginButton';
import { authClient } from '../../lib/auth-client';
import styles from './login.module.css';

export const Route = createFileRoute('/login/')({
  component: Login,
});

function Login() {
  const handleSocialLogin = async (provider: string) => {
    try {
      await authClient.signIn.social({
        provider: provider as
          | 'google'
          | 'facebook'
          | 'github'
          | 'apple'
          | 'twitter',
        callbackURL: window.location.origin,
      });
    } catch (_error) {
      // TODO: Add proper error handling/display to user
      // For now, silently fail - better error handling will be implemented later
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <h1 className={styles.title}>Sign in to Your Account</h1>
          <p className={styles.subtitle}>
            Choose your preferred sign-in method
          </p>

          <div className={styles.buttonContainer}>
            <SocialLoginButton
              provider='google'
              onClick={() => handleSocialLogin('google')}
            />
            <SocialLoginButton
              provider='facebook'
              onClick={() => handleSocialLogin('facebook')}
            />
            <SocialLoginButton
              provider='github'
              onClick={() => handleSocialLogin('github')}
            />
            <SocialLoginButton
              provider='apple'
              onClick={() => handleSocialLogin('apple')}
            />
            <SocialLoginButton
              provider='twitter'
              onClick={() => handleSocialLogin('twitter')}
            />
          </div>

          <div className={styles.termsContainer}>
            <p className={styles.termsText}>
              By signing in, you agree to our{' '}
              <a href='/terms' className={styles.termsLink}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href='/privacy' className={styles.termsLink}>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
