import { describe, expect, test } from 'vitest';

import { getRouter } from '@/router';

describe('getRouter', () => {
  test('creates router with app defaults', () => {
    const router = getRouter();

    expect(router.routeTree.id).toBe('__root__');
    expect(router.options.scrollRestoration).toBe(true);
    expect(router.options.defaultPreload).toBe('intent');
    expect(router.options.defaultPreloadStaleTime).toBe(0);
    expect(router.options.routeTree?.id).toBe('__root__');
    expect(router.routesById['/']).toBeDefined();
  });
});
