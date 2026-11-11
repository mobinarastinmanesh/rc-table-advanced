import { readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { format, resolveConfig } from 'prettier';
import assert from 'node:assert/strict';
import { coveragePolicy } from './coverage-policy.mjs';
import { coverageInputs } from './coverage-inputs.mjs';
const check = process.argv.includes('--check');
const root = resolve('.');
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const inputs = coverageInputs(root);
assert.ok(
  existsSync('coverage/coverage-summary.json'),
  'Run npm run test:coverage before building documentation.',
);
assert.equal(
  read('coverage/provenance.json').fingerprint,
  inputs.fingerprint,
  'Coverage report is stale. Run npm run test:coverage.',
);
const summary = Object.fromEntries(
  Object.entries(read('coverage/coverage-summary.json')).map(
    ([path, metrics]) => [
      path === 'total' ? path : realpathSync(path),
      metrics,
    ],
  ),
);
const results = read('coverage/test-results.json');
assert.equal(
  results.numTodoTests,
  0,
  'Coverage documentation requires no TODO tests.',
);
assert.equal(results.numFailedTests, 0, 'Cannot document a failing test run.');
assert.equal(
  results.numPendingTests,
  0,
  'Coverage documentation requires the complete suite without skipped tests.',
);
assert.equal(
  results.testResults.length,
  inputs.tests.length,
  'Coverage documentation requires every source test file.',
);
assert.ok(summary.total.lines.total > 0, 'Empty coverage is not valid.');
assert.equal(
  results.success,
  true,
  'Cannot document an unsuccessful test run.',
);
assert.deepEqual(
  results.testResults.map((result) => realpathSync(result.name)).sort(),
  [...inputs.tests].sort(),
  'Coverage documentation requires the exact complete source suite.',
);
const files = {};
for (const source of inputs.source) {
  assert.ok(
    summary[source],
    `Source file missing from coverage: ${relative(root, source)}`,
  );
  files[relative(root, source).split(sep).join('/')] = summary[source];
  for (const [metric, threshold] of Object.entries(
    coveragePolicy.minimumPerFile,
  )) {
    const value = summary[source][metric];
    if (value.total > 0)
      assert.ok(
        value.pct >= threshold,
        `${relative(root, source)}: ${metric} is below the ${threshold}% per-file floor`,
      );
  }
}
for (const [metric, threshold] of Object.entries(coveragePolicy.thresholds)) {
  assert.ok(
    summary.total[metric].pct >= threshold,
    `${metric} coverage is below ${threshold}%`,
  );
}
const snapshot = {
  version: read('package.json').version,
  fingerprint: inputs.fingerprint,
  sourceFiles: inputs.source.length,
  testFiles: inputs.tests.length,
  tests: results.numPassedTests,
  thresholds: coveragePolicy.thresholds,
  minimumPerFile: coveragePolicy.minimumPerFile,
  total: summary.total,
  files,
};
const metrics = ['statements', 'branches', 'functions', 'lines'];
const rows = metrics
  .map(
    (metric) =>
      `| ${metric} | ${summary.total[metric].covered} / ${summary.total[metric].total} | ${summary.total[metric].pct}% | ${coveragePolicy.thresholds[metric]}% |`,
  )
  .join('\n');
const block = `<!-- coverage:summary:start -->\n\nMeasured from the complete source test suite for **${snapshot.version}**: **${snapshot.tests} tests** across **${snapshot.testFiles} files**.\n\n| Metric | Covered / total | Coverage | Required |\n| --- | --- | --- | --- |\n${rows}\n\nSource, test and toolchain fingerprint: \`${inputs.fingerprint.slice(0, 16)}\`. Demo code, declaration-only files and the CSS-only entry are excluded; runtime library code is included even when unimported.\n\n<!-- coverage:summary:end -->`;
const prettier = await resolveConfig('README.md');
for (const path of ['README.md', 'docs/testing.md']) {
  const current = readFileSync(path, 'utf8');
  assert.match(
    current,
    /<!-- coverage:summary:start -->[\s\S]*?<!-- coverage:summary:end -->/,
  );
  const next = await format(
    current.replace(
      /<!-- coverage:summary:start -->[\s\S]*?<!-- coverage:summary:end -->/,
      block,
    ),
    { ...prettier, parser: 'markdown' },
  );
  if (check)
    assert.equal(
      current,
      next,
      `${path} coverage snapshot is stale. Run npm run test:coverage.`,
    );
  else writeFileSync(path, next);
}
const json = JSON.stringify(snapshot, null, 2) + '\n';
if (check)
  assert.equal(
    readFileSync('docs/coverage-summary.json', 'utf8'),
    json,
    'Coverage JSON snapshot is stale.',
  );
else writeFileSync('docs/coverage-summary.json', json);
console.log(
  `Coverage documentation ${check ? 'verified' : 'updated'}: ${summary.total.lines.pct}% lines, ${summary.total.branches.pct}% branches.`,
);
