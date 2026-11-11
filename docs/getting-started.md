# Getting started with React admin tables

Use rc-table-advanced when you need a styled table with filter controls, RTL and calendar-aware date inputs. Bring your own data processing or API.

## Install and mount

Install the package together with matching React and React DOM versions (18 or 19). In this unpublished checkout, run `npm ci`, `npm run build`, `npm ci --prefix example`, then `npm run dev`.

Define a stable `rowKey`, typed `columns`, and `data`. Data must already contain the rows to render. Start with the complete working example in the README. Use stable schema/columns references when possible.

## Choose a data workflow

For small datasets, filter and sort an array, then slice it using `(page - 1) * pageSize`. Supply the filtered count as `pagination.total`, not the original array length.

For APIs, send the filters and pagination to your endpoint and render the returned page. Never slice a server page a second time. See [state and server requests](state-and-server.md).

## Choose a state workflow

`filters` makes the filter state controlled and requires handling `onFiltersChange`. Without it, `initialFilters` initializes internal state. Pagination is always controlled. `onChange` reports the state to apply; it is not an initial-load callback.

`FilterMode.ON_CHANGE` applies edits immediately (default). `ON_SUBMIT` defers search/sort/chip edits until Apply. Modal and drawer Apply buttons always commit their drafts. Canceling a dialog discards its edits.

## Try the demo

The demo has English/LTR and Persian/RTL tables using the same library. Search, filters and pagination are connected to an in-memory dataset. Dates are stored in Gregorian `YYYY-MM-DD` even when the picker shows a Persian or Hijri calendar.

## Common mistakes

- A filter changes but rows do not: connect `onChange` to processing/fetching.
- A page button does not move: update the controlled `pagination` prop.
- SSR needs deterministic output: use the core entry and explicit CSS.
- A numeric-looking select value disappears after reading a v1 link: migrate the old link; v2 writes a typed encoding.
- Multiple tables share URL values: assign a distinct `urlPrefix` to each table.
