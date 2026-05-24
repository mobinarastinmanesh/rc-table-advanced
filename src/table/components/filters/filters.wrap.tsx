import { useEffect, useMemo, useRef } from 'react';
import { getSortOptions } from './filters.constants';
import { FilterMode } from './filters.types';
import type {
  BaseFiltersState,
  FilterValue,
  FiltersWrapProps,
  SearchConfig,
  SortConfig,
} from './filters.types';

function FiltersWrap<T extends BaseFiltersState>({
  renderItem,
  tableKey = '',
  hasSearch = true,
  searchLabel,
  realTimeSearch = false,
  hasSort = true,
  sortOptions = getSortOptions(),
  changeMode = FilterMode.ON_CHANGE,
  setFilters,
  clearFilters,
  filters,
  otherFilters,
  className,
  applyFilter,
  excludedKeys,
  children,
  hasModal = true,
  ...rest
}: FiltersWrapProps<T>) {
  const skipInitialApplyRef = useRef(true);
  const applyFilterRef = useRef(applyFilter);
  applyFilterRef.current = applyFilter;

  useEffect(() => {
    if (changeMode !== FilterMode.ON_CHANGE) {
      return;
    }

    if (skipInitialApplyRef.current) {
      skipInitialApplyRef.current = false;
      return;
    }

    applyFilterRef.current();
  }, [changeMode, filters]);

  const nonExcludedFilters = useMemo(() => {
    if (!excludedKeys) {
      return filters;
    }

    return Object.fromEntries(
      Object.entries(filters).filter(([key]) => !excludedKeys.includes(key)),
    ) as T;
  }, [filters, excludedKeys]);

  const key = tableKey ? `${tableKey}_` : '';
  const searchConfig: SearchConfig | undefined = hasSearch
    ? {
        realTimeSearch,
        onSearch: (query: string) =>
          setFilters(`${key}query` as keyof T, query as FilterValue),
        query: String(filters[`${key}query` as keyof T] ?? ''),
        label: searchLabel,
      }
    : undefined;

  const sortConfig: SortConfig | undefined = hasSort
    ? {
        options: sortOptions ?? getSortOptions(),
        defaultValue: filters[`${key}sort` as keyof T] as string | undefined,
        onChange: (value: string) =>
          setFilters(`${key}sort` as keyof T, value as FilterValue),
      }
    : undefined;

  return renderItem({
    setFilters,
    clearFilters,
    filters: nonExcludedFilters,
    hasSearch,
    hasSort,
    otherFilters,
    searchConfig,
    sortConfig,
    children,
    className,
    tableKey,
    hasModal,
    changeMode,
    applyFilter,
    ...rest,
  });
}

export default FiltersWrap;
