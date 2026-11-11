# Styling, CSP and portals

## Entry points

`rc-table-advanced` injects a complete stylesheet once on module evaluation in a browser. This includes table and calendar customization styles. Server imports do not touch the DOM.

For explicit CSS, import components from `rc-table-advanced/core` and import `rc-table-advanced/styles.css` in your application's stylesheet entry. The core entry does not inject this package's own stylesheet. Do not combine both approaches unless you intentionally want duplicate styles.

For nonce-based delivery of this package's own CSS, import `injectStyles` from the core entry and call `injectStyles({ nonce })` on the client before mounting. Use the nonce supplied by your application. Calling it again does not replace an existing stylesheet. The default entry injects too early to receive a nonce; use core instead.

## Upstream CSP limitation

`react-multi-date-picker` injects its base styles on module import without a nonce. The core entry and `injectStyles({ nonce })` only control rc-table-advanced's own CSS; they do not disable or authorize that upstream injection. A strict `style-src` policy is not fully supported out of the box. Validate an approved upstream integration against your policy before deploying calendar filters. No claim of full CSP compatibility is made for this release candidate.

## Customization

Use `className` for the outer table wrapper and `classNames` for named regions. Default classes are retained. Custom CSS follows the usual cascade: specificity, order, cascade layers and upstream `!important` rules still apply. No blanket override guarantee is made.

```css
.orders-table {
  --rcta-color-primary: #0f766e;
  --rcta-color-primary-soft: #f0fdfa;
  --rcta-color-text: #172033;
  --rcta-radius-md: 0.5rem;
}
.orders-table .rc-table-cell {
  padding: 0.75rem 1rem;
}
```

Tokens include text/muted/border/border-hover/primary/primary-soft/surface/surface-muted colors, sm/md/lg radii, shadows and `--rcta-z-dropdown`. Some default table/calendar styles have literal colors; overriding only tokens is not a complete dark-mode theme.

## Portals

Modal, drawer and dropdown overlays render into `document.body`. AdvancedTable carries scoped `--rcta-*` tokens into its dialogs; dropdowns copy tokens from their trigger. Ancestor CSS selectors cannot cross a portal. Use `classNames.modalPanel`, `classNames.drawerPanel` and global scoped overlay classes for non-token styling.

Standalone modal/drawer primitives accept `style` for theme variables. Standalone `Dropdown` accepts `portalContainer`; choose an overlay container without transforms that would alter fixed positioning. Body is the default. Each app must reconcile overlay z-index with its own design system.

## Slots

`slots.empty`, `slots.loading`, `slots.footer` and `slots.renderPagination` replace their corresponding regions. Custom pagination receives the pagination config plus `onPageChange` and `onPageSizeChange` handlers. Validation cells support their own `renderErrorCell` / `renderValue` props. `slots.renderErrorCell` provides a table-wide renderer for TableCell children; an explicit cell renderer takes precedence.
