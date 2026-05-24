import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_SORT, SORT_OPTIONS } from '../../../constants';
import type { Option } from './filters-schema.types';

export { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_SORT };

export const getSortOptions = (): Option[] =>
  SORT_OPTIONS.map((option) => ({ ...option }));
