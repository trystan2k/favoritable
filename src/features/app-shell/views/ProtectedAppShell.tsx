import type { ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import { ProfileMenu } from '@/features/app-shell/components/ProfileMenu';
import { getBrowserAuthClient } from '@/features/auth/lib/auth-client';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';

import styles from './ProtectedAppShell.module.css';

type ProtectedAppShellProps = {
  children: ReactNode;
  userEmail: string;
  userName: string;
};

export function ProtectedAppShell({ children, userEmail, userName }: ProtectedAppShellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signOutRequestRef = useRef(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = useCallback(async () => {
    if (signOutRequestRef.current) {
      return;
    }

    signOutRequestRef.current = true;
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      const result = await getBrowserAuthClient().signOut();

      if (result?.error) {
        setSignOutError(result.error.message || t('appShell.signOutError'));
        return;
      }

      await navigate({ to: '/login' });
    } catch {
      setSignOutError(t('appShell.signOutError'));
      return;
    } finally {
      signOutRequestRef.current = false;
      setIsSigningOut(false);
    }
  }, [navigate, t]);

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        {t('appShell.skipToMainContent')}
      </a>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span aria-hidden="true" className={styles.sidebarBadge}>
            F
          </span>
          <div className={styles.sidebarCopy}>
            <p className={styles.sidebarEyebrow}>{t('appShell.sidebar.eyebrow')}</p>
            <h1 className={styles.sidebarTitle}>Favoritable</h1>
          </div>
        </div>

        <nav aria-label={t('appShell.sidebar.navLabel')} className={styles.sidebarNav}>
          <span className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>
            {t('appShell.sidebar.activeSection')}
          </span>
          <span className={styles.sidebarItem}>{t('appShell.sidebar.collections')}</span>
          <span className={styles.sidebarItem}>{t('appShell.sidebar.settings')}</span>
        </nav>

        <p className={styles.sidebarFootnote}>{t('appShell.sidebar.footnote')}</p>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.headerEyebrow}>{t('appShell.header.eyebrow')}</p>
            <h2 className={styles.headerTitle}>{t('appShell.header.title')}</h2>
            <p className={styles.headerCaption}>{t('appShell.header.caption')}</p>
            <p className={styles.headerIdentity}>{`${userName} · ${userEmail}`}</p>
            <p className={styles.headerBody}>{t('appShell.header.body')}</p>
          </div>

          <div className={styles.headerActions}>
            <ThemeToggle />
            <ProfileMenu
              isSigningOut={isSigningOut}
              onSignOut={handleSignOut}
              userEmail={userEmail}
              userName={userName}
            />
          </div>

          {signOutError ? (
            <p className={styles.signOutError} role="alert">
              {signOutError}
            </p>
          ) : null}
        </header>

        <main className={styles.content} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
