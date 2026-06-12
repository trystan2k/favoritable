import type { ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { getBrowserAuthClient } from '@/features/auth/lib/auth-client';
import { signOutErrorMessage } from '@/features/auth/lib/auth-defaults';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';

import { ProfileMenu } from '../components/ProfileMenu';
import styles from './ProtectedAppShell.module.css';

type ProtectedAppShellProps = {
  children: ReactNode;
  userEmail: string;
  userName: string;
};

export function ProtectedAppShell({ children, userEmail, userName }: ProtectedAppShellProps) {
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
        setSignOutError(result.error.message || signOutErrorMessage);
        return;
      }

      await navigate({ to: '/login' });
    } catch {
      setSignOutError(signOutErrorMessage);
      return;
    } finally {
      signOutRequestRef.current = false;
      setIsSigningOut(false);
    }
  }, [navigate]);

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span aria-hidden="true" className={styles.sidebarBadge}>
            F
          </span>
          <div className={styles.sidebarCopy}>
            <p className={styles.sidebarEyebrow}>Protected route</p>
            <h1 className={styles.sidebarTitle}>Favoritable</h1>
          </div>
        </div>

        <nav aria-label="Shell sections" className={styles.sidebarNav}>
          <span className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>Library shell</span>
          <span className={styles.sidebarItem}>Collections later</span>
          <span className={styles.sidebarItem}>Settings later</span>
        </nav>

        <p className={styles.sidebarFootnote}>
          Empty app chrome only. Bookmark workflows land in later child tasks.
        </p>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.headerEyebrow}>Theme shell</p>
            <h2 className={styles.headerTitle}>Protected library shell ready</h2>
            <p className={styles.headerCaption}>Protected shell with Better Auth session</p>
            <p className={styles.headerIdentity}>{`${userName} · ${userEmail}`}</p>
            <p className={styles.headerBody}>
              Theme persistence, profile actions, and auth redirects stay live.
            </p>
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
            <p aria-live="polite" className={styles.signOutError} role="alert">
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
