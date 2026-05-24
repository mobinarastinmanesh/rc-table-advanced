import arabic from 'react-date-object/calendars/arabic';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import arabic_ar from 'react-date-object/locales/arabic_ar';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import persian_fa from 'react-date-object/locales/persian_fa';
import type { DateCalendarSystem } from './date-picker.types';

export const DATE_FORMAT = 'YYYY/MM/DD';

export const calendarSystemLabels: Record<DateCalendarSystem, string> = {
  jalali: 'Jalali (Shamsi)',
  miladi: 'Gregorian (Miladi)',
  ghamari: 'Hijri (Qamari)',
};

export const getCalendarSystemLabels = (
  labels: Record<'calendarJalali' | 'calendarMiladi' | 'calendarGhamari', string>,
): Record<DateCalendarSystem, string> => ({
  jalali: labels.calendarJalali,
  miladi: labels.calendarMiladi,
  ghamari: labels.calendarGhamari,
});

export const calendarSystemConfigs = {
  jalali: {
    calendar: persian,
    locale: persian_fa,
    weekDays: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
    weekStartDayIndex: 6,
  },
  miladi: {
    calendar: gregorian,
    locale: gregorian_en,
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekStartDayIndex: 0,
  },
  ghamari: {
    calendar: arabic,
    locale: arabic_ar,
    weekDays: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
    weekStartDayIndex: 0,
  },
} as const;
