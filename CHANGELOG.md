# Changelog

User-visible changes are recorded here. Version numbers follow semantic versioning. Unreleased entries describe the working candidate, not an npm publication.

## [Unreleased]

No changes recorded.

## [2.0.0-rc.1] — 2026-11-11

Pre-release channel: `next`. Fixes the WebKit keyboard regression found during independent RC acceptance testing.

### Fixed

- Keep modal and drawer Tab navigation inside their controls in WebKit, including after calendar switching. Cycle focus explicitly rather than relying on native button tabbing, while respecting child widgets that handle Tab and dialog-owned portals.

### Tests

- Add regression coverage for intermediate forward/reverse Tab movement and child-widget/portal ownership. Verify the published RC in independent npm consumers and reproduce the WebKit issue before testing the local fix.

## [2.0.0-rc.0] — 2026-11-11

Pre-release channel: `next`. Review the migration guide before upgrading.

### Breaking changes

- Date filters emit Gregorian date-only strings (`YYYY-MM-DD`) independently of the visible calendar; `format` controls display. Existing stored dates require an explicit migration from their original calendar.
- New URL state uses a versioned JSON encoding and scoped `rcta_` parameter names. Legacy links remain readable on mount; namespaced version metadata prevents cleared legacy values from reactivating after reload.
- Applying filters, sort or reset emits page 1 by default. Set `resetPageOnFilterChange={false}` to retain the previous page deliberately.
- Public package exports replace direct `dist/*` imports. Node support is now 20.19+.

### Added

- Source test suite with V8 coverage, global thresholds, per-file floors, property-based serialization tests and reproducible coverage documentation.
- HTML, LCOV, Cobertura and normalized JSON coverage reports, with CI artifacts and a full report in the documentation build.
- Configurable sort options, typed filter schema keys and explicit change reasons.
- Core entry and explicit stylesheet export; manual injection accepts a nonce for the package's own styles.
- Complete API, client/server examples, testing strategy, migration guide and static documentation with metadata and sitemap.

### Fixed

- CommonJS entry extension, native Node SSR interop and consumer declaration compatibility.
- Controlled filter/URL synchronization, unrelated query/hash/history-state preservation and stale writes after navigation.
- Loss of numeric-looking strings, commas and booleans in new serialized values.
- Duplicate DateObject identity between conversion helpers and the upstream picker, which could render a valid initial date as blank.
- Date/calendar switching, missing schema defaults, empty-filter counts, drawer chip labels, validation and helper text.
- Value-only validation cells, table-wide error rendering, standalone table classes and RTL propagation.
- Search labels, badge pressed state, dropdown keyboard behavior, dialog focus restoration and hidden drawer controls.
- Calendar customization CSS delivery and scoped theme tokens across portals.

### Security and tooling

- Upgrade build/test dependencies and pin the compatible minimatch override for the development-tool chain.
- Release checks build and test the real tarball, strict TypeScript consumers, React 18/19, Next.js SSR/hydration and Chromium workflows.
- CI has read-only repository permissions and does not publish packages or deploy Pages.

### Known limitations

- The upstream date picker still injects base CSS without a nonce; the core entry is not a complete strict-CSP solution.
- Data fetching, processing and pagination state remain the application's responsibility.
- Source coverage does not certify all browser engines, assistive technologies or application integrations.

Read the [v2 migration guide](docs/migration.md) before upgrading.

## [1.0.0]

The published stable baseline for this candidate: React table/filter/pagination components, multi-calendar date filters, RTL and localized labels. This changelog does not reconstruct unpublished historical release notes.

[Unreleased]: https://github.com/mobinarastinmanesh/rc-table-advanced/compare/v2.0.0-rc.0...HEAD
[2.0.0-rc.0]: https://github.com/mobinarastinmanesh/rc-table-advanced/compare/v1.0.0...v2.0.0-rc.0
[1.0.0]: https://www.npmjs.com/package/rc-table-advanced/v/1.0.0
