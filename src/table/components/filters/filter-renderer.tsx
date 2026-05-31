import type { ReactNode } from 'react';
import {
  AmountRangeFilter,
  DatePickerFilter,
  DateRangePickerFilter,
  MultipleBadgeSelectFilter,
  MultipleSelectFilter,
  SingleBadgeSelectFilter,
  SingleSelectFilter,
} from './components/filter-fields';
import type {
  AmountFilterValue,
  DateRangeFilterValue,
  FilterRenderProps,
  FilterSchema,
  FilterSchemaValue,
} from './filters-schema.types';
import { FilterType } from './filters-schema.types';

export interface FilterRendererProps {
  schema: FilterSchema;
  value: FilterSchemaValue;
  onChange: (key: string, value: FilterSchemaValue) => void;
}

const getDateRangeValue = (
  value: FilterSchemaValue,
): DateRangeFilterValue | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? {
        from: 'from' in value ? value.from : undefined,
        to: 'to' in value ? value.to : undefined,
      }
    : undefined;

const getAmountRangeValue = (
  value: FilterSchemaValue,
): AmountFilterValue | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? {
        min: 'min' in value ? value.min : undefined,
        max: 'max' in value ? value.max : undefined,
      }
    : undefined;

const FilterRenderer = ({ schema, value, onChange }: FilterRendererProps) => {
  const setValue = (nextValue: FilterSchemaValue) => {
    onChange(schema.key, nextValue);
    schema.onChange?.(schema.key, nextValue as never);
  };

  if (schema.render) {
    const render = schema.render as (props: FilterRenderProps) => ReactNode;
    return render({
      schema,
      value,
      onChange: (nextValue) => setValue(nextValue as FilterSchemaValue),
    });
  }

  switch (schema.type) {
    case FilterType.SINGLE_SELECT:
      return (
        <SingleSelectFilter
          schema={schema}
          value={typeof value === 'string' ? value : undefined}
          onChange={setValue}
        />
      );
    case FilterType.MULTIPLE_SELECT:
      return (
        <MultipleSelectFilter
          schema={schema}
          value={Array.isArray(value) ? value : undefined}
          onChange={setValue}
        />
      );
    case FilterType.SINGLE_BADGE_SELECT:
      return (
        <SingleBadgeSelectFilter
          schema={schema}
          value={typeof value === 'string' ? value : undefined}
          onChange={setValue}
        />
      );
    case FilterType.MULTIPLE_BADGE_SELECT:
      return (
        <MultipleBadgeSelectFilter
          schema={schema}
          value={Array.isArray(value) ? value : undefined}
          onChange={setValue}
        />
      );
    case FilterType.DATE_PICKER:
      return (
        <DatePickerFilter
          schema={schema}
          value={typeof value === 'string' ? value : undefined}
          onChange={setValue}
        />
      );
    case FilterType.DATE_RANGE_PICKER:
      return (
        <DateRangePickerFilter
          schema={schema}
          value={getDateRangeValue(value)}
          onChange={setValue}
        />
      );
    case FilterType.AMOUNT_RANGE:
      return (
        <AmountRangeFilter
          schema={schema}
          value={getAmountRangeValue(value)}
          onChange={setValue}
        />
      );
    case FilterType.CUSTOM:
      return null;
    default:
      return null;
  }
};

export default FilterRenderer;
