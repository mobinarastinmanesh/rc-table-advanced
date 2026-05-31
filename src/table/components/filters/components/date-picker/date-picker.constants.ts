import arabic from 'react-date-object/calendars/arabic';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import arabic_ar from 'react-date-object/locales/arabic_ar';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian_fa from 'react-date-object/locales/gregorian_fa';
import arabic_fa from 'react-date-object/locales/arabic_fa';
import type { DateCalendarSystem } from './date-picker.types';
import type { TableDirection } from '../../../../table.direction';

export const DATE_FORMAT = 'YYYY/MM/DD';

export const calendarSystemLabels: Record<DateCalendarSystem, string> = {
  jalali: 'Jalali (Persian)',
  gregorian: 'Gregorian',
  hijri: 'Hijri (Islamic Lunar)',
};

export const getCalendarSystemLabels = (
  labels: Record<'calendarJalali' | 'calendarGregorian' | 'calendarHijri', string>,
): Record<DateCalendarSystem, string> => ({
  jalali: labels.calendarJalali,
  gregorian: labels.calendarGregorian,
  hijri: labels.calendarHijri,
});

export const calendarSystemConfigs = {
  jalali: {
    calendar: persian,
    locale: persian_fa,
    weekDays: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
    weekStartDayIndex: 6,
  },
  gregorian: {
    calendar: gregorian,
    locale: gregorian_en,
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekStartDayIndex: 0,
  },
  hijri: {
    calendar: arabic,
    locale: arabic_ar,
    weekDays: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
    weekStartDayIndex: 0,
  },
} as const;

const rtlWeekDays = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'] as const;

const rtlLocales: Record<DateCalendarSystem, typeof persian_fa> = {
  jalali: persian_fa,
  gregorian: gregorian_fa,
  hijri: arabic_fa,
};

export const getCalendarSystemConfig = (
  system: DateCalendarSystem,
  dir: TableDirection = 'ltr',
) => {
  const config = calendarSystemConfigs[system];
  if (dir !== 'rtl') return config;

  return {
    ...config,
    locale: rtlLocales[system],
    weekDays: rtlWeekDays,
  };
};
