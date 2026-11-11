export const coveragePolicy = {
  include: ['src/**/*.{ts,tsx}'],
  exclude: ['src/**/*.d.ts', 'src/demo/**', 'src/css.ts'],
  minimumPerFile: { statements: 90, branches: 80, functions: 80, lines: 90 },
  thresholds: { statements: 95, branches: 90, functions: 95, lines: 95 },
};
