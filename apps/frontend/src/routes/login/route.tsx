import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { authClient } from '../../lib/auth-client';
import styles from './layout.module.css';

export const Route = createFileRoute('/login')({
  component: LoginLayout,
  beforeLoad: async () => {
    const { data, isPending } = await authClient.getSession();

    if (isPending) {
      // If auth is still loading, wait for it to complete
      // In Better Auth, we wait for the session to resolve
      return;
    }

    if (data?.user) {
      // If user is authenticated, redirect to home
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
