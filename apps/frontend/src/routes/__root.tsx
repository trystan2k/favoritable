import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <nav
        style={{
          borderBottom: '1px solid #ccc',
          display: 'flex',
          padding: '1rem',
          gap: '1rem',
        }}
      >
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
      </nav>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
