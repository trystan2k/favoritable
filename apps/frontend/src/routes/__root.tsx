import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <div
        style={{
          borderBottom: '1px solid #ccc',
          display: 'flex',
          padding: '1rem',
          gap: '1rem',
        }}
      >
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
      </div>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
