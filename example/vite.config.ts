import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project site: https://<user>.github.io/<repo>/
const repoBase = '/rc-table-advanced/';

export default defineConfig(({ command, mode }) => ({
  // Dev & local preview: /  |  gh-pages deploy: /rc-table-advanced/  (npm run build:pages)
  base: mode === 'gh-pages' ? repoBase : '/',
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias:
      command === 'serve'
        ? { 'rc-table-advanced': resolve(__dirname, '../src/index.ts') }
        : undefined,
  },
  optimizeDeps: {
    include: ['react-multi-date-picker', 'react-date-object'],
  },
}));
