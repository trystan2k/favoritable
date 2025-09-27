import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { isAuthenticated } from '../../auth/auth';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import styles from './layout.module.css';

export const Route = createFileRoute('/(protected)')({
  component: ProtectedLayout,
  beforeLoad: async ({ location }) => {
    if (!isAuthenticated()) {
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
        <ThemeSwitcher />
      </nav>
      <Outlet />
    </>
  );
}
