import { createFileRoute } from '@tanstack/react-router';
import { SocialLoginButton } from '../../components/SocialLoginButton';
import styles from './login.module.css';

export const Route = createFileRoute('/login/')({
  component: Login,
});

function Login() {
  const getApiBaseUrl = (): string => {
    // In development, use localhost
    if (import.meta.env.DEV) {
      return 'http://localhost:3000';
    }

    // In production, use the current origin
    return window.location.origin;
  };

  const handleSocialLogin = (provider: string) => {
    const apiBaseUrl = getApiBaseUrl();
    window.location.href = `${apiBaseUrl}/api/auth/callback/${provider}`;
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
