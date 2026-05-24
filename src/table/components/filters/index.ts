import Filters from './filters';
import DrawerFilter from './drawer-filter';
import FilterModal from './filter-modal';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  getSortOptions,
} from './filters.constants';
import { useQueryControl } from './filters.hooks';
import {
  FilterMode,
  FilterType,
  type BaseFiltersState,
  type FilterValue,
  type FiltersProps,
  type InlineFilterSchema,
} from './filters.types';

export { DrawerFilter, FilterModal, Filters, useQueryControl, getSortOptions };
export {
  AmountRangeFilter,
  DatePickerFilter,
  DateRangePickerFilter,
  MultipleBadgeSelectFilter,
  MultipleSelectFilter,
  SingleBadgeSelectFilter,
  SingleSelectFilter,
} from './components/filter-fields';
export {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  FilterType,
  FilterMode,
};
export type {
  FilterValue,
  BaseFiltersState,
  FiltersProps,
  InlineFilterSchema,
};
export type {
  DrawerFilterGroup,
  DrawerFilterProps,
} from './drawer-filter';
export type { DrawerPlacement } from '../../table.drawer-placement';
export { resolveDrawerPlacement } from '../../table.drawer-placement';
export type { FilterModalProps } from './filter-modal';
export type {
  AmountFilterValue,
  DateFilterValue,
  DateRangeFilterValue,
  FilterSchema,
  FilterSchemaValue,
  FiltersFormValues,
  FilterRenderProps,
  Option,
} from './filters-schema.types';
export type { DateCalendarSystem } from './components/date-picker/date-picker.types';

export {
  calculateFilterCounts,
  deserialize,
  hasAnyFilters,
  serialize,
} from './filters.serialization';

export { createFilterChildren, filterCreator } from './filters.creator';

/** @deprecated Use {@link BaseFiltersState} */
export type IBaseFiltersState = BaseFiltersState;

/** @deprecated Use {@link FiltersProps} */
export type IFilters<T extends BaseFiltersState = BaseFiltersState> = FiltersProps<T>;

/** @deprecated Use {@link InlineFilterSchema} */
export type IFilterSchema<T> = InlineFilterSchema<T>;
