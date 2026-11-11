# API reference

All components and helpers below are exported by the default and core entries. The default entry adds this package's automatic styles; core leaves their delivery to the app. The upstream picker has separate style injection; see the styling guide. CSS is exported as `rc-table-advanced/styles.css`.

## AdvancedTable<Row, Filters>

| Prop                        | Default                   | Behavior                                                                                   |
| --------------------------- | ------------------------- | ------------------------------------------------------------------------------------------ |
| `columns`, `data`, `rowKey` | rc-table defaults         | Typed column definitions, already-processed visible rows, stable row identity              |
| `filters`                   | internal state            | Controlled filters; handle `onFiltersChange`                                               |
| `initialFilters`            | `{}`                      | Initial internal filters and reset defaults                                                |
| `onFiltersChange`           | —                         | Proposed filter state, including submit-mode drafts and URL hydration/navigation           |
| `onChange`                  | —                         | Applied `{ filters, pagination, reason, paginationChanged? }`; no initial-load event       |
| `pagination`                | absent                    | Controlled `{ page, pageSize, total?, totalPages?, hasNext?, hasPrev?, pageSizeOptions? }` |
| `resetPageOnFilterChange`   | `true`                    | Emit page 1 when applying filters/sort/reset                                               |
| `filterModalSchema`         | `[]`                      | Modal field schemas                                                                        |
| `drawerFilterGroups`        | `[]`                      | Groups with key, title and schema                                                          |
| `filterMode`                | `ON_CHANGE`               | Toolbar live or submit application; dialog Apply always commits                            |
| `hasSearch`, `hasSort`      | `true`                    | Show toolbar controls                                                                      |
| `searchTrigger`             | `button`                  | `button`, `instant` or `debounced`                                                         |
| `searchDebounceMs`          | `300`                     | Delay for debounced input                                                                  |
| `searchLabel`               | localized search          | Input/button accessible name and placeholder                                               |
| `sortOptions`               | newest/oldest             | Array of options; application implements ordering                                          |
| `syncFiltersWithUrl`        | `false`                   | Enable browser-history filter adapter                                                      |
| `urlPrefix`                 | `rcta_`                   | Owned parameter prefix; distinct per table                                                 |
| `urlFilterKeys`             | `[]`                      | Additional owned filter keys                                                               |
| `labels`                    | English defaults          | Partial `AdvancedTableLabels` overrides                                                    |
| `dir`                       | `ltr`                     | Layout direction                                                                           |
| `drawerPlacement`           | right in LTR, left in RTL | Explicit left/right override                                                               |
| `className`, `classNames`   | —                         | Root class and named-region classes                                                        |
| `loading`, `emptyText`      | false / localized empty   | Loading status and empty content                                                           |
| `showSizeChanger`           | false                     | Page-size dropdown                                                                         |
| `slots`                     | —                         | empty/loading/footer/custom pagination and table-wide error-cell rendering                 |
| `getData`                   | —                         | Legacy pagination-only callback; prefer onChange                                           |
| `realTimeSearch`            | —                         | Deprecated alias: true means instant unless searchTrigger is supplied                      |

Other supported table props are forwarded to [rc-table](https://github.com/react-component/table), including scroll, expandable, row events and table components. Columns are typed as `ColumnType<Row>[]`; arbitrary rc-table column groups are not added by this wrapper.

`reason` is `filter`, `sort`, `pagination` or `reset`. `paginationChanged` is retained for compatibility and is true for pagination control events. Use `reason` plus the returned pagination snapshot in new integrations.

## Table<Row>

The table-only wrapper accepts the table, pagination, styling, loading and slot props above. Its `onChange` receives `{ pagination }`. It does not add the filter toolbar or AdvancedTable's localization provider. Compose it with `LabelsProvider` when needed.

## Dialogs and filters

`FilterModal`: `open`, `schema`, `values?`, `title?`, `onApply`, `onClose`, `classNames?`, `dir?`, `style?`, `renderShell?`.

`DrawerFilter`: `open`, `groups`, `values?`, `title?`, `onApply`, `onClose`, `classNames?`, `dir?`, `style?`, `placement?`, `autoApplyOnClear?`.

`values` is applied state; each dialog snapshots it when opening. Closing discards local edits. `autoApplyOnClear` is false by default; standalone drawer consumers can opt into immediate clear callbacks. Custom modal shells receive the default dialog content and must preserve its accessibility semantics.

`Filters<T>`: `filters`, `setFilters`, `applyFilter`, `changeMode` are required. Optional `otherFilters`, `filterModalSchema`, `filterChipSchema`, `sortOptions`, search configuration, `tableKey`, `excludedKeys`, clear/open callbacks, labels through context, and classes customize composition. `headerContent`, `subTitle`, `filteredItemCount` and `children` add content. `hasModal` toggles the modal trigger and `isSubmitDisabled` disables the submit action.

Field primitives: `SingleSelectFilter`, `MultipleSelectFilter`, `SingleBadgeSelectFilter`, `MultipleBadgeSelectFilter`, `AmountRangeFilter`, `DatePickerFilter`, `DateRangePickerFilter` take `{ schema, value, onChange }`. See [schemas](filters.md) and [dates](calendars.md).

## Cells

`TableCell`: `value`, optional `fallback`, `className`, `errorMessage`, `renderValue`, `renderErrorCell`. A value may be a React-renderable value or `{ value, isValid?, message? }`. Invalid values use ErrorCell with accessible error markup.

`ErrorCell`: `value`, `message?`, `className?`.

## Dropdown

`options`, `onChange` required. Optional `value`, `multiple`, `placeholder`, `emptyOption`, `ariaLabel`, `className`, `disabled`, `id`, `portalContainer`. Option values and labels are strings. Single selection emits a string or undefined; multiple emits a string array or undefined when empty.

## Helpers, providers and types

- State: `useQueryControl`, `buildNextFilters`, `clearUserFilters`, `isEmptyFilterValue`.
- URL: `serialize`, `deserialize`; see [ownership and encoding](url-state.md).
- Filters: `FilterType`, `FilterMode`, `calculateFilterCounts`, `hasAnyFilters`, `validateFilters`.
- Dates: `toCanonicalDate`, `toDisplayDate`.
- Pagination: `getPaginationSnapshot`, `DEFAULT_PAGE`, `DEFAULT_PAGE_SIZE`, `DEFAULT_PAGE_SIZE_OPTIONS`.
- Sort: `DEFAULT_SORT`, `SORT_OPTIONS`, `getSortOptions`.
- Localization: `LabelsProvider`, `useTableLabels`, `DEFAULT_LABELS`, `mergeLabels`.
- Direction: `TableDirectionProvider`, `useTableDirection`, `resolveDrawerPlacement`.
- Styles: `injectStyles({ nonce? })`.
- Types include `AdvancedTableProps`, `AdvancedTableChange`, `AdvancedTableBaseProps`, `TableColumnType`, `TableFieldValue`, `TableCellProps`, `ErrorCellProps`, `PaginationConfig`, `PaginationState`, `PaginationRenderProps`, `PageSizeOption`, `TableSlots`, `TableChange`, `TableViewProps`, `TableWrapProps`, `FilterSchema`, `FilterSchemaValue`, `FiltersFormValues`, `FilterRenderProps`, `FilterValue`, `BaseFiltersState`, `FiltersProps`, `InlineFilterSchema`, `Option`, `SearchTrigger`, `DateCalendarSystem`, date/range/amount value types, dialog/group props, dropdown props/options, `AdvancedTableLabels`, `AdvancedTableClassNames`, `QueryControlOptions`, `TableDirection` and `DrawerPlacement`.

Old `ITableProps`, `IBaseFiltersState`, `IFilters` and `IFilterSchema` names remain deprecated aliases. New code should use the unprefixed types.
