import type { DateObject } from 'react-multi-date-picker';
import DatePicker from './date-picker';
import type { RangeDatePickerProps } from './date-picker.types';

const RangeDatePicker = ({
  format,
  onChange,
  value,
  ...props
}: RangeDatePickerProps) => {
  const selectedValue = [value?.from, value?.to].filter(
    (item): item is string => Boolean(item),
  );

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

    const from = list[0]?.format?.(format);
    const to = list[1]?.format?.(format);
    onChange?.(from || to ? { from, to } : undefined);
  };

  return (
    <DatePicker
      format={format}
      range
      value={selectedValue.length ? selectedValue : undefined}
      onChange={handleDateChange}
      {...props}
    />
  );
};

export default RangeDatePicker;
