# Adoption and release plan

The strongest reason to choose this library is a working React admin table with declarative modal/drawer filters, RTL and calendar-aware date input. Installation growth should follow a useful product, a reliable upgrade path and examples that solve real integration work.

## What this release can demonstrate

- Copyable client-side and abortable server-request examples, compiled in an isolated consumer.
- Measured source coverage with enforced thresholds, per-file floors and a full HTML report.
- ESM/CJS, React 18/19 and Next.js production checks, independent from the source coverage number.
- Real keyboard, RTL, mobile and calendar tests in Chromium.
- A migration guide that names date/URL breaking changes and a styling guide that discloses the upstream CSP limit.

These are verifiable claims. Do not describe the package as the fastest, most accessible or most complete table without a reproducible comparison covering the exact claim.

## Before public release

1. Test the candidate tarball in an existing application with actual server filtering and RTL/date requirements. Turn integration failures into regression tests.
2. Review the migration guide and changelog against the final behavior, then select the final version and npm dist-tag explicitly.
3. Deploy documentation and verify canonical URLs, the sitemap, source coverage report and every public example before linking a public announcement to them.
4. Publish only after the maintainer authorizes it. Release preparation and CI do not publish or deploy.

## Public launch materials to prepare

Prepare a short demo showing a complete workflow: search, open a filter drawer, switch the calendar, apply, and share the resulting URL. Explain the data contract alongside the demo so users know how to connect their own endpoint.

Lead the release notes with concrete improvements: reliable typed URL state, canonical dates, correct module entry points and the tested upgrade path. Include the tested React versions, limitations and migration link. Use the server-side guide and calendar/RTL guide as long-tail search entry points instead of repeating a list of keywords.

A live StackBlitz/CodeSandbox example can reduce trial friction, but verify that an actual working public example exists before adding its badge. Collect real application examples with permission and use those to choose the next feature rather than claiming unsupported use cases.

## Measure useful adoption

Track weekly npm downloads as one signal, alongside documentation-to-install conversion where measurable, successful first integrations, issue response time and upgrade failures. npm download counts include CI and repeated installs; they are not unique users or proof of retention.

Record a pre-release baseline, then compare weekly cohorts after the actual launch. Do not manufacture installs, automate fake downloads or promise a particular weekly installation count. Prioritize fixes reported by real adopters and keep the changelog current.

## Next product decisions

Async/searchable filter options and saved filter presets are useful candidates for admin workflows. Validate them with adopter requests and small examples before expanding into spreadsheet editing or a full virtualized grid. Keep bundle measurements tied to a reproducible command and distinguish library output from the consumer application's total bundle.
