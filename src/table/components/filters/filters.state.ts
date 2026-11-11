import type { BaseFiltersState, FilterValue } from './filters.types';

export const isEmptyFilterValue = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.every(isEmptyFilterValue)) ||
  (typeof value === 'object' &&
    value !== null &&
    Object.values(value).every(isEmptyFilterValue));

export const isPreservedFilterKey = (key: string): boolean =>
  key === 'page' ||
  key === 'pageSize' ||
  key === 'sort' ||
  key.endsWith('_page') ||
  key.endsWith('_pageSize') ||
  key.endsWith('_sort');

export const buildNextFilters = <T extends BaseFiltersState>(
  current: T,
  key: keyof T,
  value: FilterValue,
): T => {
  if (isEmptyFilterValue(value)) {
    const next = { ...current };
    delete next[key];
    return next;
  }

  return { ...current, [key]: value } as T;
};

export const clearUserFilters = <T extends BaseFiltersState>(
  current: T,
  initial?: T,
): T => {
  const preserved = Object.fromEntries(
    Object.entries(current).filter(([key]) => isPreservedFilterKey(key)),
  ) as Partial<T>;

  return { ...(initial ?? {}), ...preserved } as T;
};

export const serializeFilters = <T extends BaseFiltersState>(
  filters: T,
): string =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(filters).sort(([a], [b]) => a.localeCompare(b)),
    ),
  );
