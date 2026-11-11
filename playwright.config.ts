import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  use: {
    baseURL: 'http://127.0.0.1:4173/rc-table-advanced/',
    browserName: 'chromium',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
  },
  webServer: [
    {
      command:
        'node node_modules/vite/bin/vite.js preview --config example/vite.config.ts --outDir example/dist --base /rc-table-advanced/ --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173/rc-table-advanced/',
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'env NEXT_TELEMETRY_DISABLED=1 node node_modules/next/dist/bin/next start fixtures/next --hostname 127.0.0.1 --port 4174',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
