import type { ErrorCellProps } from '../table.type';

const ErrorCell = ({ value, message, className }: ErrorCellProps) => (
  <span
    aria-invalid="true"
    className={['rcta-error-cell', className].filter(Boolean).join(' ')}
    title={typeof message === 'string' ? message : undefined}
  >
    <span className="rcta-error-cell__value">{value ?? '-'}</span>
    {message ? (
      <span aria-label="Cell error" className="rcta-error-cell__icon">
        !
      </span>
    ) : null}
  </span>
);

export default ErrorCell;
