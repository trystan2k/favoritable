import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { type AuthContextType, useAuth } from '../../contexts/AuthContext';
import styles from './layout.module.css';

export const Route = createFileRoute('/(protected)')({
  component: ProtectedLayout,
  beforeLoad: async ({ location, context }) => {
    // Access auth context from the router context
    const auth = (context as { auth?: AuthContextType }).auth;

    // If auth is still loading, we should wait or redirect
    // In our current setup, the app loads with auth state, so this should be resolved
    if (!auth) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }

    // If not authenticated, redirect to login
    if (!auth.isAuthenticated) {
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
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
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
          {user && (
            <span className={styles.userInfo}>Welcome, {user.name}</span>
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
