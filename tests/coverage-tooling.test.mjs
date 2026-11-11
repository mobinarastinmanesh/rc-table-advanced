import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { coverageInputs } from '../scripts/coverage-inputs.mjs';

const updater = resolve('scripts/update-coverage-docs.mjs');
const policy = readFileSync('scripts/coverage-policy.mjs', 'utf8');
const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'rcta-coverage-docs-'));
  const write = (path, text) => {
    const file = join(root, path);
    mkdirSync(resolve(file, '..'), { recursive: true });
    writeFileSync(file, text);
  };
  write('src/value.ts', 'export const value = 1;\n');
  write('tests/unit/value.test.mjs', '/* fixture test file */\n');
  write('scripts/coverage-policy.mjs', policy);
  write('vitest.config.ts', 'export default {};\n');
  write('package-lock.json', '{}\n');
  write('package.json', '{"version":"2.0.0-rc.0"}\n');
  write('.prettierrc', '{"singleQuote":true}\n');
  const metric = { total: 10, covered: 10, skipped: 0, pct: 100 };
  const total = {
    lines: metric,
    statements: metric,
    functions: metric,
    branches: metric,
  };
  const summary = { total, [join(root, 'src/value.ts')]: total };
  const results = {
    success: true,
    numFailedTests: 0,
    numPendingTests: 0,
    numTodoTests: 0,
    numPassedTests: 1,
    testResults: [{ name: join(root, 'tests/unit/value.test.mjs') }],
  };
  write('coverage/coverage-summary.json', JSON.stringify(summary));
  write('coverage/test-results.json', JSON.stringify(results));
  write(
    'coverage/provenance.json',
    JSON.stringify({ fingerprint: coverageInputs(root).fingerprint }),
  );
  for (const path of ['README.md', 'docs/testing.md'])
    write(
      path,
      '# Testing\n\n<!-- coverage:summary:start -->\n\nOld\n\n<!-- coverage:summary:end -->\n',
    );
  return {
    root,
    write,
    summary,
    results,
    run: (...args) =>
      execFileSync(process.execPath, [updater, ...args], {
        cwd: root,
        stdio: 'pipe',
      }),
  };
};
test('coverage snapshots regenerate deterministically and reject stale source or altered metrics', () => {
  const f = fixture();
  try {
    f.run();
    f.run('--check');
    const before = readFileSync(
      join(f.root, 'docs/coverage-summary.json'),
      'utf8',
    );
    f.run();
    assert.equal(
      readFileSync(join(f.root, 'docs/coverage-summary.json'), 'utf8'),
      before,
    );
    f.write('src/value.ts', 'export const value = 2;\n');
    assert.throws(() => f.run('--check'));
    assert.throws(() => f.run());
    f.write(
      'coverage/provenance.json',
      JSON.stringify({ fingerprint: coverageInputs(f.root).fingerprint }),
    );
    f.run();
    f.run('--check');
    f.summary.total.lines = { total: 10, covered: 1, pct: 10 };
    f.write('coverage/coverage-summary.json', JSON.stringify(f.summary));
    assert.throws(() => f.run());
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});
test('partial, skipped, TODO and failed test runs cannot update coverage documentation', () => {
  const f = fixture();
  try {
    for (const result of [
      { ...f.results, numPendingTests: 1 },
      { ...f.results, numTodoTests: 1 },
      { ...f.results, numFailedTests: 1 },
      { ...f.results, success: false },
      {
        ...f.results,
        testResults: [{ name: join(f.root, 'tests/unit/another.test.mjs') }],
      },
      { ...f.results, testResults: [] },
    ]) {
      f.write('coverage/test-results.json', JSON.stringify(result));
      assert.throws(() => f.run());
    }
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});
test('fingerprints track runtime/tests/toolchain and exclude only the documented non-runtime files', () => {
  const f = fixture();
  try {
    const before = coverageInputs(f.root).fingerprint;
    f.write('src/demo/example.ts', 'demo');
    f.write('src/css.ts', 'import "./style.css"');
    f.write('src/env.d.ts', 'declare const x: string');
    assert.equal(coverageInputs(f.root).fingerprint, before);
    f.write('tests/unit/value.test.mjs', '/* changed test */');
    assert.notEqual(coverageInputs(f.root).fingerprint, before);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});
