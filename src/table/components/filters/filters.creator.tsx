import FilterRenderer from './filter-renderer';
import { useTableLabels } from '../../table.labels';
import type {
  BaseFiltersState,
  FilterValue,
  InlineFilterSchema,
} from './filters.types';

const InlineField = <T extends BaseFiltersState>({
  schema,
  value,
  setFilters,
}: {
  schema: InlineFilterSchema<T>;
  value: FilterValue;
  setFilters: (key: keyof T, value: FilterValue) => void;
}) => {
  const labels = useTableLabels();
  if (schema.isLoading)
    return (
      <span className="rcta-chip">{labels.loadingFilter(schema.label)}</span>
    );
  return (
    <FilterRenderer
      schema={schema}
      value={value}
      onChange={(key, next) => setFilters(key as keyof T, next)}
    />
  );
};

export const createFilterChildren = <T extends BaseFiltersState>(
  otherFilters: InlineFilterSchema<T>[] | undefined,
  filters: T,
  setFilters: (key: keyof T, value: FilterValue) => void,
) =>
  (otherFilters ?? []).map((schema) => (
    <InlineField
      key={schema.key}
      schema={schema}
      value={filters[schema.key] ?? schema.defaultValue}
      setFilters={setFilters}
    />
  ));

/** @deprecated Compose Filters with otherFilters instead. */
export const filterCreator = <T extends object>(
  schema: InlineFilterSchema<T>,
) => (
  <FilterRenderer
    schema={schema}
    value={schema.defaultValue}
    onChange={() => {}}
  />
);
