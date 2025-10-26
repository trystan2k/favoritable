import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { authClient } from '../../lib/auth-client';
import styles from './layout.module.css';

export const Route = createFileRoute('/login')({
  component: LoginLayout,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (session?.user) {
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
