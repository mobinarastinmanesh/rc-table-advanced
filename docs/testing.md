# Testing strategy and measured coverage

Tests are a release requirement. Source coverage, compiled-package checks and real-browser scenarios answer different questions and remain separate.

The measurements below describe this checkout, including any Unreleased changes in the changelog. For an immutable npm release, consult the coverage snapshot at its Git tag; a local fix does not change an already-published package.

## Current measured source coverage

<!-- coverage:summary:start -->

Measured from the complete source test suite for **2.0.0-rc.0**: **76 tests** across **11 files**.

| Metric     | Covered / total | Coverage | Required |
| ---------- | --------------- | -------- | -------- |
| statements | 1004 / 1019     | 98.52%   | 95%      |
| branches   | 879 / 924       | 95.12%   | 90%      |
| functions  | 271 / 277       | 97.83%   | 95%      |
| lines      | 934 / 943       | 99.04%   | 95%      |

Source, test and toolchain fingerprint: `4409148a9682008c`. Demo code, declaration-only files and the CSS-only entry are excluded; runtime library code is included even when unimported.

<!-- coverage:summary:end -->

These numbers cover first-party runtime TypeScript/TSX using Vitest and V8 with source remapping. They do not count third-party code, tests, generated bundles, CSS, declaration-only files or demonstration-only code. Re-export/type-only modules may have zero executable statements; they do not add covered lines to the total.

The [checked-in JSON snapshot](coverage-summary.json) includes a per-file breakdown. The website build includes the full [interactive HTML report](https://mobinarastinmanesh.github.io/rc-table-advanced/coverage/), including uncovered lines and branches. The same report is available in the CI coverage artifact.

## Reproduce locally

```sh
npm ci
npm run test:coverage
npm run coverage:check
```

`test:coverage` runs the complete source suite and checks 95% statements, 95% lines, 95% functions and 90% branches. Every executable file also has a floor of 90% lines/statements and 80% branches/functions, so a weak file cannot hide behind the global average. It then updates this page, the README and the normalized JSON snapshot from the actual report. A source/test/toolchain fingerprint detects stale documentation; percentages are not hand-edited. All source test files must run and no skipped or failed tests are accepted for a documentation update.

Open `coverage/index.html` for details. `coverage/lcov.info` and `coverage/cobertura-coverage.xml` support external CI tools. Reports are generated locally and uploaded by CI; raw reports are not shipped in the npm tarball.

## Test layers

| Layer                      | What it verifies                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Source unit and DOM        | Filter state, URL ownership/navigation/cancellation, validation, dialogs, keyboard/focus, pagination, custom slots, calendars and styling |
| Property-based             | 500 reproducible generated supported JSON values exercise serialization without numeric/comma type inference                              |
| Compiled output            | The actual ESM/CJS public exports, native SSR and regression contracts                                                                    |
| Isolated tarball consumers | Runtime and strict TypeScript resolution with React 18 and 19, CSS export and documentation examples                                      |
| Next.js production fixture | SSR HTML plus browser hydration and interactive filtering                                                                                 |
| Chromium browser           | English/RTL demo, mobile layout, no-JavaScript docs, calendar switching and focus containment                                             |

Calendar-wrapper unit tests substitute the upstream picker at its boundary to exercise every callback and module export shape; browser tests use the real picker. DOM tests simulate geometry only where required; real browser tests check layout-dependent behavior.

The complete source suite has also been run locally with React 18.3.1 and React 19.2.4; both passed with matching coverage totals. CI repeats both versions.

## Coverage is evidence, not a correctness guarantee

A high percentage cannot prove accessibility across all assistive technologies, all browser engines, performance on every dataset, application API behavior or full CSP compatibility. The upstream picker's nonce limitation remains documented in the styling guide. Browser and package checks are not merged into the source percentage, and a green coverage badge does not replace those checks.

New bug reports should produce a regression test before a fix. Test observable state, DOM and callbacks rather than private implementation snapshots. Do not exclude runtime files, lower thresholds or add ignore comments merely to make the gate green.
