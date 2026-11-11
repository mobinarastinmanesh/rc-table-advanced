import type { BaseFiltersState } from './filters.types';
import { isEmptyFilterValue, isPreservedFilterKey } from './filters.state';

const PREFIX = '~rcta1:';
export const serialize = (value: unknown): string => {
  try {
    const json = JSON.stringify(value);
    return json === undefined ? '' : PREFIX + json;
  } catch {
    return '';
  }
};

/** Reads versioned values and legacy v1 links. Only legacy values infer types. */
export const deserialize = (value: string): unknown => {
  if (value.startsWith(PREFIX)) {
    try {
      return JSON.parse(value.slice(PREFIX.length));
    } catch {
      return value;
    }
  }
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed))
        return parsed.map((item) =>
          typeof item === 'string' ? deserialize(item) : item,
        );
      if (parsed && typeof parsed === 'object') {
        return Object.fromEntries(
          Object.entries(parsed).map(([key, item]) => [
            key,
            typeof item === 'string' ? deserialize(item) : item,
          ]),
        );
      }
      return parsed;
    } catch {
      return value;
    }
  }
  if (value.includes(',')) return value.split(',').map((item) => item.trim());
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return value;
};

export const calculateFilterCounts = <T extends BaseFiltersState>(
  filters: T,
  tableKey = '',
): number => {
  const prefix = tableKey ? `${tableKey}_` : '';
  return Object.entries(filters).filter(
    ([key, value]) =>
      (!prefix || key.startsWith(prefix)) &&
      !isPreservedFilterKey(key) &&
      key !== `${prefix}sortType` &&
      key !== `${prefix}hasError` &&
      !isEmptyFilterValue(value),
  ).length;
};
export const hasAnyFilters = <T extends BaseFiltersState>(
  filters: T,
): boolean => calculateFilterCounts(filters) > 0;
