import type { ReactElement, ReactNode } from 'react';
import type { AdvancedTableClassNames } from '../../table.class-names';
import type { TableDirection } from '../../table.direction';
import type {
  DateRangeFilterValue,
  FilterSchema,
  FilterSchemaValue,
  Option,
} from './filters-schema.types';

export { FilterType } from './filters-schema.types';

export enum FilterMode {
  ON_CHANGE = 'on-change',
  ON_SUBMIT = 'on-submit',
}

export type BaseFiltersState = {
  query?: string;
  sort?: string;
  pageSize?: number;
  page?: number;
} & Record<string, FilterValue | undefined>;

export interface InlineFilterSchema<T> {
  type: FilterSchema['type'];
  options?: Option[];
  key: string;
  label: string;
  defaultValue?: FilterValue;
  text?: string;
  isLoading?: boolean;
  onChange?: (key: keyof T, value: FilterValue) => void;
}

export interface FiltersProps<T extends BaseFiltersState> {
  otherFilters?: InlineFilterSchema<T>[];
  filteredItemCount?: number;
  searchLabel?: string;
  sortOptions?: Option[];
  children?: ReactElement;
  /** Extra class on filter block (merged with `classNames.filterWrapper`) */
  className?: string;
  classNames?: AdvancedTableClassNames;
  dir?: TableDirection;
  hasSearch?: boolean;
  hasSort?: boolean;
  applyFilter: () => void;
  clearFilters?: () => void;
  setFilters: (key: keyof T, value: FilterValue) => void;
  filters: T;
  filterModalSchema?: FilterSchema[];
  changeMode: FilterMode;
  tableKey?: string;
  realTimeSearch?: boolean;
  excludedKeys?: string[];
  hasModal?: boolean;
  headerContent?: ReactNode;
  isSubmitDisabled?: boolean;
  subTitle?: string;
  onOpenModal?: () => void;
  onOpenDrawer?: () => void;
}

export interface FiltersWrapProps<T extends BaseFiltersState>
  extends FiltersProps<T> {
  renderItem: (props: FiltersViewProps<T>) => ReactElement;
}

export interface FiltersViewProps<T extends BaseFiltersState>
  extends Omit<FiltersProps<T>, 'sortOptions' | 'searchLabel'> {
  searchConfig?: SearchConfig;
  sortConfig?: SortConfig;
  defaultValue?: T;
  filterCounts?: number;
}

export interface FilterOption {
  key: string;
  label: string;
}

export interface SearchConfig {
  onSearch: (query: string) => void;
  query: string;
  label?: string;
  realTimeSearch?: boolean;
}

export interface SortConfig {
  options: Option[];
  defaultValue?: string;
  onChange: (value: string) => void;
}

export interface UseFilterReturn<T extends BaseFiltersState> {
  filters: T;
  setFilters: (key: keyof T, value: FilterValue) => void;
  clearFilters: () => void;
}

export type FilterValue =
  | string
  | string[]
  | DateRangeFilterValue
  | number
  | boolean
  | FilterSchemaValue;

/** @deprecated Use {@link BaseFiltersState} */
export type IBaseFiltersState = BaseFiltersState;

/** @deprecated Use {@link InlineFilterSchema} */
export type IFilterSchema<T> = InlineFilterSchema<T>;

/** @deprecated Use {@link FiltersProps} */
export type IFilters<T extends BaseFiltersState> = FiltersProps<T>;

/** @deprecated Use {@link FiltersWrapProps} */
export type IFiltersWrap<T extends BaseFiltersState> = FiltersWrapProps<T>;

/** @deprecated Use {@link FiltersViewProps} */
export type IFiltersView<T extends BaseFiltersState> = FiltersViewProps<T>;

/** @deprecated Use {@link SearchConfig} */
export type ISearchConfig = SearchConfig;

/** @deprecated Use {@link SortConfig} */
export type ISortConfig = SortConfig;

/** @deprecated Use {@link UseFilterReturn} */
export type IUseFilter<T extends BaseFiltersState> = UseFilterReturn<T>;
