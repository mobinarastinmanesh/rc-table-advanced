import { forwardRef, useImperativeHandle, useRef } from 'react';
import './date-picker.css';
import { DATE_FORMAT, calendarSystemConfigs } from './date-picker.constants';
import { MultiDatePicker } from './multi-date-picker';
import { useTableDirection } from '../../../../table.direction';
import type { DatePickerProps } from './date-picker.types';

const DatePicker = forwardRef<unknown, DatePickerProps>(
  (
    {
      calendarSystem = 'jalali',
      calendarPosition,
      format = DATE_FORMAT,
      inputClass = 'rcta-input',
      offsetY = 8,
      className,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<unknown>(null);
    const dir = useTableDirection();
    const isRtl = dir === 'rtl';
    const calendarConfig = calendarSystemConfigs[calendarSystem];
    const resolvedPosition =
      calendarPosition ?? (isRtl ? 'bottom-end' : 'bottom-start');

    useImperativeHandle(ref, () => internalRef.current);

    return (
      <MultiDatePicker
        ref={internalRef}
        arrow={false}
        calendar={calendarConfig.calendar}
        calendarPosition={resolvedPosition}
        className={className ?? (isRtl ? 'rmdp-rtl' : undefined)}
        format={format}
        headerOrder={['MONTH_YEAR', 'LEFT_BUTTON', 'RIGHT_BUTTON']}
        inputClass={inputClass}
        locale={calendarConfig.locale}
        offsetY={offsetY}
        renderButton={(direction: string, handleClick: () => void) => (
          <button
            aria-label={direction === 'left' ? 'Previous month' : 'Next month'}
            className="rcta-icon-button"
            type="button"
            onClick={handleClick}
          >
            {direction === 'left' ? '<' : '>'}
          </button>
        )}
        weekDays={[...calendarConfig.weekDays]}
        weekStartDayIndex={calendarConfig.weekStartDayIndex}
        {...props}
      />
    );
  },
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
