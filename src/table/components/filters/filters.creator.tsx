import React from 'react';
import type { DateObject } from 'react-multi-date-picker';
import { Dropdown } from '../ui/dropdown';
import DatePicker from './components/date-picker/date-picker';
import { DATE_FORMAT } from './components/date-picker/date-picker.constants';
import RangeDatePicker from './components/date-picker/range-date-picker';
import { useTableLabels } from '../../table.labels';
import {
  FilterType,
  type BaseFiltersState,
  type FilterValue,
  type InlineFilterSchema,
} from './filters.types';

const isDateObject = (value: unknown): value is DateObject =>
  value != null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  typeof (value as DateObject).format === 'function';

type FilterCreatorProps<T> = Omit<InlineFilterSchema<T>, 'key'> & {
  fieldKey: string;
  defaultValue?: FilterValue;
};

const FilterCreator = <T,>({
  type,
  options,
  fieldKey,
  label,
  onChange,
  defaultValue,
  isLoading,
}: FilterCreatorProps<T>) => {
  const labels = useTableLabels();

  if (isLoading) {
    return <span className="rcta-chip">{labels.loadingFilter(label)}</span>;
  }

  if (type === FilterType.MULTIPLE_SELECT) {
    const selected = Array.isArray(defaultValue) ? defaultValue : [];

    return (
      <div className="rcta-filter-control">
        <span className="rcta-field__label">{label}</span>
        <Dropdown
          multiple
          ariaLabel={label}
          options={(options ?? []).map((option) => ({
            value: option.value,
            label: option.label,
            disabled: option.disabled,
          }))}
          placeholder={labels.selectPlaceholder}
          value={selected}
          onChange={(next) => {
            const value = Array.isArray(next) ? next : [];
            onChange?.(fieldKey as keyof T, value.length ? value : undefined);
          }}
        />
      </div>
    );
  }

  if (type === FilterType.SINGLE_SELECT) {
    return (
      <div className="rcta-filter-control">
        <span className="rcta-field__label">{label}</span>
        <Dropdown
          ariaLabel={label}
          emptyOption={{ value: '', label: labels.selectAll }}
          options={(options ?? []).map((option) => ({
            value: option.value,
            label: option.label,
            disabled: option.disabled,
          }))}
          placeholder={labels.selectAll}
          value={(defaultValue as string | undefined) ?? ''}
          onChange={(next) =>
            onChange?.(
              fieldKey as keyof T,
              typeof next === 'string' && next ? next : undefined,
            )
          }
        />
      </div>
    );
  }

  if (type === FilterType.DATE_RANGE_PICKER) {
    const value =
      typeof defaultValue === 'object' && defaultValue !== null
        ? (defaultValue as { from?: string; to?: string })
        : {};

    return (
      <fieldset className="rcta-filter-control">
        <legend>{label}</legend>
        <RangeDatePicker
          format={DATE_FORMAT}
          value={value}
          onChange={(nextValue) => onChange?.(fieldKey as keyof T, nextValue)}
        />
      </fieldset>
    );
  }

  if (type === FilterType.DATE_PICKER) {
    return (
      <label className="rcta-filter-control">
        <span>{label}</span>
        <DatePicker
          format={DATE_FORMAT}
          value={typeof defaultValue === 'string' ? defaultValue : undefined}
          onChange={(selected) => {
            if (selected == null) {
              onChange?.(fieldKey as keyof T, undefined);
              return;
            }
            const item = Array.isArray(selected) ? selected[0] : selected;
            if (!isDateObject(item)) {
              onChange?.(fieldKey as keyof T, undefined);
              return;
            }
            onChange?.(fieldKey as keyof T, item.format(DATE_FORMAT));
          }}
        />
      </label>
    );
  }

  return null;
};

export const createFilterChildren = <T extends BaseFiltersState>(
  otherFilters: InlineFilterSchema<T>[] | undefined,
  filters: T,
  setFilters: (key: keyof T, value: FilterValue) => void,
) => {
  const children =
    otherFilters?.map((filter) => {
      const { key: fieldKey, ...rest } = filter;
      return (
        <FilterCreator
          key={fieldKey}
          fieldKey={fieldKey}
          {...rest}
          defaultValue={filters[fieldKey as keyof T] as FilterValue}
          onChange={(changeKey: keyof T, value: FilterValue) => {
            setFilters(changeKey, value);
          }}
        />
      );
    }) ?? [];

  return React.Children.toArray(children).filter((child) =>
    React.isValidElement(child),
  );
};

/** @deprecated Internal helper — use inline filters via `otherFilters` on `Filters`. */
export const filterCreator = <T,>(
  props: InlineFilterSchema<T> & { defaultValue?: FilterValue },
) => {
  const { key: fieldKey, ...rest } = props;
  return <FilterCreator fieldKey={fieldKey} {...rest} />;
};
