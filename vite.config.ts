import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    target: 'es2020',
    lib: {
      entry: {
        'rc-table-advanced': resolve('src/index.ts'),
        core: resolve('src/core.ts'),
        styles: resolve('src/css.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, name) => `${name}.${format === 'cjs' ? 'cjs' : 'js'}`,
      cssFileName: 'rc-table-advanced',
    },
    rolldownOptions: {
      external: (id) =>
        [
          'react',
          'react-dom',
          'rc-table',
          'react/jsx-runtime',
          'react-multi-date-picker',
          'react-date-object',
        ].includes(id),
      output: { banner: '"use client";' },
    },
  },
});
