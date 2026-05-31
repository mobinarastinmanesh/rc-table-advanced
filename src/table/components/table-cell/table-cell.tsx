import clsx from 'clsx';
import type { ReactNode } from 'react';
import ErrorCell from '../error-cell';
import type { ITableCellProps } from './table-cell.types';

const isFieldValue = <T,>(value: unknown): value is {
  value: T;
  isValid?: boolean;
  message?: ReactNode;
} =>
  typeof value === 'object' &&
  value !== null &&
  'value' in value &&
  ('isValid' in value || 'message' in value);

const TableCell = <T,>({
  value,
  fallback = '-',
  className,
  errorMessage,
  renderErrorCell,
  renderValue,
}: ITableCellProps<T>) => {
  const fieldValue = isFieldValue<T>(value) ? value : undefined;
  const rawValue = fieldValue ? fieldValue.value : (value as T);
  const content = rawValue === null || rawValue === undefined || rawValue === ''
    ? fallback
    : renderValue
      ? renderValue(rawValue)
      : (rawValue as ReactNode);
  const message = errorMessage ?? fieldValue?.message;

  if (fieldValue?.isValid === false) {
    const errorCell = renderErrorCell ?? ErrorCell;

    return (
      <div className={clsx('rcta-table-cell', 'rcta-table-cell--error', className)}>
        {errorCell({ value: content, message })}
      </div>
    );
  }

  return <div className={clsx('rcta-table-cell', className)}>{content}</div>;
};

export default TableCell;
