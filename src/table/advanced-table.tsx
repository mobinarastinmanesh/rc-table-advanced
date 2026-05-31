import clsx from 'clsx';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { DefaultRecordType } from 'rc-table/es/interface';
import DrawerFilter, {
  type DrawerFilterGroup,
} from './components/filters/drawer-filter';
import FilterModal from './components/filters/filter-modal';
import Filters from './components/filters/filters';
import { useQueryControl } from './components/filters/filters.hooks';
import {
  buildNextFilters,
  clearUserFilters,
  isEmptyFilterValue,
  serializeFilters,
} from './components/filters/filters.state';
import {
  FilterMode,
  type BaseFiltersState,
  type FilterValue,
  type SearchTrigger,
} from './components/filters/filters.types';
import type {
  FilterSchema,
  FilterSchemaValue,
  FiltersFormValues,
} from './components/filters/filters-schema.types';
import { getPaginationSnapshot } from './pagination.utils';
import Table from './table';
import {
  LabelsProvider,
  mergeLabels,
  type AdvancedTableLabels,
} from './table.labels';
import { TableDirectionProvider, type TableDirection } from './table.direction';
import type { DrawerPlacement } from './table.drawer-placement';
import type { AdvancedTableBaseProps, PaginationState } from './table.type';

export interface AdvancedTableChange<TFilters extends BaseFiltersState> {
  filters: TFilters;
  pagination: PaginationState;
  /** True when pagination changed (page / page size). */
  paginationChanged?: boolean;
}

const isFilterValueEmpty = isEmptyFilterValue;

const DEFAULT_SEARCH_DEBOUNCE_MS = 300;

const resolveSearchTrigger = (
  searchTrigger: SearchTrigger | undefined,
  realTimeSearch: boolean | undefined,
): SearchTrigger => {
  if (searchTrigger) {
    return searchTrigger;
  }

  if (realTimeSearch === true) {
    return 'instant';
  }

  return 'button';
};

export interface AdvancedTableProps<
  RecordType,
  TFilters extends BaseFiltersState = BaseFiltersState,
> extends Omit<AdvancedTableBaseProps<RecordType>, 'onChange'> {
  initialFilters?: TFilters;
  filters?: TFilters;
  onFiltersChange?: (filters: TFilters) => void;
  onChange?: (change: AdvancedTableChange<TFilters>) => void;
  syncFiltersWithUrl?: boolean;
  filterModalSchema?: FilterSchema[];
  drawerFilterGroups?: DrawerFilterGroup[];
  filterMode?: FilterMode;
  searchLabel?: string;
  /** @deprecated Use {@link searchTrigger} `'instant'` instead. */
  realTimeSearch?: boolean;
  /** `'debounced'` auto-search with delay, `'button'` on icon/Enter, `'instant'` on every keystroke. Default `'button'`. */
  searchTrigger?: SearchTrigger;
  searchDebounceMs?: number;
  hasSearch?: boolean;
  hasSort?: boolean;
  /** Override built-in UI strings (search, filters, pagination, calendars, …). */
  labels?: Partial<AdvancedTableLabels>;
  /** Layout and text direction. Default `ltr`. */
  dir?: TableDirection;
  /** Filter drawer edge. Default: `right` for `ltr`, `left` for `rtl`. */
  drawerPlacement?: DrawerPlacement;
}

export type { TableDirection } from './table.direction';
export type { DrawerPlacement } from './table.drawer-placement';
export type { SearchTrigger } from './components/filters/filters.types';

const AdvancedTable = <
  RecordType extends DefaultRecordType,
  TFilters extends BaseFiltersState = BaseFiltersState,
>({
  initialFilters,
  filters: controlledFilters,
  onFiltersChange,
  onChange,
  syncFiltersWithUrl = false,
  filterModalSchema = [],
  drawerFilterGroups = [],
  filterMode = FilterMode.ON_CHANGE,
  searchLabel,
  realTimeSearch,
  searchTrigger: searchTriggerProp,
  searchDebounceMs = DEFAULT_SEARCH_DEBOUNCE_MS,
  hasSearch = true,
  hasSort = true,
  labels: labelsProp,
  dir = 'ltr',
  drawerPlacement,
  pagination,
  className,
  classNames,
  ...tableProps
}: AdvancedTableProps<RecordType, TFilters>) => {
  const labels = useMemo(() => mergeLabels(labelsProp), [labelsProp]);
  const searchTrigger = resolveSearchTrigger(searchTriggerProp, realTimeSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isControlled = controlledFilters !== undefined;

  const queryControl = useQueryControl<TFilters>(initialFilters, {
    syncUrl: syncFiltersWithUrl,
  });

  const filters = controlledFilters ?? queryControl.filters;
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;
  const lastEmittedRef = useRef<string>(serializeFilters(filters));

  const emitChange = useCallback(
    (nextFilters: TFilters) => {
      const serialized = serializeFilters(nextFilters);
      if (serialized === lastEmittedRef.current) {
        return;
      }

      lastEmittedRef.current = serialized;
      onChange?.({
        filters: nextFilters,
        pagination: getPaginationSnapshot(paginationRef.current),
      });
    },
    [onChange],
  );

  const applyFilter = useCallback(() => {
    emitChange(filters);
  }, [emitChange, filters]);

  const setFilters = useCallback(
    (key: keyof TFilters, value: FilterValue) => {
      const next = buildNextFilters(filters, key, value);

      if (!isControlled) {
        queryControl.setFilters(key, value);
      }

      onFiltersChange?.(next);

      if (filterMode === FilterMode.ON_CHANGE) {
        emitChange(next);
      }
    },
    [emitChange, filterMode, filters, isControlled, onFiltersChange, queryControl],
  );

  const clearFilters = useCallback(() => {
    const next = clearUserFilters(filters, initialFilters);

    if (!isControlled) {
      queryControl.clearFilters();
    }

    onFiltersChange?.(next);

    if (filterMode === FilterMode.ON_CHANGE) {
      emitChange(next);
    }
  }, [
    emitChange,
    filterMode,
    filters,
    initialFilters,
    isControlled,
    onFiltersChange,
    queryControl,
  ]);

  const modalValues = useMemo(
    () =>
      filterModalSchema.reduce<FiltersFormValues>((acc, item) => {
        acc[item.key] = filters[item.key as keyof TFilters] as FiltersFormValues[string];
        return acc;
      }, {}),
    [filterModalSchema, filters],
  );

  const drawerSchemaKeys = useMemo(
    () => drawerFilterGroups.flatMap((group) => group.schema.map((item) => item.key)),
    [drawerFilterGroups],
  );

  const drawerValues = useMemo(
    () =>
      drawerSchemaKeys.reduce<FiltersFormValues>((acc, key) => {
        acc[key] = filters[key as keyof TFilters] as FiltersFormValues[string];
        return acc;
      }, {}),
    [drawerSchemaKeys, filters],
  );

  const applySchemaValues = useCallback(
    (values: FiltersFormValues, schemaKeys: string[]) => {
      let next = { ...filters } as TFilters;

      schemaKeys.forEach((key) => {
        const value = values[key];
        const fieldKey = key as keyof TFilters;

        if (isFilterValueEmpty(value)) {
          delete next[fieldKey];
          if (!isControlled) {
            queryControl.setFilters(fieldKey, undefined);
          }
          return;
        }

        next = { ...next, [fieldKey]: value } as TFilters;
        if (!isControlled) {
          queryControl.setFilters(fieldKey, value as FilterValue);
        }
      });

      onFiltersChange?.(next);
      emitChange(next);
      setIsModalOpen(false);
      setIsDrawerOpen(false);
    },
    [emitChange, filters, isControlled, onFiltersChange, queryControl],
  );

  const applyModalValues = useCallback(
    (values: FiltersFormValues) => {
      applySchemaValues(
        values,
        filterModalSchema.map((item) => item.key),
      );
    },
    [applySchemaValues, filterModalSchema],
  );

  const applyDrawerValues = useCallback(
    (values: FiltersFormValues) => {
      applySchemaValues(values, drawerSchemaKeys);
    },
    [applySchemaValues, drawerSchemaKeys],
  );

  const sortOptions = useMemo(
    () => [
      { value: 'newest', label: labels.sortNewest },
      { value: 'oldest', label: labels.sortOldest },
    ],
    [labels.sortNewest, labels.sortOldest],
  );

  return (
    <TableDirectionProvider value={dir}>
      <LabelsProvider value={labels}>
        <div
          className={clsx('rcta-advanced-table', classNames?.root, className)}
          dir={dir}
        >
      <Filters<TFilters>
        applyFilter={applyFilter}
        changeMode={filterMode}
        classNames={classNames}
        clearFilters={clearFilters}
        dir={dir}
        filterModalSchema={filterModalSchema}
        filters={filters}
        hasSearch={hasSearch}
        hasSort={hasSort}
        realTimeSearch={realTimeSearch}
        searchDebounceMs={searchDebounceMs}
        searchLabel={searchLabel ?? labels.search}
        searchTrigger={searchTrigger}
        setFilters={setFilters}
        sortOptions={sortOptions}
        onOpenDrawer={
          drawerFilterGroups.length ? () => setIsDrawerOpen(true) : undefined
        }
        onOpenModal={
          filterModalSchema.length ? () => setIsModalOpen(true) : undefined
        }
      />
      <Table<RecordType>
        {...tableProps}
        classNames={classNames}
        dir={dir}
        emptyText={tableProps.emptyText ?? labels.emptyText}
        pagination={pagination}
        slots={{
          ...tableProps.slots,
          loading: tableProps.slots?.loading ?? labels.loading,
        }}
        onChange={(change) =>
          onChange?.({
            filters,
            pagination: change.pagination,
            paginationChanged: true,
          })
        }
      />
      <FilterModal
        classNames={classNames}
        dir={dir}
        open={isModalOpen}
        schema={filterModalSchema}
        values={modalValues}
        onApply={applyModalValues}
        onClose={() => setIsModalOpen(false)}
      />
      <DrawerFilter
        classNames={classNames}
        dir={dir}
        placement={drawerPlacement}
        groups={drawerFilterGroups}
        open={isDrawerOpen}
        values={drawerValues}
        onApply={applyDrawerValues}
        onClose={() => setIsDrawerOpen(false)}
      />
      </div>
      </LabelsProvider>
    </TableDirectionProvider>
  );
};

export default AdvancedTable;
