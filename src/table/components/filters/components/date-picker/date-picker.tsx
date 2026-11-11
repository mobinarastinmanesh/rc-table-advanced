import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { DatePickerRef } from 'react-multi-date-picker';
import { DATE_FORMAT, getCalendarSystemConfig } from './date-picker.constants';
import { MultiDatePicker } from './multi-date-picker';
import { useTableLabels } from '../../../../table.labels';
import { useTableDirection } from '../../../../table.direction';
import type { DatePickerProps } from './date-picker.types';

const DatePicker = forwardRef<DatePickerRef, DatePickerProps>(
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
    const internalRef = useRef<DatePickerRef>(null);
    const dir = useTableDirection();
    const labels = useTableLabels();
    const isRtl = dir === 'rtl';
    const calendarConfig = getCalendarSystemConfig(calendarSystem, dir);
    const resolvedPosition =
      calendarPosition ?? (isRtl ? 'bottom-end' : 'bottom-start');

    useImperativeHandle(ref, () => internalRef.current as DatePickerRef);

    useEffect(() => {
      const handlePointerDown = (event: PointerEvent) => {
        const picker = internalRef.current;
        if (!picker?.isOpen) return;

        const target = event.target;
        if (!(target instanceof Node) || picker.contains(target)) return;

        picker.closeCalendar();
      };

      document.addEventListener('pointerdown', handlePointerDown, true);
      return () =>
        document.removeEventListener('pointerdown', handlePointerDown, true);
    }, []);

    return (
      <MultiDatePicker
        {...props}
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
            aria-label={
              direction === 'left' ? labels.previousMonth : labels.nextMonth
            }
            className="rcta-icon-button"
            type="button"
            onClick={handleClick}
          >
            {direction === 'left' ? '<' : '>'}
          </button>
        )}
        weekDays={[...calendarConfig.weekDays]}
        weekStartDayIndex={calendarConfig.weekStartDayIndex}
      />
    );
  },
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
