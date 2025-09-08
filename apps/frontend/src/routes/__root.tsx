import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

export const Route = createRootRoute({
  component: () => (
    <>
      <nav
        style={{
          borderBottom: '1px solid var(--theme-color-border-primary)',
          display: 'flex',
          padding: 'var(--spacing-4)',
          gap: 'var(--spacing-4)',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--theme-color-background-secondary)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
          <Link
            to='/'
            style={{
              color: 'var(--theme-color-text-primary)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            Home
          </Link>
          <Link
            to='/about'
            style={{
              color: 'var(--theme-color-text-primary)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
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
