import { defineConfig } from 'vite';
import { playwright } from '@vitest/browser-playwright';
import { devtools } from '@tanstack/devtools-vite';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import viteReact from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

import killerInstincts from 'vite-plugin-killer-instincts';

export default defineConfig(({ mode }) => {
  const isVitest = mode === 'test' || process.env.VITEST === 'true';

  return {
    server: {
      host: 'localhost',
      port: 4000,
      strictPort: true
    },
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      ...(!isVitest ? [cloudflare({ viteEnvironment: { name: 'ssr' } })] : []),
      ...tanstackStart({
        router: {
          routesDirectory: './routes',
          generatedRouteTree: './routeTree.gen.ts',
          enableRouteGeneration: true,
          quoteStyle: 'single'
        }
      }),
      viteReact(),
      killerInstincts({ autoKill: true })
    ],
    test: {
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/routeTree.gen.ts', 'src/routes/__root.tsx', 'src/routes/index.tsx'],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      },
      projects: [
        {
          extends: true,
          test: {
            name: 'node',
            environment: 'node',
            include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
            exclude: ['test/**/*.browser.test.ts', 'test/**/*.browser.test.tsx']
          }
        },
        {
          extends: true,
          test: {
            name: 'browser',
            include: ['test/**/*.browser.test.ts', 'test/**/*.browser.test.tsx'],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({
                launchOptions: {
                  channel: 'chromium'
                }
              }),
              instances: [{ browser: 'chromium' }]
            },
            setupFiles: ['test/setup/browser.ts']
          }
        }
      ]
    }
  };
});
