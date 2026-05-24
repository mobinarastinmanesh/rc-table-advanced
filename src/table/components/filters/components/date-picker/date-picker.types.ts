import type { ComponentProps } from 'react';
import type ReactDatePicker from 'react-multi-date-picker';

export type DateCalendarSystem = 'jalali' | 'miladi' | 'ghamari';
export type DateValue = string;
export type DateRangeValue = { from?: DateValue; to?: DateValue };

export interface DatePickerProps
  extends Omit<ComponentProps<typeof ReactDatePicker>, 'calendar' | 'locale'> {
  calendarSystem?: DateCalendarSystem;
}

export interface RangeDatePickerProps
  extends Omit<DatePickerProps, 'value' | 'onChange' | 'range'> {
  onChange?: (value: DateRangeValue | undefined) => void;
  value: DateRangeValue | undefined;
}
