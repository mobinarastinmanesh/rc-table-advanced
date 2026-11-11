import DateObjectImport from 'react-date-object';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorianEn from 'react-date-object/locales/gregorian_en';
import { getCalendarSystemConfig } from './date-picker.constants';
import type { DateCalendarSystem } from './date-picker.types';
import type { DateObject } from 'react-multi-date-picker';

const DateObjectConstructor: typeof DateObjectImport =
  (DateObjectImport as unknown as { default?: typeof DateObjectImport })
    .default ?? DateObjectImport;
export const toCanonicalDate = (date: DateObject): string =>
  new DateObjectConstructor(date)
    .convert(gregorian, gregorianEn)
    .format('YYYY-MM-DD');

export const toDisplayDate = (
  value: string | undefined,
  system: DateCalendarSystem,
): DateObject | undefined => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new DateObjectConstructor({
    date: value,
    calendar: gregorian,
    locale: gregorianEn,
    format: 'YYYY-MM-DD',
  });
  if (!date.isValid || date.format('YYYY-MM-DD') !== value) return undefined;
  const config = getCalendarSystemConfig(system);
  return date.convert(config.calendar, config.locale);
};
