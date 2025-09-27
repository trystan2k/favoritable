import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { isAuthenticated } from '../../auth/auth';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import styles from './layout.module.css';

export const Route = createFileRoute('/login')({
  component: LoginLayout,
  beforeLoad: async () => {
    if (isAuthenticated()) {
      throw redirect({
        to: '/home',
      });
    }
  },
});

function LoginLayout() {
  return (
    <>
      <header className={styles.header}>
        <ThemeSwitcher />
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
