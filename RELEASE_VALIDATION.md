# Release validation — 2026-11-11

The maintainer authorized rc.1 publication, public-registry revalidation, and stable 2.0.0 publication only after successful checks.

## Public npm rc.1: all gates passed

- Version `2.0.0-rc.1` published to `next`; `latest` was kept on v1 until stable acceptance completed.
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

## Public stable 2.0.0: all gates passed

- Published to npm `latest`; `next` remains `2.0.0-rc.1` as the candidate channel. Default installation is `npm install rc-table-advanced`.
- Signed source/tag target: `33c34c002b742c1894e863d989ecd3e72d241ce3`.
- Integrity: `sha512-8JxSNugTd2VE7Xx3i2JnIOFDoHDcy4gFa5zDIy2uO3UMQUjA1KdtoMoWE8+Kg+1Gu7aMQLp9OlPH7S0iqfSi1g==`.
- Shasum: `a0a92d0c622aaeb360a7ca6a451365efd9b72f3c`.
- The complete local `npm run check` passed for 2.0.0. [Stable branch CI](https://github.com/mobinarastinmanesh/rc-table-advanced/actions/runs/43039411513) and [main CI](https://github.com/mobinarastinmanesh/rc-table-advanced/actions/runs/43039765475) passed on both React runtimes.
- Downloaded the published stable package into the independent consumer and verified its registry lockfile, integrity and all 11 distribution-file hashes. Runtime/type/CSS output is byte-identical to accepted public rc.1.
- Public stable ESM/CommonJS SSR, CSS/core exports, strict NodeNext types and documentation examples passed with React 18.3.1 and 19.2.4 in isolated consumers.
- Rebuilt both independent production frameworks with stable installed and a cleared Next cache. **27/27 browser executions passed again**, with no failed, skipped or flaky cases; migration assertions also passed.
- Signed Pages commit `5059ef80f0d3cb146b75eae7451bcb3972b9c0db` deployed successfully. Public getting-started HTML shows `2.0.0 · stable` and the default install command; public coverage JSON reports version 2.0.0, 76 source tests and 99.04% lines.
- [Stable GitHub release](https://github.com/mobinarastinmanesh/rc-table-advanced/releases/tag/v2.0.0) and [rc.1 release](https://github.com/mobinarastinmanesh/rc-table-advanced/releases/tag/v2.0.0-rc.1) include the exact npm tarballs. Every new source/documentation commit and release tag is SSH-signed with the maintainer-approved ED25519 key.
- Final local evidence/harness archive: `artifacts/stable-public-validation-2026-11-11.tgz`. No npm configuration, auth logs, credentials, installed dependencies or framework caches are included.

The npm web authorization was completed by the maintainer. The CLI initially continued receiving HTTP 202 until npm delivered the authorization; publication was accepted afterward. Both versions were verified through the public registry after asynchronous processing, not merely from CLI success messages.

Source coverage: 76 tests per React runtime; 99.04% lines, 95.12% branches, 97.83% functions and 98.52% statements. Browser counts are separate from source coverage.

The API acceptance scenario uses intercepted 503/success/delayed responses, not a production backend. The upstream calendar's strict-CSP nonce limitation remains documented. Real-device/assistive-technology audits and arbitrary v1 application upgrades were not certified by this run.

See `RC_VALIDATION.md` for the original WebKit defect reproduction and local-fix evidence.
