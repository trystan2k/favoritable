import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import './styles/global.css';

import { ThemeProvider } from './contexts/ThemeContext';
import { routeTree } from './routeTree.gen';

const router = createRouter({
  routeTree,
  context: {
    // auth will initially be undefined
    // We'll be passing down the auth state from within a React component
    auth: false,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Define the Better Auth session type for router context
type SessionData = {
  user: {
    id: string;
    email: string;
    name: string;
    provider: string;
    createdAt: string;
    updatedAt: string;
  };
} | null;

type BetterAuthContextType = {
  session: SessionData;
  isPending: boolean;
  error: Error | null;
};

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface RouteContext {
    auth?: BetterAuthContextType;
  }
}

// Inner component that uses the Better Auth session
function App() {
  return <RouterProvider router={router} />;
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
}
