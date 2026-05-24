import type { BaseFiltersState, FilterValue } from './filters.types';

const MAX_DEPTH = 2;

const serializeUnsafe = (v: unknown, depth = 0): string => {
  if (depth > MAX_DEPTH) {
    return String(v ?? '');
  }

  if (Array.isArray(v)) {
    return JSON.stringify(v.map((item) => serializeUnsafe(item, depth + 1)));
  }

  if (typeof v === 'object' && v !== null) {
    const obj: Record<string, string> = {};
    for (const key in v) {
      if (Object.prototype.hasOwnProperty.call(v, key)) {
        obj[key] = serializeUnsafe(
          (v as Record<string, unknown>)[key],
          depth + 1,
        );
      }
    }
    return JSON.stringify(obj);
  }

  return String(v ?? '');
};

export const serialize = (v: unknown): string => {
  try {
    return serializeUnsafe(v);
  } catch {
    return '';
  }
};

const numberRegex = /^-?\d+(?:\.\d+)?$/;

export const deserialize = (s: string): unknown => {
  if (typeof s !== 'string') return s;

  if (s.startsWith('{') || s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s);

      if (Array.isArray(parsed)) {
        return parsed.map((item) =>
          typeof item === 'string' ? deserialize(item) : item,
        );
      }

      if (typeof parsed === 'object' && parsed !== null) {
        const obj: Record<string, unknown> = {};
        for (const key in parsed) {
          if (Object.prototype.hasOwnProperty.call(parsed, key)) {
            const val = parsed[key];
            obj[key] = typeof val === 'string' ? deserialize(val) : val;
          }
        }
        return obj;
      }

      return parsed;
    } catch {
      return s;
    }
  }

  if (s.includes(',')) {
    return s.split(',').map((v) => v.trim());
  }

  if (numberRegex.test(s)) {
    return Number(s);
  }

  return s;
};

export const calculateFilterCounts = <T extends BaseFiltersState>(
  filters: T,
  tableKey: string,
): number => {
  const prefix = tableKey ? `${tableKey}_` : '';
  return Object.entries(filters).reduce(
    (count: number, [key, value]: [string, FilterValue]) => {
      const hasValue =
        (prefix ? key.includes(prefix) : true) &&
        key !== `${prefix}page` &&
        key !== `${prefix}sort` &&
        key !== `${prefix}sortType` &&
        key !== `${prefix}pageSize` &&
        key !== `${prefix}hasError` &&
        value !== undefined &&
        value !== null &&
        value !== '';
      return count + (hasValue ? 1 : 0);
    },
    0,
  );
};

export const hasAnyFilters = <T extends BaseFiltersState>(filters: T): boolean =>
  Object.entries(filters).some(([key, value]: [string, FilterValue]) => {
    const isExcludedKey =
      key.endsWith('_page') ||
      key.endsWith('_sort') ||
      key.endsWith('_pageSize') ||
      key === 'page' ||
      key === 'sort' ||
      key === 'pageSize';

    if (isExcludedKey) {
      return false;
    }

    return (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    );
  });
