import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { authClient } from '../../lib/auth-client';
import styles from './layout.module.css';

export const Route = createFileRoute('/(protected)')({
  component: ProtectedLayout,
  beforeLoad: async ({ location }) => {
    // Access auth context from the router context
    const { data, isPending } = await authClient.getSession();
    if (isPending) {
      // If auth is still loading, wait for it to complete
      // In Better Auth, we wait for the session to resolve
      return;
    }

    if (!data?.user) {
      // If there's no session, redirect to login
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function ProtectedLayout() {
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      // After logout, the route protection will redirect to login
    } catch {
      // Logout failed, but we'll let the user try again
    }
  };

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navLinks}>
          <Link to='/home' className={styles.navLink}>
            Home
          </Link>
          <Link to='/about' className={styles.navLink}>
            About
          </Link>
        </div>
        <div className={styles.navActions}>
          {session?.user && (
            <span className={styles.userInfo}>
              Welcome, {session.user.name}
            </span>
          )}
          <button
            type='button'
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Logout
          </button>
          <ThemeSwitcher />
        </div>
      </nav>
      <Outlet />
    </>
  );
}
