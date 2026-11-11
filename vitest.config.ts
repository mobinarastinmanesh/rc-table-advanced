import { defineConfig } from 'vitest/config';
import { coveragePolicy } from './scripts/coverage-policy.mjs';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.mjs'],
    environment: 'node',
    globals: false,
    css: true,
    restoreMocks: true,
    reporters: ['default', 'json', './scripts/coverage-provenance.mjs'],
    outputFile: { json: 'coverage/test-results.json' },
    coverage: {
      provider: 'v8',
      include: coveragePolicy.include,
      exclude: coveragePolicy.exclude,
      reporter: ['text', 'html', 'json', 'json-summary', 'lcov', 'cobertura'],
      reportsDirectory: 'coverage',
      reportOnFailure: true,
      thresholds: coveragePolicy.thresholds,
    },
  },
});
