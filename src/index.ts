import { injectStyles } from './styles';

injectStyles();

export { default as AdvancedTable } from './table/advanced-table';
export { default as Table } from './table/table';
export { default as TableCell } from './table/components/table-cell';
export { default as ErrorCell } from './table/components/error-cell';
export {
  DrawerFilter,
  FilterModal,
  Filters,
  AmountRangeFilter,
  DatePickerFilter,
  DateRangePickerFilter,
  MultipleBadgeSelectFilter,
  MultipleSelectFilter,
  SingleBadgeSelectFilter,
  SingleSelectFilter,
  FilterMode,
  FilterType,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  calculateFilterCounts,
  deserialize,
  getSortOptions,
  hasAnyFilters,
  serialize,
  useQueryControl,
} from './table/components/filters';
export { getPaginationSnapshot } from './table/pagination.utils';
export { Dropdown } from './table/components/ui/dropdown';
export type { DropdownOption, DropdownProps } from './table/components/ui/dropdown';
export {
  DEFAULT_PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from './constants';
export type {
  AdvancedTableChange,
  AdvancedTableProps,
} from './table/advanced-table';
export type { AdvancedTableLabels } from './table/table.labels';
export {
  DEFAULT_LABELS,
  LabelsProvider,
  mergeLabels,
  useTableLabels,
} from './table/table.labels';
export type { AdvancedTableClassNames } from './table/table.class-names';
export type { TableDirection } from './table/table.direction';
export type { DrawerPlacement } from './table/table.drawer-placement';
export { resolveDrawerPlacement } from './table/table.drawer-placement';
export {
  TableDirectionProvider,
  useTableDirection,
} from './table/table.direction';
export type {
  AdvancedTableBaseProps,
  ErrorCellProps,
  PageSizeOption,
  PaginationConfig,
  PaginationRenderProps,
  PaginationState,
  TableCellProps,
  TableChange,
  TableColumnType,
  TableFieldValue,
  TableSlots,
  TableViewProps,
  TableWrapProps,
} from './table/table.type';
export type {
  AmountFilterValue,
  DateCalendarSystem,
  DateFilterValue,
  DateRangeFilterValue,
  DrawerFilterGroup,
  DrawerFilterProps,
  FilterModalProps,
  FilterSchema,
  FilterSchemaValue,
  FilterValue,
  FiltersFormValues,
  BaseFiltersState,
  InlineFilterSchema,
  FiltersProps,
  FilterRenderProps,
  Option,
} from './table/components/filters';

/** @deprecated Use {@link AdvancedTableBaseProps} */
export type { ITableProps } from './table/table.type';

/** @deprecated Use {@link BaseFiltersState} */
export type { IBaseFiltersState } from './table/components/filters';

/** @deprecated Use {@link FiltersProps} */
export type { IFilters } from './table/components/filters';

/** @deprecated Use {@link InlineFilterSchema} */
export type { IFilterSchema } from './table/components/filters';
