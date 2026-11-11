import { useId } from 'react';
import type { ErrorCellProps } from '../table.type';

const ErrorCell = ({ value, message, className }: ErrorCellProps) => {
  const messageId = useId();
  return (
    <span
      aria-invalid="true"
      aria-describedby={message ? messageId : undefined}
      className={['rcta-error-cell', className].filter(Boolean).join(' ')}
      title={typeof message === 'string' ? message : undefined}
    >
      <span className="rcta-error-cell__value">{value ?? '-'}</span>
      {message ? (
        <>
          <span aria-hidden="true" className="rcta-error-cell__icon">
            !
          </span>
          <span id={messageId} className="rcta-sr-only">
            {message}
          </span>
        </>
      ) : null}
    </span>
  );
};
export default ErrorCell;
