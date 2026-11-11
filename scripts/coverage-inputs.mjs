import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
const normalized = (root, file) => relative(root, file).split(sep).join('/');
const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
export const coverageInputs = (root = resolve('.')) => {
  root = realpathSync(root);
  const source = walk(join(root, 'src')).filter(
    (path) =>
      /\.tsx?$/.test(path) &&
      !path.endsWith('.d.ts') &&
      !normalized(root, path).startsWith('src/demo/') &&
      normalized(root, path) !== 'src/css.ts',
  );
  const tests = walk(join(root, 'tests/unit')).filter((path) =>
    path.endsWith('.mjs'),
  );
  const files = [
    ...source,
    ...tests,
    join(root, 'vitest.config.ts'),
    join(root, 'scripts/coverage-policy.mjs'),
    join(root, 'package-lock.json'),
  ].sort();
  const hash = createHash('sha256');
  for (const file of files)
    hash
      .update(normalized(root, file))
      .update('\0')
      .update(readFileSync(file))
      .update('\0');
  return {
    fingerprint: hash.digest('hex'),
    source,
    tests: tests.filter((path) => path.endsWith('.test.mjs')),
  };
};
