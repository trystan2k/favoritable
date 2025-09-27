import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { act } from 'react';
import { vi } from 'vitest';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { routeTree } from '../src/routeTree.gen';

// Mock localStorage for testing
export const mockLocalStorage = {
  clear: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Setup function to mock authentication state
export const setupAuth = (isAuthenticated: boolean) => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });

  if (isAuthenticated) {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'token') return 'mock-token';
      return null;
    });
  } else {
    mockLocalStorage.getItem.mockReturnValue(null);
  }
};

export const createTestRouter = (
  initialEntries = ['/'],
  authenticated = false
) => {
  // Set up authentication state
  setupAuth(authenticated);

  const history = createMemoryHistory({
    initialEntries,
  });

  const router = createRouter({
    routeTree,
    history,
  });

  return router;
};

export const renderWithRouter = async (
  router: ReturnType<typeof createTestRouter>
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
