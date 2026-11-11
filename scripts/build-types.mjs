import { rollup } from 'rollup';
import { dts } from 'rollup-plugin-dts';
const bundle = await rollup({
  input: 'types/core.d.ts',
  plugins: [dts({ includeExternal: ['rc-table'] })],
});
await bundle.write({ file: 'dist/index.d.ts', format: 'es' });
await bundle.write({ file: 'dist/index.d.cts', format: 'es' });
await bundle.close();
