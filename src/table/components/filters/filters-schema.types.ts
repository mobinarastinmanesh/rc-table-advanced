import type { ReactNode } from 'react';
import type { DateCalendarSystem } from './components/date-picker/date-picker.types';

export enum FilterType {
  SINGLE_BADGE_SELECT = 'single-badge-select',
  MULTIPLE_BADGE_SELECT = 'multi-badge-select',
  SINGLE_SELECT = 'single-select',
  MULTIPLE_SELECT = 'multiple-select',
  DATE_PICKER = 'date-picker',
  DATE_RANGE_PICKER = 'date-range-picker',
  AMOUNT_RANGE = 'amount-range',
  CUSTOM = 'custom',
}

export type DateFilterValue = string;
export type DateRangeFilterValue = { from?: string; to?: string };
export type AmountFilterValue = { min?: number; max?: number };
export type SingleSelectFilterValue = string;
export type MultiSelectFilterValue = string[];
export type FilterSchemaValue =
  | string
  | string[]
  | number
  | boolean
  | DateFilterValue
  | DateRangeFilterValue
  | AmountFilterValue
  | undefined;

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BaseFilterSchema<T extends FilterType, V = unknown> {
  type: T;
  key: string;
  label: string;
  defaultValue?: V;
  required?: boolean;
  helperText?: string;
  onChange?: (key: string, value: V) => void;
  render?: (props: {
    schema: BaseFilterSchema<T, V>;
    value: V | undefined;
    onChange: (value: V | undefined) => void;
  }) => ReactNode;
}

export interface DatePickerFilterSchema
  extends BaseFilterSchema<FilterType.DATE_PICKER, DateFilterValue> {
  calendarSystem?: DateCalendarSystem;
  calendarSystems?: DateCalendarSystem[];
  format?: string;
}

export interface DateRangeFilterSchema extends BaseFilterSchema<
  FilterType.DATE_RANGE_PICKER,
  DateRangeFilterValue
> {
  calendarSystem?: DateCalendarSystem;
  calendarSystems?: DateCalendarSystem[];
  format?: string;
}

export interface AmountRangeFilterSchema extends BaseFilterSchema<
  FilterType.AMOUNT_RANGE,
  AmountFilterValue
> {
  min?: number;
  max?: number;
}

export interface SingleBadgeSelectFilterSchema extends BaseFilterSchema<
  FilterType.SINGLE_BADGE_SELECT,
  SingleSelectFilterValue
> {
  options: Option[];
}

export interface MultiBadgeSelectFilterSchema extends BaseFilterSchema<
  FilterType.MULTIPLE_BADGE_SELECT,
  MultiSelectFilterValue
> {
  options: Option[];
}

export type SingleSelectOptions = {
  label: string;
  title?: string;
  sub?: string;
  secondarySub?: string;
  value: string;
  disabled?: boolean;
};

export interface SingleSelectFilterSchema
  extends BaseFilterSchema<FilterType.SINGLE_SELECT, SingleSelectFilterValue> {
  options: (SingleSelectOptions | Option)[];
}

export interface MultiSelectFilterSchema
  extends BaseFilterSchema<FilterType.MULTIPLE_SELECT, MultiSelectFilterValue> {
  options: Option[];
}

export interface CustomFilterSchema
  extends Omit<BaseFilterSchema<FilterType.CUSTOM, FilterSchemaValue>, 'render'> {
  render: NonNullable<BaseFilterSchema<FilterType.CUSTOM, FilterSchemaValue>['render']>;
}

export type FilterSchema =
  | DatePickerFilterSchema
  | DateRangeFilterSchema
  | AmountRangeFilterSchema
  | SingleBadgeSelectFilterSchema
  | MultiBadgeSelectFilterSchema
  | SingleSelectFilterSchema
  | MultiSelectFilterSchema
  | CustomFilterSchema;

export type FiltersFormValues = Record<string, FilterSchemaValue>;

export type FilterRenderProps = {
  schema: FilterSchema;
  value: FilterSchemaValue | undefined;
  onChange: (value: FilterSchemaValue | undefined) => void;
};
