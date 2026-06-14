/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The base path matches the GitHub Pages project repo so assets resolve in
// production. Locally (dev/test) it stays at root.
const base = process.env.NODE_ENV === 'production' ? '/sql-mastery/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy, independently-cacheable libraries out of the main bundle
        // so the initial route loads less and vendors cache across deploys.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          reactflow: ['reactflow'],
          pdf: ['jspdf'],
          sqljs: ['sql.js'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
  },
});
