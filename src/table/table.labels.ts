import { createContext, useContext } from 'react';

export type AdvancedTableLabels = {
  previousMonth: string;
  nextMonth: string;
  requiredField: string;
  invalidRange: string;
  invalidValue: string;
  filteredItemCount: (count: number) => string;
  search: string;
  sortNewest: string;
  sortOldest: string;
  sortPlaceholder: string;
  filtersButton: string;
  drawerFiltersButton: string;
  applyButton: string;
  filtersModalTitle: string;
  modalClear: string;
  modalApply: string;
  drawerTitle: string;
  /** e.g. count => `${count} selected` */
  drawerSelectedCount: (count: number) => string;
  drawerGroupSelectedCount: (count: number) => string;
  drawerExpandEmpty: string;
  drawerClearSection: string;
  drawerClearAll: string;
  drawerApply: string;
  appliedFiltersLabel: string;
  clearAllFilters: string;
  paginationPrevious: string;
  paginationNext: string;
  paginationPageInfo: (page: number, totalPages?: number) => string;
  paginationRowsPerPage: string;
  emptyText: string;
  loading: string;
  selectPlaceholder: string;
  selectAll: string;
  amountMin: string;
  amountMax: string;
  close: string;
  loadingFilter: (label: string) => string;
  calendarJalali: string;
  calendarGregorian: string;
  calendarHijri: string;
};

export const DEFAULT_LABELS: AdvancedTableLabels = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  requiredField: 'This field is required',
  invalidRange: 'Enter a valid range',
  invalidValue: 'Enter a valid value',
  filteredItemCount: (count) => `${count} results`,
  search: 'Search',
  sortNewest: 'Newest',
  sortOldest: 'Oldest',
  sortPlaceholder: 'Sort',
  filtersButton: 'Filters',
  drawerFiltersButton: 'Drawer filters',
  applyButton: 'Apply',
  filtersModalTitle: 'Filters',
  modalClear: 'Clear',
  modalApply: 'Apply filters',
  drawerTitle: 'Filter drawer',
  drawerSelectedCount: (count) => `${count} selected`,
  drawerGroupSelectedCount: (count) => `${count} selected`,
  drawerExpandEmpty: '+',
  drawerClearSection: 'Clear section',
  drawerClearAll: 'Clear all',
  drawerApply: 'Apply filters',
  appliedFiltersLabel: 'Applied filters',
  clearAllFilters: 'Clear all',
  paginationPrevious: 'Previous',
  paginationNext: 'Next',
  paginationPageInfo: (page, totalPages) =>
    totalPages ? `Page ${page} of ${totalPages}` : `Page ${page}`,
  paginationRowsPerPage: 'Rows per page',
  emptyText: 'No data',
  loading: 'Loading...',
  selectPlaceholder: 'Select…',
  selectAll: 'All',
  amountMin: 'Min',
  amountMax: 'Max',
  close: 'Close',
  loadingFilter: (label) => `Loading ${label}...`,
  calendarJalali: 'Jalali (Persian)',
  calendarGregorian: 'Gregorian',
  calendarHijri: 'Hijri (Islamic Lunar)',
};

export const mergeLabels = (
  partial?: Partial<AdvancedTableLabels>,
): AdvancedTableLabels => ({
  ...DEFAULT_LABELS,
  ...partial,
});

const LabelsContext = createContext<AdvancedTableLabels>(DEFAULT_LABELS);

export const LabelsProvider = LabelsContext.Provider;

export const useTableLabels = () => useContext(LabelsContext);
