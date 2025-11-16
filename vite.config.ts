/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const isTest = process.env.VITEST;

// https://vite.dev/config/
export default defineConfig({
  plugins: [!isTest && reactRouter(), tsconfigPaths(), tailwindcss()].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx,js,jsx}'],
  },
});
