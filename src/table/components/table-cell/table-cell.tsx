import clsx from 'clsx';
import { useContext, type ReactNode } from 'react';
import { ErrorRendererContext } from './error-renderer.context';
import ErrorCell from '../error-cell';
import type { ITableCellProps } from './table-cell.types';

const isFieldValue = <T,>(
  value: unknown,
): value is {
  value: T;
  isValid?: boolean;
  message?: ReactNode;
} => typeof value === 'object' && value !== null && 'value' in value;

const TableCell = <T,>({
  value,
  fallback = '-',
  className,
  errorMessage,
  renderErrorCell,
  renderValue,
}: ITableCellProps<T>) => {
  const inheritedErrorRenderer = useContext(ErrorRendererContext);
  const fieldValue = isFieldValue<T>(value) ? value : undefined;
  const rawValue = fieldValue ? fieldValue.value : (value as T);
  const content =
    rawValue === null || rawValue === undefined || rawValue === ''
      ? fallback
      : renderValue
        ? renderValue(rawValue)
        : (rawValue as ReactNode);
  const message = errorMessage ?? fieldValue?.message;

  if (fieldValue?.isValid === false) {
    const ErrorRenderer =
      renderErrorCell ?? inheritedErrorRenderer ?? ErrorCell;

    return (
      <div
        className={clsx('rcta-table-cell', 'rcta-table-cell--error', className)}
      >
        <ErrorRenderer value={content} message={message} />
      </div>
    );
  }

  return <div className={clsx('rcta-table-cell', className)}>{content}</div>;
};

export default TableCell;
