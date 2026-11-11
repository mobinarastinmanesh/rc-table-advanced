import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';
const next = 'node_modules/next/dist/bin/next';
execFileSync(process.execPath, [next, 'build', 'fixtures/next', '--webpack'], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
});
const server = createServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
await new Promise((resolve) => server.close(resolve));
const child = spawn(
  process.execPath,
  [
    next,
    'start',
    'fixtures/next',
    '--port',
    String(port),
    '--hostname',
    '127.0.0.1',
  ],
  { stdio: 'pipe', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } },
);
try {
  let html;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}`);
      if (response.ok) {
        html = await response.text();
        break;
      }
    } catch {
      /* Wait for server. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(
    html?.includes('Jane SSR'),
    'Next.js did not render the table on the server',
  );
  console.log('Next.js production build and HTTP SSR passed.');
} finally {
  child.kill('SIGTERM');
}
