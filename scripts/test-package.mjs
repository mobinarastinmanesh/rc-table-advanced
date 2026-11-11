import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve('.');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const temp = mkdtempSync(join(tmpdir(), 'rcta-consumer-'));
const run = (command, args, cwd = temp) =>
  execFileSync(command, args, {
    cwd,
    stdio: 'pipe',
    env: process.env,
  }).toString();
try {
  const [packed] = JSON.parse(
    run('npm', ['pack', '--json', '--pack-destination', temp], root),
  );
  for (const file of [
    'dist/rc-table-advanced.js',
    'dist/rc-table-advanced.cjs',
    'dist/index.d.ts',
    'dist/index.d.cts',
    'dist/rc-table-advanced.css',
  ])
    assert.ok(
      packed.files.some((entry) => entry.path === file),
      `Missing ${file}`,
    );
  assert.ok(!packed.files.some((entry) => entry.path === '.npmrc'));
  writeFileSync(
    join(temp, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      dependencies: {
        'rc-table-advanced': `file:${join(temp, packed.filename)}`,
        react: process.env.RCTA_REACT_VERSION ?? pkg.devDependencies.react,
        'react-dom':
          process.env.RCTA_REACT_VERSION ?? pkg.devDependencies['react-dom'],
        '@types/react': process.env.RCTA_REACT_VERSION?.startsWith('18.')
          ? '^18.3.0'
          : pkg.devDependencies['@types/react'],
        '@types/react-dom': process.env.RCTA_REACT_VERSION?.startsWith('18.')
          ? '^18.3.0'
          : pkg.devDependencies['@types/react-dom'],
      },
    }),
  );
  run('npm', [
    'install',
    '--registry=https://registry.npmjs.org',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    ...(process.env.RCTA_CONSUMER_OFFLINE
      ? ['--offline']
      : ['--prefer-offline']),
  ]);
  const smoke = `
    const html = renderToStaticMarkup(createElement(AdvancedTable, {
      rowKey: 'id', columns: [{ title: 'Name', dataIndex: 'name' }], data: [{ id: 1, name: 'Package consumer' }]
    }));
    if (!html.includes('Package consumer')) throw new Error('SSR did not render rows');
  `;
  writeFileSync(
    join(temp, 'consumer.mjs'),
    `import { AdvancedTable } from 'rc-table-advanced';\nimport { createElement } from 'react';\nimport { renderToStaticMarkup } from 'react-dom/server';\n${smoke}`,
  );
  writeFileSync(
    join(temp, 'consumer.cjs'),
    `const { AdvancedTable } = require('rc-table-advanced');\nconst { createElement } = require('react');\nconst { renderToStaticMarkup } = require('react-dom/server');\n${smoke}\nrequire.resolve('rc-table-advanced/styles.css');\nrequire('rc-table-advanced/core');`,
  );
  run(process.execPath, ['consumer.mjs']);
  run(process.execPath, ['consumer.cjs']);
  const source = `import { AdvancedTable, type FilterSchema, FilterType } from 'rc-table-advanced';
import { createElement } from 'react';
type Row = { id: number; name: string };
type Filters = { status?: string };
const schema: FilterSchema<Filters>[] = [{ key: 'status', label: 'Status', type: FilterType.SINGLE_SELECT, options: [] }];
// @ts-expect-error schema keys must belong to the filter model
const invalid: FilterSchema<Filters> = { key: 'typo', label: 'Wrong', type: FilterType.SINGLE_SELECT, options: [] };
createElement(AdvancedTable<Row, Filters>, { rowKey: 'id', columns: [{ dataIndex: 'name' }], data: [], filterModalSchema: schema });
void invalid;
`;
  for (const extension of ['mts', 'cts']) {
    writeFileSync(join(temp, `types.${extension}`), source);
    run(process.execPath, [
      join(root, 'node_modules/typescript/bin/tsc'),
      '--noEmit',
      '--strict',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2020',
      `types.${extension}`,
    ]);
  }
  const readme = readFileSync('README.md', 'utf8');
  const serverGuide = readFileSync('docs/state-and-server.md', 'utf8');
  let index = 0;
  for (const document of [readme, serverGuide]) {
    const snippet = [...document.matchAll(/```tsx\n([\s\S]*?)```/g)].find(
      (match) => match[1].includes('export function'),
    )?.[1];
    assert.ok(snippet, 'Missing complete documentation example');
    writeFileSync(join(temp, `example-${index++}.tsx`), snippet);
  }
  run(process.execPath, [
    join(root, 'node_modules/typescript/bin/tsc'),
    '--noEmit',
    '--strict',
    '--module',
    'ESNext',
    '--moduleResolution',
    'Bundler',
    '--jsx',
    'react-jsx',
    '--target',
    'ES2020',
    'example-0.tsx',
    'example-1.tsx',
  ]);
  console.log(
    `Tarball ${pkg.version}: ESM, CJS, CSS exports, NodeNext types and documentation examples passed (React ${process.env.RCTA_REACT_VERSION ?? pkg.devDependencies.react}).`,
  );
} catch (error) {
  if (error.stdout) process.stderr.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  throw error;
} finally {
  rmSync(temp, { recursive: true, force: true });
}
