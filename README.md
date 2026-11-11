# rc-table-advanced

[![npm version](https://img.shields.io/npm/v/rc-table-advanced.svg)](https://www.npmjs.com/package/rc-table-advanced) [![Package checks](https://github.com/mobinarastinmanesh/rc-table-advanced/actions/workflows/check.yml/badge.svg)](https://github.com/mobinarastinmanesh/rc-table-advanced/actions/workflows/check.yml) [![MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

React tables for admin apps: schema-driven filters, pagination controls, RTL and Persian, Gregorian and Hijri date pickers, built on [rc-table](https://github.com/react-component/table).

[Live demo & documentation](https://mobinarastinmanesh.github.io/rc-table-advanced/) · [API](docs/api.md) · [Migration to v2](docs/migration.md) · [Changelog](CHANGELOG.md)

> **2.0.0-rc.1 is a release candidate** available through the `next` channel. Read the migration guide before upgrading from v1.

## Install

```sh
npm install rc-table-advanced@next
```

React and React DOM 18 or 19 are peer dependencies. Node 20.19+ is required for development and the package's declared runtime support. See the migration guide before adopting v2.

## Working client-side example

The table renders the rows you supply. **Your application performs filtering, sorting and slicing, or requests a page from an API.** Changing a filter alone does not transform `data`.

```tsx
import { useState } from 'react';
import {
  AdvancedTable,
  FilterType,
  type AdvancedTableChange,
  type TableColumnType,
} from 'rc-table-advanced';

type Row = { id: number; name: string; status: string };
type Filters = { query?: string; status?: string; sort?: string };
const rows: Row[] = [
  { id: 1, name: 'Jane', status: 'paid' },
  { id: 2, name: 'Sara', status: 'draft' },
];
const columns: TableColumnType<Row>[] = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Status', dataIndex: 'status' },
];

export function Orders() {
  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const filtered = rows
    .filter(
      (row) =>
        !filters.query ||
        row.name.toLowerCase().includes(filters.query.toLowerCase()),
    )
    .filter((row) => !filters.status || row.status === filters.status)
    .sort((a, b) => (filters.sort === 'oldest' ? a.id - b.id : b.id - a.id));
  const start = (pagination.page - 1) * pagination.pageSize;
  const handleChange = (change: AdvancedTableChange<Filters>) => {
    setFilters(change.filters);
    setPagination(change.pagination);
  };
  return (
    <AdvancedTable<Row, Filters>
      rowKey="id"
      columns={columns}
      data={filtered.slice(start, start + pagination.pageSize)}
      filters={filters}
      pagination={{ ...pagination, total: filtered.length }}
      onChange={handleChange}
      onFiltersChange={setFilters}
      searchTrigger="debounced"
      showSizeChanger
      filterModalSchema={[
        {
          key: 'status',
          label: 'Status',
          type: FilterType.SINGLE_SELECT,
          options: [
            { value: 'paid', label: 'Paid' },
            { value: 'draft', label: 'Draft' },
          ],
        },
      ]}
    />
  );
}
```

This example uses the default live filter mode. For submit mode, keep draft filters in `onFiltersChange` and fetch/filter only from `onChange`: [state and server-side guide](docs/state-and-server.md).

## Included

- Inline search, configurable sort, modal and grouped drawer filters, applied chips.
- Select, multiple select, badge, amount range, date, date range and custom filters.
- Controlled or internal filters, scoped shareable URLs, controlled pagination.
- Localized labels and RTL/LTR layout; Gregorian date-only values with independent display calendars.
- Validation-aware cells, custom pagination/empty/loading/footer slots.
- Default styling, CSS variables and per-region classes. These are styled components, not a fully headless grid.

## Styling and CSP

The default entry injects one complete stylesheet on import. To load this package’s stylesheet explicitly (useful for SSR and controlling style delivery), use:

```tsx
import { AdvancedTable } from 'rc-table-advanced/core';
import 'rc-table-advanced/styles.css';
```

Alternatively call `injectStyles({ nonce })` from the core entry on the client. The upstream date picker separately injects base CSS without a nonce; this is not a complete strict-CSP solution. See [styling and CSP limitations](docs/styling.md).

## Guides

- [Getting started](docs/getting-started.md)
- [State, pagination and server requests](docs/state-and-server.md)
- [Filters and validation](docs/filters.md)
- [URL state and multiple tables](docs/url-state.md)
- [Calendars, localization and RTL](docs/calendars.md)
- [Styling and portals](docs/styling.md)
- [SSR and Next.js](docs/ssr.md)
- [API reference](docs/api.md)
- [Migration from v1](docs/migration.md)
- [Testing and measured coverage](docs/testing.md)
- [Adoption and release plan](docs/adoption.md)
- [Contributing and release checks](docs/contributing.md)

## Scope

No built-in data fetching, automatic client-side processing, spreadsheet editing or virtualized grid is provided. `rc-table` supplies the underlying table features; this package adds the filter and pagination UI. Pagination is controlled: apply the state emitted by `onChange` to your own `pagination` prop.

## Test coverage

The source coverage gate is enforced in CI. [Testing strategy and limits](docs/testing.md) · [Machine-readable snapshot](docs/coverage-summary.json).

<!-- coverage:summary:start -->

Measured from the complete source test suite for **2.0.0-rc.1**: **76 tests** across **11 files**.

| Metric     | Covered / total | Coverage | Required |
| ---------- | --------------- | -------- | -------- |
| statements | 1004 / 1019     | 98.52%   | 95%      |
| branches   | 879 / 924       | 95.12%   | 90%      |
| functions  | 271 / 277       | 97.83%   | 95%      |
| lines      | 934 / 943       | 99.04%   | 95%      |

Source, test and toolchain fingerprint: `3762781c86d4b3af`. Demo code, declaration-only files and the CSS-only entry are excluded; runtime library code is included even when unimported.

<!-- coverage:summary:end -->

## License

[MIT](LICENSE)
