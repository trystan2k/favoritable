import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import viteReact from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

import killerInstincts from 'vite-plugin-killer-instincts';

const config = defineConfig({
  server: {
    port: 4000,
    strictPort: true
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
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
  ]
});

export default config;
