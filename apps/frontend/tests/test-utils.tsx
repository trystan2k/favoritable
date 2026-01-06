import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { act } from 'react';
import { vi } from 'vitest';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { routeTree } from '../src/routeTree.gen';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(() => ({ data: null, isPending: false, error: null })),
  getSession: vi.fn(async () => ({
    data: null,
    error: null,
  })),
  signInSocial: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../src/lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: mocks.signInSocial,
    },
    useSession: mocks.useSession,
    signOut: mocks.signOut,
    getSession: mocks.getSession,
  },
}));

export const getMockAuthClient = () => ({
  signInSocial: mocks.signInSocial,
  useSession: mocks.useSession,
  signOut: mocks.signOut,
  getSession: mocks.getSession,
});

export const setupAuth = async (isAuthenticated: boolean): Promise<void> => {
  if (isAuthenticated) {
    const mockSession = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        provider: 'google',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    };

    vi.mocked(mocks.useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
      // biome-ignore lint/suspicious/noExplicitAny: Mock type assertion required for flexible test data
    } as any);

    vi.mocked(mocks.getSession).mockResolvedValue({
      data: mockSession,
      error: null,
      // biome-ignore lint/suspicious/noExplicitAny: Mock type assertion required for flexible test data
    } as any);
  } else {
    mocks.useSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
    });

    mocks.getSession.mockResolvedValue({
      data: null,
      error: null,
    });
  }
};

export const createTestRouter = async (initialEntries = ['/'], authenticated = false) => {
  await setupAuth(authenticated);

  const history = createMemoryHistory({
    initialEntries,
  });

  const router = createRouter({
    routeTree,
    history,
    context: {
      auth: authenticated
        ? {
            session: {
              user: {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                provider: 'google',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              },
            },
            isPending: false,
            error: null,
          }
        : {
            session: null,
            isPending: false,
            error: null,
          },
    },
  });

  return router;
};

export const renderWithRouter = async (
  router: Awaited<ReturnType<typeof createTestRouter>>
): Promise<ReturnType<typeof render>> => {
  let renderResult: ReturnType<typeof render> | undefined;

  await act(async () => {
    renderResult = render(
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    );
    await router.load();
  });

  if (!renderResult) {
    throw new Error('renderResult was not assigned');
  }

  return renderResult;
};
