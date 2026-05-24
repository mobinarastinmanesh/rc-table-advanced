# rc-table-advanced

[![npm version](https://img.shields.io/npm/v/rc-table-advanced.svg)](https://www.npmjs.com/package/rc-table-advanced)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live demo](https://img.shields.io/badge/demo-live-2563eb)](https://mobinarastinmanesh.github.io/rc-table-advanced/)

**Typed React advanced table** built on [rc-table](https://www.npmjs.com/package/rc-table) — filters, pagination, validation cells, drawer & modal filters, multi-calendar date pickers, and a ready-to-use `AdvancedTable` component.

🔗 **[Live demo](https://mobinarastinmanesh.github.io/rc-table-advanced/)** · [npm](https://www.npmjs.com/package/rc-table-advanced) · [GitHub](https://github.com/mobinarastinmanesh/rc-table-advanced) · [Issues](https://github.com/mobinarastinmanesh/rc-table-advanced/issues)

---

## Why rc-table-advanced?

Most React table libraries give you either a **heavy UI kit table** (hard to restyle) or a **headless hook** (you rebuild filters, pagination, and modals yourself). **rc-table-advanced** sits in the middle: a **complete admin-style data table** out of the box, but **not locked to one design system** — you bring your own CSS classes and your own language strings.

Works with **React 18+** and **React 19**. Styles are **auto-injected on import** — no extra CSS file to wire up.

---

## What sets it apart

### All-in-one, still composable

| | |
|---|---|
| **`AdvancedTable`** | Table + search/sort bar + filter chips + modal filters + drawer filters + pagination in one component |
| **Low-level exports** | Use `Table`, `Filters`, `FilterModal`, `DrawerFilter`, and filter field primitives separately when you need finer control |
| **Built on rc-table** | Lightweight, proven table core — not a from-scratch grid engine |

### Declarative filter schema

Define filters as data, not as dozens of hand-wired inputs:

```tsx
filterModalSchema={[
  { key: 'status', label: 'Status', type: FilterType.SINGLE_SELECT, options: [...] },
  { key: 'tags', label: 'Tags', type: FilterType.MULTIPLE_BADGE_SELECT, options: [...] },
  { key: 'amount', label: 'Amount', type: FilterType.AMOUNT_RANGE },
  { key: 'createdAt', label: 'Date', type: FilterType.DATE_PICKER, calendarSystems: ['jalali', 'miladi', 'ghamari'] },
]}
```

Supported filter types:

- `SINGLE_SELECT` / `MULTIPLE_SELECT` — custom styled dropdowns (not native `<select>`)
- `SINGLE_BADGE_SELECT` / `MULTIPLE_BADGE_SELECT` — chip / badge toggles
- `AMOUNT_RANGE` — min / max number inputs
- `DATE_PICKER` / `DATE_RANGE_PICKER` — calendar pickers with optional multi-calendar switcher

**Modal filters** for complex forms. **Drawer filters** with accordion groups for large filter sets. **Inline filter bar** with search, sort, applied-filter chips, and clear-all.

### Multi-calendar date filters (Jalali · Miladi · Qamari)

Date filters support **three calendar systems in one picker**:

| System | Also known as |
|--------|----------------|
| **Jalali** | Shamsi / Persian / شمسی |
| **Gregorian** | Miladi / میلادی |
| **Hijri** | Qamari / Islamic / قمری |

Set `calendarSystems` on the schema so users can switch calendars inside the filter UI — useful for Persian, Arabic, and international apps where most table libraries only ship a Gregorian picker:

```tsx
{
  key: 'createdAt',
  label: 'Date',
  type: FilterType.DATE_PICKER,
  calendarSystems: ['jalali', 'miladi', 'ghamari'],
}
```

Calendar names in the UI are customizable via `labels.calendarJalali`, `labels.calendarMiladi`, and `labels.calendarGhamari`.

### Custom styling — your classes, not our theme

No bundled “theme” to fight against. Pass **`className`** (root) and **`classNames`** (per region) and style with your own CSS — Tailwind, CSS modules, a design system, anything:

```tsx
<AdvancedTable
  classNames={{
    filterWrapper: 'my-filter',
    filterBar: 'my-filter__toolbar',
    filterChips: 'my-filter__chips',
    tableWrapper: 'my-table',
    pagination: 'my-pagination',
    modalPanel: 'my-modal',
    drawerPanel: 'my-drawer',
  }}
  {...props}
/>
```

Regions you can target: filter bar, search input, chips, table wrapper, loading overlay, pagination, modal (overlay / panel / header / body / footer), drawer (overlay / panel / accordion sections), and more. See `AdvancedTableClassNames` in TypeScript.

Built-in `rcta-*` classes always remain for structure; yours are merged on top.

### Custom labels (i18n) — every fixed string is overridable

Ship in any language without forking components. The **`labels`** prop accepts partial overrides merged with English defaults:

```tsx
<AdvancedTable
  labels={{
    search: 'جستجو',
    filtersButton: 'فیلترها',
    drawerFiltersButton: 'فیلتر کشویی',
    appliedFiltersLabel: 'فیلترهای اعمال‌شده',
    drawerSelectedCount: (count) => `${count} مورد انتخاب شده`,
    modalApply: 'اعمال فیلتر',
    paginationPrevious: 'قبلی',
    paginationNext: 'بعدی',
    calendarJalali: 'شمسی',
    calendarMiladi: 'میلادی',
    calendarGhamari: 'قمری',
  }}
  {...props}
/>
```

Covers search, sort, filter buttons, modal/drawer actions, pagination, select placeholders, amount min/max, loading text, and calendar names. Function labels (e.g. selected count, page info) support dynamic copy. See `AdvancedTableLabels` for the full list.

Use `LabelsProvider` when composing `Filters` / `FilterModal` / `DrawerFilter` outside `AdvancedTable`.

### Direction (RTL / LTR)

Set layout direction with the `dir` prop — filters, table, pagination, modal, drawer, and portaled dropdowns follow it:

```tsx
<AdvancedTable
  dir="rtl"
  labels={{ search: 'جستجو', filtersButton: 'فیلترها', /* … */ }}
  {...props}
/>
```

Default is `ltr`. Use `dir="rtl"` for Persian, Arabic, and other right-to-left UIs.

### Drawer placement

Control which edge the filter drawer opens from with `drawerPlacement`:

```tsx
<AdvancedTable
  dir="rtl"
  drawerPlacement="right" // default for rtl is "left"
  drawerFilterGroups={[/* … */]}
  {...props}
/>
```

| Value | Behavior |
|-------|----------|
| `'left'` | Panel slides in from the left |
| `'right'` | Panel slides in from the right |
| *(omit)* | `'right'` when `dir="ltr"`, `'left'` when `dir="rtl"` |

Works on `AdvancedTable` and standalone `DrawerFilter` via the `placement` prop.

### Validation-aware cells

Row-level validation UX built in — show valid values normally and invalid values with an error state and message:

```tsx
{ id: 1, name: { value: 'Jane', isValid: true }, status: 'paid' }
{ id: 2, name: { value: 'Invalid', isValid: false, message: 'Name is required' }, status: 'draft' }

// column render:
render: (value) => <TableCell value={value} />
```

`TableCell` and `ErrorCell` handle the display; customize error rendering via `slots.renderErrorCell`.

### Filter UX details

- **Real-time search** (`realTimeSearch`) or search on Enter
- **Applied filter chips** — one-click remove per filter, plus clear all
- **Filter modes** — apply on every change (`FilterMode.ON_CHANGE`) or on submit (`FilterMode.ON_SUBMIT`)
- **Controlled or uncontrolled filters** — `filters` + `onFiltersChange`, or let the table manage state
- **URL sync** (`syncFiltersWithUrl`) — shareable/bookmarkable filter state via query string
- **Sort bar** with custom dropdown
- **Pagination** with previous/next, page info, and optional page-size changer

### TypeScript-first

Generics flow through rows, columns, and filter state:

```tsx
AdvancedTable<Row, MyFilters>
```

Filter keys, schema types, pagination state, and change payloads are typed end-to-end — fewer `any`s than ad-hoc filter UIs.

### Polished UI primitives

- **Portal dropdowns** with keyboard navigation and click-outside close (sort, page size, filter selects)
- **Accessible modal & drawer** (focus trap, backdrop, ARIA)
- **Drawer accordion** — group filters by section with per-section clear
- **Slots** — override empty state, loading, footer, pagination, and error cells

### Zero-config styling

Import the package and go — `rc-table` base styles and package CSS are bundled and injected automatically. Peer deps are only `react` and `react-dom`.

---

## Install

```bash
npm install rc-table-advanced
```

Peer dependencies: `react`, `react-dom` (≥ 18).

---

## Quick start

```tsx
import {
  AdvancedTable,
  FilterType,
  TableCell,
  type TableColumnType,
  type TableFieldValue,
} from 'rc-table-advanced';

type Row = {
  id: number;
  name: TableFieldValue<string>;
  status: string;
};

const columns: TableColumnType<Row>[] = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (value) => <TableCell value={value} />,
  },
  { title: 'Status', dataIndex: 'status', key: 'status' },
];

export function OrdersTable() {
  return (
    <AdvancedTable<Row>
      rowKey="id"
      columns={columns}
      data={[
        { id: 1, name: { value: 'Jane', isValid: true }, status: 'paid' },
        {
          id: 2,
          name: { value: 'Invalid', isValid: false, message: 'Name is required' },
          status: 'draft',
        },
      ]}
      filterModalSchema={[
        {
          key: 'status',
          label: 'Status',
          type: FilterType.SINGLE_SELECT,
          options: [
            { label: 'Paid', value: 'paid' },
            { label: 'Draft', value: 'draft' },
          ],
        },
      ]}
      pagination={{ page: 1, pageSize: 10, total: 2 }}
      showSizeChanger
      onChange={({ filters, pagination }) => {
        console.log(filters, pagination);
      }}
    />
  );
}
```

---

## Main exports

| Export | Description |
|--------|-------------|
| `AdvancedTable` | Table + filter bar + drawer/modal filters + pagination |
| `Table` | Core table wrapper around `rc-table` |
| `TableCell` / `ErrorCell` | Validation-aware cell rendering |
| `Filters`, `DrawerFilter`, `FilterModal` | Filter UI primitives |
| `FilterType`, `FilterMode` | Schema types and filter apply modes |
| `Dropdown` | Styled select used in filters, sort, and pagination |
| `useQueryControl`, `serialize`, `deserialize` | URL/query sync helpers |
| `LabelsProvider`, `useTableLabels`, `mergeLabels`, `DEFAULT_LABELS` | i18n / custom copy |
| `AdvancedTableClassNames`, `AdvancedTableLabels` | Styling and label TypeScript types |

See TypeScript types in the package for full props (`AdvancedTableProps`, `FilterSchema`, `PaginationConfig`, …).

---

## Custom styling (reference)

```tsx
<AdvancedTable
  className="my-page"
  classNames={{
    root: 'my-page',
    filterWrapper: 'my-filter',
    filterBar: 'my-filter__toolbar',
    filterSearch: 'my-filter__search',
    filterChips: 'my-filter__chips',
    tableWrapper: 'my-table',
    tableLoading: 'my-table__loading',
    pagination: 'my-pagination',
    modalOverlay: 'my-modal-overlay',
    modalPanel: 'my-modal',
    modalHeader: 'my-modal__header',
    modalBody: 'my-modal__body',
    modalFooter: 'my-modal__footer',
    drawer: 'my-drawer',
    drawerOverlay: 'my-drawer-overlay',
    drawerPanel: 'my-drawer__panel',
    drawerHeader: 'my-drawer__header',
    drawerBody: 'my-drawer__body',
    drawerFooter: 'my-drawer__footer',
    drawerAccordion: 'my-drawer__section',
  }}
  {...props}
/>
```

| Key | DOM region |
|-----|------------|
| `filterWrapper` | Filter block |
| `filterBar` | Search / sort / filter buttons row |
| `filterChips` | Applied filter chips |
| `tableWrapper` | Table + pagination block |
| `modalPanel` | Filter modal card |
| `drawerPanel` | Filter drawer panel |
| `drawerAccordion` | Drawer filter section |
| … | See `AdvancedTableClassNames` in TypeScript |

---

## Custom labels (reference)

See the [Custom labels (i18n)](#custom-labels-i18n--every-fixed-string-is-overridable) section above for the full rationale and example. All keys live on `AdvancedTableLabels`.

---

## Filter types (reference)

| Type | Use case |
|------|----------|
| `SINGLE_SELECT` | One value from a dropdown |
| `MULTIPLE_SELECT` | Multiple values from a multi-select dropdown |
| `SINGLE_BADGE_SELECT` | One value from clickable chips |
| `MULTIPLE_BADGE_SELECT` | Multiple values from clickable chips |
| `AMOUNT_RANGE` | Numeric min / max range |
| `DATE_PICKER` | Single date with optional multi-calendar |
| `DATE_RANGE_PICKER` | From / to date range with optional multi-calendar |

Drawer filters reuse the same schema inside `drawerFilterGroups` — each group has a title and its own `schema` array.

---

## License

[MIT](LICENSE) © [mobinarastinmanesh](https://github.com/mobinarastinmanesh)
