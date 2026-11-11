import { readPortalTheme } from './table.portal';
import clsx from 'clsx';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { DefaultRecordType } from 'rc-table/lib/interface.js';
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
  reason: 'filter' | 'sort' | 'pagination' | 'reset';
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
  urlPrefix?: string;
  urlFilterKeys?: string[];
  resetPageOnFilterChange?: boolean;
  sortOptions?: import('./components/filters/filters-schema.types').Option[];
  filterModalSchema?: FilterSchema<TFilters>[];
  drawerFilterGroups?: DrawerFilterGroup<TFilters>[];
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
  urlPrefix = 'rcta_',
  urlFilterKeys = [],
  resetPageOnFilterChange = true,
  sortOptions: sortOptionsProp,
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
  const rootRef = useRef<HTMLDivElement>(null);
  const labels = useMemo(() => mergeLabels(labelsProp), [labelsProp]);
  const searchTrigger = resolveSearchTrigger(searchTriggerProp, realTimeSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const queryControl = useQueryControl<TFilters>(initialFilters, {
    syncUrl: syncFiltersWithUrl,
    value: controlledFilters,
    onChange: onFiltersChange,
    prefix: urlPrefix,
    schema: [
      ...filterModalSchema,
      ...drawerFilterGroups.flatMap((group) => group.schema),
    ],
    keys: [
      'query',
      'sort',
      'page',
      'pageSize',
      ...urlFilterKeys,
      ...Object.keys(initialFilters ?? {}),
      ...Object.keys(controlledFilters ?? {}),
      ...filterModalSchema.map((item) => item.key),
      ...drawerFilterGroups.flatMap((group) =>
        group.schema.map((item) => item.key),
      ),
    ],
  });

  const filters = queryControl.filters;
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;
  const lastEmittedRef = useRef<string>(serializeFilters(filters));

  const emitChange = useCallback(
    (
      nextFilters: TFilters,
      reason: AdvancedTableChange<TFilters>['reason'] = 'filter',
    ) => {
      const serialized = serializeFilters(nextFilters);
      if (serialized === lastEmittedRef.current) {
        return;
      }

      lastEmittedRef.current = serialized;
      onChange?.({
        filters: nextFilters,
        reason,
        pagination: {
          ...getPaginationSnapshot(paginationRef.current),
          ...(resetPageOnFilterChange ? { page: 1 } : {}),
        },
      });
    },
    [onChange, resetPageOnFilterChange],
  );

  const pendingReason =
    useRef<AdvancedTableChange<TFilters>['reason']>('filter');
  const applyFilter = useCallback(() => {
    emitChange(filters, pendingReason.current);
  }, [emitChange, filters]);

  const setFilters = useCallback(
    (key: keyof TFilters, value: FilterValue) => {
      pendingReason.current = key === 'sort' ? 'sort' : 'filter';
      const next = buildNextFilters(filters, key, value);

      queryControl.replaceFilters(next);

      if (filterMode === FilterMode.ON_CHANGE) {
        emitChange(next, key === 'sort' ? 'sort' : 'filter');
      }
    },
    [emitChange, filterMode, filters, queryControl],
  );

  const clearFilters = useCallback(() => {
    pendingReason.current = 'reset';
    const next = clearUserFilters(filters, initialFilters);

    queryControl.replaceFilters(next);

    if (filterMode === FilterMode.ON_CHANGE) {
      emitChange(next, 'reset');
    }
  }, [emitChange, filterMode, filters, initialFilters, queryControl]);

  const modalValues = useMemo(
    () =>
      filterModalSchema.reduce<FiltersFormValues>((acc, item) => {
        acc[item.key] = filters[
          item.key as keyof TFilters
        ] as FiltersFormValues[string];
        return acc;
      }, {}),
    [filterModalSchema, filters],
  );

  const drawerSchemaKeys = useMemo(
    () =>
      drawerFilterGroups.flatMap((group) =>
        group.schema.map((item) => item.key),
      ),
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
          return;
        }

        next = { ...next, [fieldKey]: value } as TFilters;
      });

      queryControl.replaceFilters(next);
      emitChange(next);
      setIsModalOpen(false);
      setIsDrawerOpen(false);
    },
    [emitChange, filters, queryControl],
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

  const portalTheme =
    isModalOpen || isDrawerOpen ? readPortalTheme(rootRef.current) : undefined;

  const applyDrawerValues = useCallback(
    (values: FiltersFormValues) => {
      applySchemaValues(values, drawerSchemaKeys);
    },
    [applySchemaValues, drawerSchemaKeys],
  );

  const defaultSortOptions = useMemo(
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
          ref={rootRef}
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
            filterChipSchema={drawerFilterGroups.flatMap(
              (group) => group.schema,
            )}
            filters={filters}
            hasSearch={hasSearch}
            hasSort={hasSort}
            realTimeSearch={realTimeSearch}
            searchDebounceMs={searchDebounceMs}
            searchLabel={searchLabel ?? labels.search}
            searchTrigger={searchTrigger}
            setFilters={setFilters}
            sortOptions={sortOptionsProp ?? defaultSortOptions}
            onOpenDrawer={
              drawerFilterGroups.length
                ? () => setIsDrawerOpen(true)
                : undefined
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
                reason: 'pagination',
              })
            }
          />
          <FilterModal
            style={portalTheme}
            classNames={classNames}
            dir={dir}
            open={isModalOpen}
            schema={filterModalSchema}
            values={modalValues}
            onApply={applyModalValues}
            onClose={() => setIsModalOpen(false)}
          />
          <DrawerFilter
            style={portalTheme}
            classNames={classNames}
            dir={dir}
            placement={drawerPlacement}
            groups={drawerFilterGroups.map(({ key, title, schema }) => ({
              key,
              title,
              schema,
            }))}
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
