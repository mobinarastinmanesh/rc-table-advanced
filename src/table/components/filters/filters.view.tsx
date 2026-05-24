import { useEffect, useState } from 'react';
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
    return Object.values(value).some((item) => hasFilterValue(item as FilterValue));
  }

  return true;
};

const getOptionDisplayValue = (
  schema: FilterSchema | InlineFilterSchema<unknown> | undefined,
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
      return option ? ('title' in option ? option.title : undefined) ?? option.label : undefined;
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
    schema as FilterSchema | InlineFilterSchema<unknown> | undefined,
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

const FiltersView = <T extends BaseFiltersState>({
  searchConfig,
  className,
  sortConfig,
  otherFilters,
  hasSearch,
  hasSort,
  setFilters,
  filters,
  filterModalSchema,
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
  const filterCount = calculateFilterCounts(filters, tableKey);
  const normalChildren = createFilterChildren(
    otherFilters,
    filters,
    setFilters,
  );
  const schemasByKey = new Map<string, FilterSchema | InlineFilterSchema<T>>([
    ...(otherFilters ?? []).map((item) => [item.key, item] as const),
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

  return (
    <div
      className={clsx('rcta-filters', classNames?.filterWrapper, className)}
      dir={dir}
    >
      <div className={clsx('rcta-filters__bar', classNames?.filterBar)}>
        {hasSearch && searchConfig ? (
          <input
            className={clsx(
              'rcta-input',
              'rcta-filters__search',
              classNames?.filterSearch,
            )}
            placeholder={searchConfig.label ?? labels.search}
            type="search"
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value);
              if (searchConfig.realTimeSearch) {
                searchConfig.onSearch(event.target.value);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                searchConfig.onSearch(event.currentTarget.value);
              }
            }}
          />
        ) : null}

        {hasSort && sortConfig ? (
          <Dropdown
            ariaLabel="Sort"
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

        {filterModalSchema?.length ? (
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
          <button className="rcta-button" type="button" onClick={applyFilter}>
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
            <button className="rcta-button" type="button" onClick={clearFilters}>
              {labels.clearAllFilters}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default FiltersView;
