# Calendars, localization and RTL

## Date value contract in v2

Date filters use **Gregorian date-only strings in `YYYY-MM-DD`**, independent of the visible calendar or locale. Ranges use `{ from?: string; to?: string }`. No UTC timestamp, time-of-day or timezone conversion is implied.

The picker can show Persian (`jalali`), Gregorian (`gregorian`) or conventional lunar Hijri (`hijri`). Switching calendars changes presentation while preserving the selected day. The default visible calendar remains Persian for compatibility.

```ts
const schema = {
  key: 'createdAt',
  label: 'Created at',
  type: FilterType.DATE_PICKER,
  calendarSystems: ['jalali', 'gregorian', 'hijri'],
  calendarSystem: 'gregorian',
  format: 'YYYY/MM/DD', // display only; emitted value stays YYYY-MM-DD
};
```

`toDisplayDate(canonicalValue, calendar)` creates a calendar-aware DateObject; `toCanonicalDate(dateObject)` returns a Gregorian ASCII date string. Invalid canonical dates return `undefined` from `toDisplayDate`.

When building server ranges, define inclusivity and the business timezone in your API. Do not convert a date-only string to an instant without that policy. The upstream Hijri calendar is calculated and can differ from local moon-sighting calendars; validate suitability for your use case.

## RTL and labels

Set `dir="rtl"`. The default drawer edge becomes left (right in LTR); `drawerPlacement` overrides it. Override copy with `labels`, including date navigation and validation messages. Use `LabelsProvider` and `TableDirectionProvider` when composing primitives outside `AdvancedTable`.

```tsx
<AdvancedTable
  columns={columns}
  data={rows}
  dir="rtl"
  labels={{
    search: 'جستجو',
    filtersButton: 'فیلترها',
    previousMonth: 'ماه قبل',
    nextMonth: 'ماه بعد',
    requiredField: 'تکمیل این فیلد الزامی است',
    invalidRange: 'بازه معتبر وارد کنید',
    paginationPrevious: 'قبلی',
    paginationNext: 'بعدی',
  }}
/>
```

Calendar locale defaults are provided by the upstream picker; translating table labels does not translate every upstream calendar string. A fully custom picker can be supplied through a custom filter.
