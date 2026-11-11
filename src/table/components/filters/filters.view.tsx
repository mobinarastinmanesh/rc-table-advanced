import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FilterType } from './filters.types';
import type {
  BaseFiltersState,
  FilterValue,
  FiltersViewProps,
  InlineFilterSchema,
} from './filters.types';
import { Dropdown } from '../ui/dropdown';
import { calculateFilterCounts, createFilterChildren } from './filters.utils';
import type { FilterSchema } from './filters-schema.types';
import { useTableLabels } from '../../table.labels';

const EXCLUDED_FILTER_KEYS = ['page', 'pageSize', 'sort'];
type DisplayOption = { label: string; title?: string; value: string };
type SchemaWithOptions = { options?: DisplayOption[] };

const hasFilterValue = (value: FilterValue | undefined): boolean => {
  if (value === undefined || value === null || value === '') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    return Object.values(value).some((item) =>
      hasFilterValue(item as FilterValue),
    );
  }

  return true;
};

const getOptionDisplayValue = (
  schema:
    | FilterSchema
    | InlineFilterSchema<Record<string, unknown>>
    | undefined,
  value: FilterValue,
) => {
  const options =
    schema && 'options' in schema
      ? (schema as SchemaWithOptions).options
      : undefined;

  if (!options?.length) {
    return undefined;
  }

  const selectedValues = Array.isArray(value) ? value : [value];
  const labels = selectedValues
    .map((item) => {
      const option = options.find((entry) => entry.value === item);
      return option
        ? (('title' in option ? option.title : undefined) ?? option.label)
        : undefined;
    })
    .filter(Boolean);

  return labels.length ? labels.join(', ') : undefined;
};

const formatRangeValue = (
  value: FilterValue,
  startKey: 'from' | 'min',
  endKey: 'to' | 'max',
) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  const range = value as Record<string, unknown>;
  const start = range[startKey];
  const end = range[endKey];

  if (start !== undefined && end !== undefined) {
    return `${start} - ${end}`;
  }

  if (start !== undefined) {
    return `from ${start}`;
  }

  if (end !== undefined) {
    return `to ${end}`;
  }

  return undefined;
};

const getFilterDisplayValue = <T extends BaseFiltersState>(
  key: string,
  value: FilterValue,
  schema: FilterSchema | InlineFilterSchema<T> | undefined,
) => {
  const optionLabel = getOptionDisplayValue(
    schema as
      | FilterSchema
      | InlineFilterSchema<Record<string, unknown>>
      | undefined,
    value,
  );

  if (optionLabel) {
    return optionLabel;
  }

  if (schema?.type === FilterType.AMOUNT_RANGE) {
    return formatRangeValue(value, 'min', 'max');
  }

  if (schema?.type === FilterType.DATE_RANGE_PICKER) {
    return formatRangeValue(value, 'from', 'to');
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .filter(([, item]) => hasFilterValue(item as FilterValue))
      .map(([entryKey, item]) => `${entryKey}: ${String(item)}`)
      .join(', ');
  }

  return String(value);
};

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    className="rcta-search-field__icon"
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.25 12.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="m11 11 3.5 3.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
);

const FiltersView = <T extends BaseFiltersState>({
  searchConfig,
  children,
  headerContent,
  subTitle,
  filteredItemCount,
  hasModal = true,
  isSubmitDisabled,
  className,
  sortConfig,
  otherFilters,
  hasSearch,
  hasSort,
  setFilters,
  filters,
  filterModalSchema,
  filterChipSchema,
  tableKey = '',
  changeMode,
  clearFilters,
  applyFilter,
  onOpenModal,
  onOpenDrawer,
  classNames,
  dir = 'ltr',
}: FiltersViewProps<T>) => {
  const labels = useTableLabels();
  const [searchValue, setSearchValue] = useState(
    String(searchConfig?.query ?? ''),
  );
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const filterCount = calculateFilterCounts(filters, tableKey);
  const normalChildren = createFilterChildren(
    otherFilters,
    filters,
    setFilters,
  );
  const schemasByKey = new Map<string, FilterSchema | InlineFilterSchema<T>>([
    ...(otherFilters ?? []).map((item) => [item.key, item] as const),
    ...(filterChipSchema ?? []).map((item) => [item.key, item] as const),
    ...(filterModalSchema ?? []).map((item) => [item.key, item] as const),
  ]);

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    const excluded = [
      ...EXCLUDED_FILTER_KEYS,
      `${tableKey}_page`,
      `${tableKey}_pageSize`,
      `${tableKey}_sort`,
    ];
    return !excluded.includes(key) && hasFilterValue(value);
  });

  useEffect(() => {
    setSearchValue(String(searchConfig?.query ?? ''));
  }, [searchConfig?.query]);

  const submitSearch = useCallback(
    (query: string) => {
      searchConfig?.onSearch(query);
    },
    [searchConfig],
  );

  useEffect(() => {
    if (!searchConfig || searchConfig.searchTrigger !== 'debounced') {
      return;
    }

    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      if (searchValue === String(searchConfig.query ?? '')) {
        return;
      }

      submitSearch(searchValue);
    }, searchConfig.searchDebounceMs);

    return () => window.clearTimeout(debounceTimerRef.current);
  }, [searchConfig, searchValue, submitSearch]);

  useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);

  return (
    <div
      className={clsx('rcta-filters', classNames?.filterWrapper, className)}
      dir={dir}
    >
      {headerContent}
      {subTitle ? <p>{subTitle}</p> : null}
      {filteredItemCount !== undefined ? (
        <p role="status">{labels.filteredItemCount(filteredItemCount)}</p>
      ) : null}
      <div className={clsx('rcta-filters__bar', classNames?.filterBar)}>
        {hasSearch && searchConfig ? (
          <div className={clsx('rcta-search-field', classNames?.filterSearch)}>
            <input
              className={clsx('rcta-input', 'rcta-search-field__input')}
              placeholder={searchConfig.label ?? labels.search}
              type="search"
              aria-label={searchConfig.label ?? labels.search}
              value={searchValue}
              onChange={(event) => {
                const nextValue = event.target.value;
                setSearchValue(nextValue);
                if (searchConfig.searchTrigger === 'instant') {
                  submitSearch(nextValue);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  window.clearTimeout(debounceTimerRef.current);
                  submitSearch(event.currentTarget.value);
                }
              }}
            />
            <button
              aria-label={searchConfig.label ?? labels.search}
              className="rcta-search-field__submit"
              type="button"
              onClick={() => {
                window.clearTimeout(debounceTimerRef.current);
                submitSearch(searchValue);
              }}
            >
              <SearchIcon />
            </button>
          </div>
        ) : null}

        {hasSort && sortConfig ? (
          <Dropdown
            ariaLabel={labels.sortPlaceholder}
            className="rcta-filters__sort"
            options={sortConfig.options.map((option) => ({
              value: option.value,
              label: option.label,
              disabled: option.disabled,
            }))}
            placeholder={labels.sortPlaceholder}
            value={sortConfig.defaultValue ?? sortConfig.options[0]?.value}
            onChange={(next) => {
              if (typeof next === 'string') sortConfig.onChange(next);
            }}
          />
        ) : null}

        {normalChildren?.map((child, index) => (
          <div key={`filter-child-${index}`}>{child}</div>
        ))}

        {children}

        {hasModal && filterModalSchema?.length ? (
          <button className="rcta-button" type="button" onClick={onOpenModal}>
            {labels.filtersButton}
            {filterCount ? ` (${filterCount})` : ''}
          </button>
        ) : null}

        {onOpenDrawer ? (
          <button className="rcta-button" type="button" onClick={onOpenDrawer}>
            {labels.drawerFiltersButton}
          </button>
        ) : null}

        {changeMode === 'on-submit' ? (
          <button
            className="rcta-button"
            type="button"
            disabled={isSubmitDisabled}
            onClick={applyFilter}
          >
            {labels.applyButton}
          </button>
        ) : null}
      </div>

      {activeFilters.length > 0 ? (
        <div className={clsx('rcta-selected-filters', classNames?.filterChips)}>
          <span className="rcta-selected-filters__label">
            {labels.appliedFiltersLabel}
          </span>
          {activeFilters.map(([key, value]) => {
            const schema = schemasByKey.get(key);
            const label = schema?.label ?? key;
            const displayValue = getFilterDisplayValue(key, value, schema);

            return (
              <button
                key={key}
                className="rcta-chip"
                type="button"
                onClick={() => setFilters(key as keyof T, undefined)}
              >
                {label}: {displayValue}
                <span aria-hidden="true"> x</span>
              </button>
            );
          })}
          {clearFilters ? (
            <button
              className="rcta-button"
              type="button"
              onClick={clearFilters}
            >
              {labels.clearAllFilters}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default FiltersView;
