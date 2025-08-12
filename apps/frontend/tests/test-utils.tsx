import { Theme } from '@radix-ui/themes';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { act } from 'react';
import { routeTree } from '../src/routeTree.gen';

export const createTestRouter = (initialEntries = ['/']) => {
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
      <Theme>
        <RouterProvider router={router} />
      </Theme>
    );
    await router.load();
  });

  if (!renderResult) {
    throw new Error('renderResult was not assigned');
  }

  return renderResult;
};
