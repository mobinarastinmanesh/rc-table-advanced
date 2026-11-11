# RC acceptance validation — 2026-11-11

The published `2.0.0-rc.0` was downloaded from the public npm registry and tested in independent consumers. A reproducible WebKit keyboard-focus defect was found and fixed locally. This historical report records the initial local fix before publication. Release progress and registry revalidation are recorded in `RELEASE_VALIDATION.md`; the original rc.0 artifact remains immutable.

## Published artifact

- Registry version: `rc-table-advanced@2.0.0-rc.0` (`next`); stable `latest` was left unchanged.
- Registry integrity: `sha512-/jb3FkP/2PulTLcND8/ZP0NwBzBSYJbU/+UGPP6uJ0Arlaf6N6OZ4J59qlgQwCJTRTejXDUnVcZ4HU8IKHjOjg==`.
- Independent lockfile confirmed a registry tarball, without source aliases or a repository `file:` dependency.
- ESM and CommonJS SSR, CSS/core exports, strict NodeNext declaration checks and complete documentation examples passed with React 18.3.1 and 19.2.4.
- Explicit migration of Persian v1 date/range strings to Gregorian date-only values passed. This is targeted migration validation, not proof that an arbitrary v1 application upgrades without changes.
- Vite 8.3.8 and Next.js 16.4.6 production consumers built successfully. Next.js returned server-rendered rows and hydrated interactive controls.

## Defect and local fix

After opening Filters with the keyboard, switching the Created calendar to Jalali, and navigating with Tab, WebKit could leave focus on the document body while the modal remained open. The original implementation only intercepted Tab at the first and last controls; native WebKit button navigation could skip intermediate controls. The failure persisted with auto-waited assertions and reproduced in three consecutive runs against the original bundle.

`useDialogA11y` now explicitly moves between eligible modal/drawer controls on Tab and Shift+Tab. It respects child widgets that already prevented the key event and preserves the existing dialog-owned portal handling. Source regressions cover intermediate movement, wrapping, handled events and portal ownership; the browser regression starts from a keyboard-focused invoker and checks focus restoration.

Next's temporary build cache initially reused the original dependency bundle when a local tarball replaced the same package version. The cache was removed before accepting any patched results. The successful run used a clean production build containing the patched bundle.

Local test tarball integrity: `sha512-QfiHxL/HRoyqaNT7XULSi6V+COvaQGcGB5tPitZ9Sqc1y4sdghMOwcqXKQzpW78Tj/YVgnho/GOG7XnRDgA2Kg==`. This is an unpublished test artifact, distinct from the registry artifact above; its package version has not been bumped.

## Final validation of the local fix

| Check                                                                 | Result                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------ |
| Source suite with React 18.3.1                                        | 76 passed; no skipped tests                            |
| Source suite with React 19.2.4                                        | 76 passed; no skipped tests                            |
| Compiled-output/report-tooling suite                                  | 23 passed on each React runtime                        |
| Isolated local tarball SSR, exports, types and documentation examples | Passed with React 19.2.4                               |
| Independent browser acceptance                                        | 24/24 passed: eight scenarios on each of three engines |
| Actual calendar day selection and canonical value persistence         | 3/3 passed: one scenario on each engine                |
| Reproduced WebKit focus scenario after the fix                        | 3/3 consecutive runs passed                            |
| Repository Chromium demo/docs/Next suite                              | 6/6 passed                                             |
| Production documentation and Next HTTP SSR                            | Passed                                                 |
| ESLint, TypeScript, changed-file formatting and coverage freshness    | Passed                                                 |

The independent scenarios cover English filtering/pagination, RTL drawers, mobile viewport bounds and close controls, three-calendar display switching, canonical date selection, namespaced URL state for two tables, preservation of typed strings/unrelated duplicate parameters/hash, reload, legacy v1-link clearing, SSR/hydration, keyboard focus, and the documented server example's 503/retry/empty-results/stale-response cancellation behavior.

The API responses were intercepted in the browser; no real production backend was exercised. An initial Firefox API test timed out; its isolated rerun and the final complete run passed. Browser installation/protocol mismatches were corrected in the harness and are not counted as package defects. No failed scenario was skipped to obtain the final result.

Actual tested engines: Chromium **140.0.7339.16**, Firefox **141.0**, WebKit **26.0**, driven by an isolated Playwright 1.55.1 runner matching the installed Firefox/WebKit builds. WebKit testing does not establish compatibility with every Safari version or iOS device.

Updated first-party source coverage: **99.04% lines**, **95.12% branches**, **97.83% functions**, **98.52% statements**. The original published RC retains its original 75-test/99.05%-line snapshot. Browser acceptance checks are separate from the source percentage.

## Evidence and reproduction

Local evidence and the independent harness are archived at `artifacts/rc-validation-2026-11-11.tgz` (ignored generated artifact). The archive includes exact dependency lockfiles, explicit registry-consumer checks, independent demo/Next fixtures, migration assertions, browser tests, original failure JSON, passing result JSON, browser versions and mobile screenshots. It contains no npm credentials or `.npmrc`.

Extract the archive into a new directory, run `npm ci --ignore-scripts`, then `npx playwright install`. Build with `node node_modules/vite/bin/vite.js build demo --config demo/vite.config.mjs` and `NEXT_TELEMETRY_DISABLED=1 node node_modules/next/dist/bin/next build next --webpack`, then run `npx playwright test`. The archived package/lockfile selects the included patched tarball. To reproduce the released RC defect, install `rc-table-advanced@2.0.0-rc.0` from the public registry, remove `next/.next`, rebuild, and run the WebKit focus scenario. Browser executable overrides are optional environment variables in the archived config.

Repository checks remain available through `npm run lint`, `npm test`, `npm run test:react18`, `npm run test:package`, `npm run build:docs`, `npm run test:next` and `npm run test:browser`. Use a writable npm cache if the host default cache has permission problems.

Strict CSP support remains limited by the upstream date picker's nonce-less CSS. Large-dataset performance, assistive-technology audits, real-device testing and arbitrary consumer CSS/backend/router integrations were not certified by this run.
