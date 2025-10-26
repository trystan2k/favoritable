import baseConfig from '@favoritable/test-config/vitest.config';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setupTest.ts'],
      coverage: {
        exclude: [
          'src/routeTree.gen.ts',
          'src/index.tsx',
          'src/lib/auth-client.ts',
        ],
      },
    },
  })
);
