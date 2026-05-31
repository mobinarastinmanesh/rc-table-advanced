import type { ColumnType, TableProps as RcTableProps } from 'rc-table';
import type { GetRowKey } from 'rc-table/lib/interface';
import type { JSX, ReactNode } from 'react';
import type { AdvancedTableClassNames } from './table.class-names';
import type { TableDirection } from './table.direction';

export type TableColumnType<RecordType> = ColumnType<RecordType>;

export type TableFieldValue<T = ReactNode> = {
  value: T;
  isValid?: boolean;
  message?: ReactNode;
};

export type PageSizeOption = {
  value: number | string;
  label?: ReactNode;
};

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  pageSizeOptions?: PageSizeOption[];
}

export interface ErrorCellProps {
  value: ReactNode;
  message?: ReactNode;
  className?: string;
}

export interface TableCellProps<T = ReactNode> {
  value: T | TableFieldValue<T>;
  fallback?: ReactNode;
  className?: string;
  errorMessage?: ReactNode;
  renderErrorCell?: (props: ErrorCellProps) => ReactNode;
  renderValue?: (value: T) => ReactNode;
}

export interface TableSlots {
  empty?: ReactNode;
  loading?: ReactNode;
  footer?: ReactNode;
  renderErrorCell?: (props: ErrorCellProps) => ReactNode;
  renderPagination?: (props: PaginationRenderProps) => ReactNode;
}

export interface PaginationRenderProps {
  pagination: PaginationConfig;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface TableChange {
  pagination: PaginationState;
}

export interface AdvancedTableBaseProps<RecordType>
  extends Omit<RcTableProps<RecordType>, 'columns' | 'emptyText' | 'rowKey'> {
  columns: ColumnType<RecordType>[];
  rowKey?: string | keyof RecordType | GetRowKey<RecordType>;
  pagination?: PaginationConfig;
  loading?: boolean;
  emptyText?: ReactNode;
  showSizeChanger?: boolean;
  slots?: TableSlots;
  onChange?: (change: TableChange) => void;
  getData?: (page: number, pageSize: number) => void;
  /** Extra class on root wrapper (merged with `classNames.root`). */
  className?: string;
  /** Per-part class names for table, filters, modal, drawer, pagination, … */
  classNames?: AdvancedTableClassNames;
  /** Layout and text direction. Default `ltr`. */
  dir?: TableDirection;
}

export interface TableViewProps<RecordType>
  extends AdvancedTableBaseProps<RecordType> {
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface TableWrapProps<RecordType>
  extends AdvancedTableBaseProps<RecordType> {
  renderItem: (props: TableViewProps<RecordType>) => JSX.Element | null;
}

/** @deprecated Use {@link AdvancedTableBaseProps} */
export type ITableProps<RecordType> = AdvancedTableBaseProps<RecordType>;

/** @deprecated Use {@link TableViewProps} */
export type ITableViewProps<RecordType> = TableViewProps<RecordType>;

/** @deprecated Use {@link TableWrapProps} */
export type ITableWrapProps<RecordType> = TableWrapProps<RecordType>;

/** @deprecated Use {@link ErrorCellProps} */
export type IErrorCellProps = ErrorCellProps;
