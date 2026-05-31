import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../constants';
import type { PaginationConfig, PaginationState } from './table.type';

export const getPaginationSnapshot = (
  pagination?: PaginationConfig,
): PaginationState => ({
  page: pagination?.page ?? DEFAULT_PAGE,
  pageSize: pagination?.pageSize ?? DEFAULT_PAGE_SIZE,
});
