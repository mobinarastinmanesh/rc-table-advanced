import type { FilterSchema, FiltersFormValues } from './filters-schema.types';
import { FilterType } from './filters-schema.types';
import { isEmptyFilterValue } from './filters.state';
import { toDisplayDate } from './components/date-picker/date-value';
import type { AdvancedTableLabels } from '../../table.labels';

export const schemaDefaults = (schema: FilterSchema[]): FiltersFormValues =>
  Object.fromEntries(
    schema
      .filter((item) => item.defaultValue !== undefined)
      .map((item) => [item.key, item.defaultValue]),
  );

export const validateFilters = (
  schema: FilterSchema[],
  values: FiltersFormValues,
  labels: AdvancedTableLabels,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const item of schema) {
    const value = values[item.key];
    if (isEmptyFilterValue(value)) {
      if (item.required) errors[item.key] = labels.requiredField;
      continue;
    }
    const object =
      value !== null && typeof value === 'object' && !Array.isArray(value);
    if (
      ([FilterType.SINGLE_SELECT, FilterType.SINGLE_BADGE_SELECT].includes(
        item.type,
      ) &&
        typeof value !== 'string') ||
      ([FilterType.MULTIPLE_SELECT, FilterType.MULTIPLE_BADGE_SELECT].includes(
        item.type,
      ) &&
        (!Array.isArray(value) ||
          value.some((entry) => typeof entry !== 'string'))) ||
      ([FilterType.AMOUNT_RANGE, FilterType.DATE_RANGE_PICKER].includes(
        item.type,
      ) &&
        !object)
    ) {
      errors[item.key] = labels.invalidValue;
      continue;
    }
    if (
      item.type === FilterType.AMOUNT_RANGE &&
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const { min, max } = value as { min?: number; max?: number };
      if (
        [min, max].some(
          (n) =>
            n !== undefined &&
            (!Number.isFinite(n) ||
              (item.min !== undefined && n < item.min) ||
              (item.max !== undefined && n > item.max)),
        ) ||
        (min !== undefined && max !== undefined && min > max)
      )
        errors[item.key] = labels.invalidRange;
    }
    if (
      item.type === FilterType.DATE_PICKER &&
      (typeof value !== 'string' || !toDisplayDate(value, 'gregorian'))
    )
      errors[item.key] = labels.invalidRange;
    if (
      item.type === FilterType.DATE_RANGE_PICKER &&
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const { from, to } = value as { from?: string; to?: string };
      if (
        (from !== undefined &&
          (typeof from !== 'string' || !toDisplayDate(from, 'gregorian'))) ||
        (to !== undefined &&
          (typeof to !== 'string' || !toDisplayDate(to, 'gregorian'))) ||
        (from && to && from > to)
      )
        errors[item.key] = labels.invalidRange;
    }
  }
  return errors;
};
