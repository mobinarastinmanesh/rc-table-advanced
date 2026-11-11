# Contributing and release checks

Use Node 20.19+ and npm. Run `npm ci` in the root and `npm ci --prefix example` for the demo. Then:

```sh
npm run lint
npm test
npm run coverage:check
npm run test:package
npm run build:docs
npm run test:next
npx playwright install chromium
npm run test:browser
```

`npm run check` runs lint, unit/DOM tests, consumer checks, docs build, Next.js checks and browser tests. Install Chromium once before running it. Source tests run first with coverage gates and regenerate the coverage documentation. Integration tests then build and exercise the actual JavaScript output. Package checks create a tarball in a temporary directory, install it in an isolated consumer, render via ESM and CJS, resolve the public CSS export, and compile consumer code in both TypeScript resolution modes. No publishing occurs.

The standalone consumer installer prefers the npm cache and may read the public registry for missing metadata. For a fully populated cache, set `RCTA_CONSUMER_OFFLINE=1`. For a custom cache set npm_config_cache consistently for install and check.

CI runs checks for React 18 and 19 and uploads the HTML/LCOV/Cobertura coverage reports even when a test fails. Generated coverage snapshots must match the committed documentation; regenerate them before committing code or test changes. Keep the lockfiles committed and check both development and production dependency audits after upgrades. Avoid automatic major upgrades without checking engines and API compatibility.

## Release preparation

Keep the release candidate local until review is complete. Review CHANGELOG and migration notes, run checks on a clean checkout, inspect `npm pack --dry-run`, and test the tarball in an application. Only a maintainer's separate explicit publishing action should upload a package or deploy Pages. No workflow in this checkout publishes or deploys.

The package's prepublishOnly hook runs the full checks. A real release also needs working registry authentication and an explicitly chosen dist-tag; neither is changed by preparing this checkout.

## Signed commits

Maintainer commits for this release must be cryptographically signed. Configure your own approved SSH/GPG signing key, keep signing enabled, create commits with `git commit -S`, and verify each one with `git verify-commit HEAD`. A `Signed-off-by` line is not a cryptographic signature. Never commit private keys or registry configuration. GitHub's Verified label additionally requires the corresponding public key to be registered there as a signing key; local verification alone cannot establish that registration.
