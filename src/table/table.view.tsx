import { TableDirectionProvider } from './table.direction';
import { ErrorRendererContext } from './components/table-cell/error-renderer.context';
import clsx from 'clsx';
import { useMemo } from 'react';
import RcTableImport from 'rc-table';

// Native Node ESM exposes the CommonJS namespace, bundlers expose its default.
const Table: typeof RcTableImport =
  (RcTableImport as unknown as { default?: typeof RcTableImport }).default ??
  RcTableImport;
import type { DefaultRecordType } from 'rc-table/lib/interface.js';
import { Dropdown } from './components/ui/dropdown';
import { DEFAULT_PAGE_SIZE_OPTIONS } from './table.constants';
import type { TableViewProps } from './table.type';
import { useTableLabels } from './table.labels';

const TableView = <RecordType extends DefaultRecordType>({
  columns,
  pagination,
  loading,
  emptyText,
  showSizeChanger,
  slots,
  onPageChange,
  onPageSizeChange,
  classNames,
  className,
  dir = 'ltr',
  ...props
}: TableViewProps<RecordType>) => {
  const labels = useTableLabels();
  const { scroll, data, ...rest } = props;

  const resolvedColumns = useMemo(() => {
    if (dir !== 'rtl' || !columns) return columns;

    return columns.map((column) => ({
      ...column,
      align: column.align ?? 'right',
    }));
  }, [columns, dir]);
  const resolvedEmptyText = emptyText ?? labels.emptyText;
  const totalPages =
    pagination?.totalPages ??
    (pagination?.total !== undefined
      ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
      : undefined);
  const hasPrev = pagination
    ? (pagination.hasPrev ?? pagination.page > 1)
    : false;
  const hasNext = pagination
    ? (pagination.hasNext ??
      (totalPages ? pagination.page < totalPages : false))
    : false;

  const defaultPagination = pagination ? (
    <div className={clsx('rcta-pagination', classNames?.pagination)}>
      <button
        className="rcta-button rcta-pagination__prev"
        disabled={!hasPrev}
        type="button"
        onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
      >
        {labels.paginationPrevious}
      </button>
      <span className="rcta-pagination__info">
        {labels.paginationPageInfo(pagination.page, totalPages)}
      </span>
      <button
        className="rcta-button rcta-pagination__next"
        disabled={!hasNext}
        type="button"
        onClick={() => onPageChange(pagination.page + 1)}
      >
        {labels.paginationNext}
      </button>
      {showSizeChanger ? (
        <Dropdown
          ariaLabel={labels.paginationRowsPerPage}
          className="rcta-pagination__size"
          options={(
            pagination.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS
          ).map((option) => ({
            value: String(option.value),
            label: String(option.label ?? option.value),
          }))}
          value={String(pagination.pageSize)}
          onChange={(next) => {
            if (typeof next === 'string') onPageSizeChange(Number(next));
          }}
        />
      ) : null}
    </div>
  ) : null;

  const emptyNode = slots?.empty ?? resolvedEmptyText;

  return (
    <TableDirectionProvider value={dir}>
      <div
        className={clsx(
          'rcta-table',
          className,
          dir === 'rtl' && 'rcta-table--rtl',
          classNames?.tableWrapper,
        )}
        dir={dir}
        aria-busy={loading || undefined}
      >
        {loading ? (
          <div
            className={clsx('rcta-loading', classNames?.tableLoading)}
            role="status"
          >
            {slots?.loading ?? labels.loading}
          </div>
        ) : null}
        <ErrorRendererContext.Provider value={slots?.renderErrorCell}>
          <Table<RecordType>
            columns={resolvedColumns}
            data={data}
            emptyText={emptyNode}
            scroll={{ x: scroll?.x ?? 'max-content', y: scroll?.y }}
            {...rest}
          />
        </ErrorRendererContext.Provider>
        {slots?.footer}
        {slots?.renderPagination && pagination
          ? slots.renderPagination({
              pagination,
              onPageChange,
              onPageSizeChange,
            })
          : defaultPagination}
      </div>
    </TableDirectionProvider>
  );
};

export default TableView;
