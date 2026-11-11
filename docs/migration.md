# Migrating from v1 to v2

This is an unpublished release candidate. Test it against your application before adopting a final release.

## Dates: migrate stored values explicitly

V1 emitted display-formatted strings in whichever calendar the user had selected. V2 emits Gregorian `YYYY-MM-DD` date-only strings. `format` now controls presentation only.

You must know the original calendar to convert old stored values. Do not infer it from the year. Parse the old string with a DateObject configured for that calendar, then call `toCanonicalDate`. Migrate both `from` and `to` in ranges. Ambiguous old values require application-specific resolution.

## URL encoding and ownership

V2 writes versioned JSON and defaults to `rcta_` parameter names. V1 unprefixed links are read on mount as a fallback, but their ambiguous numeric/comma inference cannot recover information already lost. Old date values in links also need explicit migration before use in v2 date fields.

Pass `urlFilterKeys` for custom keys and use a distinct `urlPrefix` per table. Unrelated query parameters, hashes and router history state are preserved. URL filters are applied after mount; trigger initial requests in the app rather than assuming onChange fires during mounting.

## Events and pagination

`onChange` adds `reason`. Filter, sort and reset events now emit page 1 by default. Apply every emitted pagination snapshot. Set `resetPageOnFilterChange={false}` only if your application deliberately preserves the page. `onFiltersChange` receives drafts; in submit mode process data only on `onChange`.

## Packaging and styles

Use public package exports instead of `dist/*` imports. CommonJS now uses `.cjs`. Type declarations are bundled and available for both module systems.

Default imports still auto-inject styles, now including calendar customizations. For explicit CSS/SSR use `rc-table-advanced/core` with `rc-table-advanced/styles.css`, or nonce-aware manual injection. Do not import the default entry in the nonce workflow. The upstream picker still injects base CSS without a nonce; review the strict-CSP limitation in the styling guide.

## Validation and types

`required`, `helperText`, amount bounds/order and date validity now affect dialog submission. Fix invalid defaults that used to pass through silently. Filter counts no longer count empty arrays/ranges.

`FilterSchema<T>` can constrain field keys. Avoid broad index signatures if you want key checking. React/React DOM 18 and 19 are supported; Node support is declared as 20.19+ in this release.

## Upgrade check

Run your app's typecheck and production build. Exercise controlled filters, URL navigation, modal Apply/Cancel, a date in every supported calendar, RTL, empty results, page-size changes and an API error/retry. Check custom CSS against the complete v2 stylesheet.
