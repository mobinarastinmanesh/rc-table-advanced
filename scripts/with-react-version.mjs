import { spawnSync, execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  writeFileSync,
  renameSync,
  symlinkSync,
  unlinkSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const [version, command, ...args] = process.argv.slice(2);
assert.match(
  version ?? '',
  /^\d+\.\d+\.\d+$/,
  'Supply an exact React version.',
);
assert.ok(command, 'Supply a command to run against that React version.');
const root = resolve('.');
const runtime = mkdtempSync(join(tmpdir(), 'rcta-react-runtime-'));
const backup = mkdtempSync(join(root, 'node_modules/.rcta-react-backup-'));
const moved = [];
let status;
try {
  writeFileSync(
    join(runtime, 'package.json'),
    JSON.stringify({
      private: true,
      dependencies: { react: version, 'react-dom': version },
    }),
  );
  const install = spawnSync(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--prefer-offline',
      '--no-audit',
      '--no-fund',
      '--registry=https://registry.npmjs.org',
    ],
    { cwd: runtime, stdio: 'inherit', env: process.env },
  );
  assert.equal(
    install.status,
    0,
    'Could not install the isolated React runtime.',
  );
  for (const name of ['react', 'react-dom']) {
    renameSync(join(root, 'node_modules', name), join(backup, name));
    moved.push(name);
    symlinkSync(
      join(runtime, 'node_modules', name),
      join(root, 'node_modules', name),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
  }
  const actual = execFileSync(
    process.execPath,
    ['-p', 'require("react").version'],
    { cwd: root, encoding: 'utf8' },
  ).trim();
  assert.equal(actual, version);
  console.log(`Running source and compiled tests with React ${actual}.`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) throw result.error;
  status = result.status ?? 1;
} finally {
  for (const name of [...moved].reverse()) {
    unlinkSync(join(root, 'node_modules', name));
    renameSync(join(backup, name), join(root, 'node_modules', name));
  }
  rmSync(backup, { recursive: true });
  rmSync(runtime, { recursive: true, force: true });
}
process.exitCode = status;
