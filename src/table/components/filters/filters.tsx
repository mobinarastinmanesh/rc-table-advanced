import type { BaseFiltersState, FiltersProps } from './filters.types';
import FiltersView from './filters.view';
import FiltersWrap from './filters.wrap';

const Filters = <T extends BaseFiltersState>(props: FiltersProps<T>) => (
  <FiltersWrap renderItem={FiltersView} {...props} />
);

export default Filters;
