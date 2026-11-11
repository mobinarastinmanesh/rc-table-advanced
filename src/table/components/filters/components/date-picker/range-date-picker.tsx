import type { DateObject } from 'react-multi-date-picker';
import DatePicker from './date-picker';
import { toCanonicalDate, toDisplayDate } from './date-value';
import type { RangeDatePickerProps } from './date-picker.types';

const RangeDatePicker = ({
  format,
  calendarSystem = 'jalali',
  onChange,
  value,
  ...props
}: RangeDatePickerProps) => {
  const selectedValue = [value?.from, value?.to]
    .map((item) => toDisplayDate(item, calendarSystem))
    .filter((item): item is DateObject => Boolean(item));

  const handleDateChange = (dates: DateObject | DateObject[] | null) => {
    if (dates == null) {
      onChange?.(undefined);
      return;
    }

    const list = Array.isArray(dates) ? dates : [dates];
    if (!list.length) {
      onChange?.(undefined);
      return;
    }

    const from = list[0] ? toCanonicalDate(list[0]) : undefined;
    const to = list[1] ? toCanonicalDate(list[1]) : undefined;
    onChange?.(from || to ? { from, to } : undefined);
  };

  return (
    <DatePicker
      calendarSystem={calendarSystem}
      format={format}
      range
      value={selectedValue.length ? selectedValue : undefined}
      onChange={handleDateChange}
      {...props}
    />
  );
};

export default RangeDatePicker;
