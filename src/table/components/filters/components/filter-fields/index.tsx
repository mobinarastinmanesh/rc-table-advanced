import clsx from 'clsx';
import { useState } from 'react';
import type { DateObject } from 'react-multi-date-picker';
import { Dropdown } from '../../../ui/dropdown';
import DatePicker from '../date-picker/date-picker';
import {
  DATE_FORMAT,
  getCalendarSystemLabels,
} from '../date-picker/date-picker.constants';
import { useTableLabels } from '../../../../table.labels';
import RangeDatePicker from '../date-picker/range-date-picker';
import type { DateCalendarSystem } from '../date-picker/date-picker.types';
import type {
  AmountFilterValue,
  AmountRangeFilterSchema,
  DateFilterValue,
  DatePickerFilterSchema,
  DateRangeFilterSchema,
  DateRangeFilterValue,
  MultiBadgeSelectFilterSchema,
  MultiSelectFilterSchema,
  MultiSelectFilterValue,
  SingleBadgeSelectFilterSchema,
  SingleSelectFilterSchema,
  SingleSelectFilterValue,
} from '../../filters-schema.types';

type FilterFieldProps<TSchema, TValue> = {
  schema: TSchema;
  value: TValue | undefined;
  onChange: (value: TValue | undefined) => void;
};

const toOptionLabel = (option: { label: string; title?: string }) =>
  option.title ?? option.label;

const getCalendarSystems = (
  schema: DatePickerFilterSchema | DateRangeFilterSchema,
): DateCalendarSystem[] =>
  schema.calendarSystems?.length
    ? schema.calendarSystems
    : [schema.calendarSystem ?? 'jalali'];

const CalendarSystemSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: DateCalendarSystem;
  options: DateCalendarSystem[];
  onChange: (value: DateCalendarSystem) => void;
}) => {
  const labels = useTableLabels();
  const calendarLabels = getCalendarSystemLabels(labels);

  return options.length > 1 ? (
    <Dropdown
      ariaLabel={`${label} calendar`}
      options={options.map((item) => ({
        value: item,
        label: calendarLabels[item],
      }))}
      value={value}
      onChange={(next) => {
        if (typeof next === 'string') onChange(next as DateCalendarSystem);
      }}
    />
  ) : null;
};

export const SingleSelectFilter = ({
  schema,
  value,
  onChange,
}: FilterFieldProps<SingleSelectFilterSchema, SingleSelectFilterValue>) => {
  const labels = useTableLabels();

  return (
  <div className="rcta-field">
    <span className="rcta-field__label">{schema.label}</span>
    <Dropdown
      ariaLabel={schema.label}
      emptyOption={{ value: '', label: labels.selectAll }}
      options={schema.options.map((option) => ({
        value: option.value,
        label: toOptionLabel(option),
        disabled: option.disabled,
        title: 'title' in option ? option.title : undefined,
      }))}
      placeholder={labels.selectAll}
      value={value}
      onChange={(next) => {
        if (typeof next === 'string' && next) onChange(next);
        else onChange(undefined);
      }}
    />
  </div>
  );
};

export const MultipleSelectFilter = ({
  schema,
  value,
  onChange,
}: FilterFieldProps<MultiSelectFilterSchema, MultiSelectFilterValue>) => {
  const labels = useTableLabels();
  const selected = Array.isArray(value) ? value : [];

  return (
    <fieldset className="rcta-field">
      <legend>{schema.label}</legend>
      <Dropdown
        multiple
        ariaLabel={schema.label}
        options={schema.options.map((option) => ({
          value: option.value,
          label: option.label,
          disabled: option.disabled,
        }))}
        placeholder={labels.selectPlaceholder}
        value={selected}
        onChange={(next) => {
          if (Array.isArray(next)) onChange(next.length ? next : undefined);
          else onChange(undefined);
        }}
      />
    </fieldset>
  );
};

export const SingleBadgeSelectFilter = ({
  schema,
  value,
  onChange,
}: FilterFieldProps<SingleBadgeSelectFilterSchema, SingleSelectFilterValue>) => (
  <fieldset className="rcta-field">
    <legend>{schema.label}</legend>
    <div className="rcta-badge-list">
      {schema.options.map((option) => (
        <button
          key={option.value}
          className={clsx('rcta-chip', value === option.value && 'rcta-chip--selected')}
          disabled={option.disabled}
          type="button"
          onClick={() => onChange(value === option.value ? undefined : option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  </fieldset>
);

export const MultipleBadgeSelectFilter = ({
  schema,
  value,
  onChange,
}: FilterFieldProps<MultiBadgeSelectFilterSchema, MultiSelectFilterValue>) => {
  const selected = Array.isArray(value) ? value : [];

  return (
    <fieldset className="rcta-field">
      <legend>{schema.label}</legend>
      <div className="rcta-badge-list">
        {schema.options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              className={clsx('rcta-chip', isSelected && 'rcta-chip--selected')}
              disabled={option.disabled}
              type="button"
              onClick={() => {
                const next = isSelected
                  ? selected.filter((item) => item !== option.value)
                  : [...selected, option.value];
                onChange(next.length ? next : undefined);
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};

export const DatePickerFilter = ({
  schema,
  value,
  onChange,
}: FilterFieldProps<DatePickerFilterSchema, DateFilterValue>) => {
  const calendarSystems = getCalendarSystems(schema);
  const [calendarSystem, setCalendarSystem] = useState<DateCalendarSystem>(
    schema.calendarSystem ?? calendarSystems[0],
  );
  const format = schema.format ?? DATE_FORMAT;

  return (
    <fieldset className="rcta-field">
      <legend>{schema.label}</legend>
      <CalendarSystemSelect
        label={schema.label}
        options={calendarSystems}
        value={calendarSystem}
        onChange={setCalendarSystem}
      />
      <DatePicker
        key={calendarSystem}
        calendarSystem={calendarSystem}
        format={format}
        value={value || undefined}
        onChange={(selected) => {
          if (selected == null) {
            onChange(undefined);
            return;
          }
          const date = Array.isArray(selected) ? selected[0] : selected;
          if (!date || typeof (date as DateObject).format !== 'function') {
            onChange(undefined);
            return;
          }
          onChange((date as DateObject).format(format));
        }}
      />
    </fieldset>
  );
};

export const DateRangePickerFilter = ({
  schema,
  value,
  onChange,
}: FilterFieldProps<DateRangeFilterSchema, DateRangeFilterValue>) => {
  const calendarSystems = getCalendarSystems(schema);
  const [calendarSystem, setCalendarSystem] = useState<DateCalendarSystem>(
    schema.calendarSystem ?? calendarSystems[0],
  );
  const format = schema.format ?? DATE_FORMAT;

  return (
    <fieldset className="rcta-field">
      <legend>{schema.label}</legend>
      <CalendarSystemSelect
        label={schema.label}
        options={calendarSystems}
        value={calendarSystem}
        onChange={setCalendarSystem}
      />
      <div className="rcta-range">
        <RangeDatePicker
          key={calendarSystem}
          calendarSystem={calendarSystem}
          format={format}
          value={value}
          onChange={onChange}
        />
      </div>
    </fieldset>
  );
};

export const AmountRangeFilter = ({
  schema,
  value,
  onChange,
}: FilterFieldProps<AmountRangeFilterSchema, AmountFilterValue>) => {
  const labels = useTableLabels();
  const range = value ?? {};

  return (
    <fieldset className="rcta-field">
      <legend>{schema.label}</legend>
      <div className="rcta-range">
        <input
          className="rcta-input"
          min={schema.min}
          placeholder={labels.amountMin}
          type="number"
          value={range.min ?? ''}
          onChange={(event) =>
            onChange({
              ...range,
              min: event.target.value ? Number(event.target.value) : undefined,
            })
          }
        />
        <span className="rcta-range__separator" aria-hidden>
          –
        </span>
        <input
          className="rcta-input"
          max={schema.max}
          placeholder={labels.amountMax}
          type="number"
          value={range.max ?? ''}
          onChange={(event) =>
            onChange({
              ...range,
              max: event.target.value ? Number(event.target.value) : undefined,
            })
          }
        />
      </div>
    </fieldset>
  );
};
