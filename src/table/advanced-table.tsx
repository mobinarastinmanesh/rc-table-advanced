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
  FilterMode,
  type BaseFiltersState,
  type FilterValue,
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

const isFilterValueEmpty = (value: FilterSchemaValue | undefined): boolean =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (item) => item === undefined || item === null || item === '',
    ));

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
  realTimeSearch?: boolean;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isControlled = controlledFilters !== undefined;

  const queryControl = useQueryControl<TFilters>(initialFilters, {
    syncUrl: syncFiltersWithUrl,
  });

  const filters = controlledFilters ?? queryControl.filters;
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  const emitChange = useCallback(
    (nextFilters: TFilters) => {
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
      const next = { ...filters, [key]: value } as TFilters;

      if (!isControlled) {
        queryControl.setFilters(key, value);
      }

      onFiltersChange?.(next);
    },
    [filters, isControlled, onFiltersChange, queryControl],
  );

  const clearFilters = useCallback(() => {
    if (!isControlled) {
      queryControl.clearFilters();
    }

    const next = (initialFilters ?? {}) as TFilters;
    onFiltersChange?.(next);
  }, [initialFilters, isControlled, onFiltersChange, queryControl]);

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
        searchLabel={searchLabel ?? labels.search}
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
