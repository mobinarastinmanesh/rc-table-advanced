# rc-table-advanced

[![npm version](https://img.shields.io/npm/v/rc-table-advanced.svg)](https://www.npmjs.com/package/rc-table-advanced)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live demo](https://img.shields.io/badge/demo-live-2563eb)](https://mobinarastinmanesh.github.io/rc-table-advanced/)

**Typed React Data Table with advanced filtering, pagination, and enterprise UX features** built on top of [rc-table](https://www.npmjs.com/package/rc-table).

🔗 **[Live demo](https://mobinarastinmanesh.github.io/rc-table-advanced/)** · [npm](https://www.npmjs.com/package/rc-table-advanced) · [GitHub](https://github.com/mobinarastinmanesh/rc-table-advanced) · [Issues](https://github.com/mobinarastinmanesh/rc-table-advanced/issues)

---

## Why rc-table-advanced?

Most React table libraries fall into two extremes:

- **UI-heavy table components** that are hard to customize
- **Headless solutions** that require rebuilding filters, pagination, and modals from scratch

**rc-table-advanced** sits in the middle.

It is a **production-ready React data table** that provides advanced UX features out of the box, while staying fully **design-system agnostic**.

You bring your UI. The library handles the complexity.

Works with **React 18+** and **React 19**. Styles are **auto-injected on import** — no extra CSS file to wire up.

---

## Works with any design system

rc-table-advanced is intentionally **not tied to any UI framework**.

It integrates seamlessly with:

- Material UI (MUI)
- Ant Design
- Chakra UI
- Mantine
- Shadcn/UI
- Bootstrap
- Tailwind CSS
- CSS Modules
- Styled Components
- Emotion
- Custom enterprise design systems

No theme lock-in. No forced components. No visual constraints.

Style everything using:

- `className`
- `classNames`

```tsx
<AdvancedTable
  classNames={{
    filterBar: 'my-toolbar',
    tableWrapper: 'my-table',
    pagination: 'my-pagination',
    modalPanel: 'my-modal',
    drawerPanel: 'my-drawer',
  }}
/>
```

---

## Multi-calendar support

Built-in support for international and regional applications:

- **Jalali (Persian Calendar)**
- **Gregorian Calendar**
- **Hijri (Islamic Lunar Calendar)**

Used in date pickers and date range filters with full UI switching support.

```tsx
{
  key: 'createdAt',
  label: 'Date',
  type: FilterType.DATE_PICKER,
  calendarSystems: ['jalali', 'gregorian', 'hijri'],
}
```

Calendar names in the UI are customizable via `labels.calendarJalali`, `labels.calendarGregorian`, and `labels.calendarHijri`.

---

## Key features

### Enterprise-ready table experience

- Advanced filtering system (modal + drawer + inline)
- Search and sorting
- Pagination controls
- Applied filter chips
- URL-synced filters (shareable state)
- RTL / LTR support
- Validation-aware cells
- Multi-calendar date filters
- Fully typed APIs (TypeScript-first)

### Flexible architecture

- `AdvancedTable` (all-in-one solution)
- Low-level components (`Table`, `Filters`, `DrawerFilter`, `FilterModal`)
- Fully composable filter system
- Headless-friendly primitives when needed

---

## Filter system (declarative)

Define filters using a schema instead of building UI manually:

```tsx
filterModalSchema={[
  { key: 'status', label: 'Status', type: FilterType.SINGLE_SELECT, options: [...] },
  { key: 'tags', label: 'Tags', type: FilterType.MULTIPLE_BADGE_SELECT, options: [...] },
  { key: 'amount', label: 'Amount', type: FilterType.AMOUNT_RANGE },
  { key: 'createdAt', label: 'Date', type: FilterType.DATE_PICKER, calendarSystems: ['jalali', 'gregorian', 'hijri'] },
]}
```

Supported filter types:

- Single & multi select
- Badge (chip-based) selection
- Numeric range filters
- Date & date range filters (multi-calendar supported)

---

## Custom labels (i18n)

Ship in any language without forking components. The `labels` prop accepts partial overrides merged with English defaults:

```tsx
<AdvancedTable
  labels={{
    search: 'جستجو',
    filtersButton: 'فیلترها',
    modalApply: 'اعمال فیلتر',
    paginationPrevious: 'قبلی',
    paginationNext: 'بعدی',
    calendarJalali: 'شمسی',
    calendarGregorian: 'میلادی',
    calendarHijri: 'قمری',
  }}
/>
```

Use `LabelsProvider` when composing `Filters`, `FilterModal`, or `DrawerFilter` outside `AdvancedTable`. See `AdvancedTableLabels` for the full list.

---

## Perfect for

- Admin dashboards
- CRM systems
- Internal tools
- Financial applications
- Logistics platforms
- Enterprise back-office systems

---

## Installation

```bash
npm install rc-table-advanced
```

Peer dependencies:

- react ≥ 18
- react-dom ≥ 18

---

## Quick example

```tsx
import { AdvancedTable, FilterType, TableCell } from 'rc-table-advanced';

export function OrdersTable() {
  return (
    <AdvancedTable
      rowKey="id"
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (value) => <TableCell value={value} />,
        },
        { title: 'Status', dataIndex: 'status', key: 'status' },
      ]}
      data={[
        { id: 1, name: { value: 'Jane', isValid: true }, status: 'paid' },
        { id: 2, name: { value: 'Invalid', isValid: false }, status: 'draft' },
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
    />
  );
}
```

---

## TypeScript-first

Full type safety across:

- Rows
- Columns
- Filters
- Pagination
- Change events

```tsx
AdvancedTable<Row, Filters>
```

---

## Styling approach

No enforced design system.

You control everything via:

- `className`
- `classNames`

Built-in structure classes exist (`rcta-*`), but your styles always take priority.

---

## RTL support

```tsx
<AdvancedTable dir="rtl" />
```

Fully supports RTL layouts including:

- Table
- Filters
- Drawer
- Modal
- Pagination

---

## Drawer placement

Control filter drawer direction:

- `left`
- `right`

Automatically adapts to RTL/LTR layouts unless overridden.

```tsx
<AdvancedTable
  dir="rtl"
  drawerPlacement="right"
  drawerFilterGroups={[/* … */]}
/>
```

---

## API surface (core exports)

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

## License

[MIT](LICENSE) © [mobinarastinmanesh](https://github.com/mobinarastinmanesh)
