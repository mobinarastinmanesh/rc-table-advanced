# Release validation — 2026-11-11

The maintainer authorized rc.1 publication, public-registry revalidation, and stable 2.0.0 publication only after successful checks.

## Public npm rc.1: all gates passed

- Version `2.0.0-rc.1` published to `next`; `latest` remains on v1 during stable preparation.
- Signed source/tag target: `4bf3903695a88053265fe5f4885fad52d705bd82`.
- Integrity: `sha512-vVJ1JnGQvh4ns40qAxipeGhAXo4sOAdUzro35ibLhTskslu5ZIBtzEMcaQKxCM6W53WSRzqMY6FnEB/yXXgjzg==`.
- Registry lockfile and all 11 distributed file hashes matched the released artifact; no source aliases or local tarball dependency were used.
- ESM/CommonJS SSR, CSS/core exports, strict NodeNext types and documentation examples passed with React 18.3.1 and 19.2.4 in separate consumers.
- Independent Vite 8.3.8 and Next.js 16.4.6 production builds passed; HTTP SSR, hydration and interactive behavior were tested.
- **27/27 browser acceptance executions passed**, with zero failed, skipped or flaky cases: nine scenarios on each of Chromium 140.0.7339.16, Firefox 141.0 and WebKit 26.0.
- Explicit Persian v1 date/range migration, all-calendar canonical round-trips and structured URL serialization passed.
- [Branch CI](https://github.com/mobinarastinmanesh/rc-table-advanced/actions/runs/43037834195) and [main CI](https://github.com/mobinarastinmanesh/rc-table-advanced/actions/runs/43038163747) passed for both React runtimes.
- Evidence/harness archive: `artifacts/rc1-public-validation-2026-11-11.tgz` (local generated artifact).

The initial CI runner stalled resolving Ubuntu package-mirror DNS during browser dependency installation. CI now pins Ubuntu 24.04 and executes its preinstalled Chrome, preserving all browser tests while removing the unnecessary apt/CDN setup dependency. No runtime package code changed for this CI fix.

## Stable preparation

The public rc.1 acceptance gate passed before preparing 2.0.0. Stable metadata, installation guidance and changelog are updated. The complete local `npm run check` passed for 2.0.0, and all 11 distributed runtime/type/CSS files exactly match the validated public rc.1 manifest. Stable CI, publication and public npm revalidation remain pending in this snapshot.

Source coverage: 76 tests per React runtime; 99.04% lines, 95.12% branches, 97.83% functions and 98.52% statements. Browser counts are separate from source coverage.

The API acceptance scenario uses intercepted 503/success/delayed responses, not a production backend. The upstream calendar's strict-CSP nonce limitation remains documented. Real-device/assistive-technology audits and arbitrary v1 application upgrades were not certified by this run.

See `RC_VALIDATION.md` for the original WebKit defect reproduction and local-fix evidence.
