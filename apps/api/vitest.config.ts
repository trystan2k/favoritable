import baseConfig from '@favoritable/test-config/vitest.config';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      env: {
        NODE_ENV: 'test',
      },
      coverage: {
        exclude: ['src/db/migrations/**', 'src/env.ts', 'src/index.ts'],
        thresholds: {
          lines: 0,
          functions: 0,
          branches: 0,
          statements: 0,
          perFile: true,
        },
      },
    },
  })
);
