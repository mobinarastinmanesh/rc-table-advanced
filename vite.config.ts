import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RcTableAdvanced',
      fileName: (format: string) => `rc-table-advanced.${format}.js`,
      formats: ['es', 'cjs'],
    },

    rollupOptions: {
      external: ['react', 'react-dom', 'rc-table', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: (assetInfo: { name?: string }) =>
          assetInfo.name?.endsWith('.css')
            ? 'rc-table-advanced.css'
            : '[name][extname]',
      },
    },
  },
});
