import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import styles from './Layout.module.css';

export const Route = createRootRoute({
  component: () => (
    <>
      <nav className={styles.nav}>
        <div className={styles.navLinks}>
          <Link to='/' className={styles.navLink}>
            Home
          </Link>
          <Link to='/about' className={styles.navLink}>
            About
          </Link>
        </div>
        <ThemeSwitcher />
      </nav>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
