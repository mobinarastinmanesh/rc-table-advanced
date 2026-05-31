/**
 * Optional class names per UI region. Default `rcta-*` classes are always kept;
 * yours are merged on top via `clsx`.
 */
export type AdvancedTableClassNames = {
  /** Outer wrapper (`rcta-advanced-table`) */
  root?: string;
  /** Filters block (`rcta-filters`) */
  filterWrapper?: string;
  /** Filter toolbar row (`rcta-filters__bar`) */
  filterBar?: string;
  /** Search input */
  filterSearch?: string;
  /** Applied filter chips (`rcta-selected-filters`) */
  filterChips?: string;
  /** Table block (`rcta-table`) */
  tableWrapper?: string;
  /** Loading overlay */
  tableLoading?: string;
  /** Pagination row (`rcta-pagination`) */
  pagination?: string;
  /** Modal backdrop (`rcta-modal`) */
  modalOverlay?: string;
  /** Modal card (`rcta-modal__panel`) */
  modalPanel?: string;
  modalHeader?: string;
  modalBody?: string;
  modalFooter?: string;
  /** Drawer root (`rcta-drawer`) */
  drawer?: string;
  /** Drawer backdrop (`rcta-drawer__overlay`) */
  drawerOverlay?: string;
  /** Drawer side panel (`rcta-drawer__panel`) */
  drawerPanel?: string;
  drawerHeader?: string;
  drawerBody?: string;
  drawerFooter?: string;
  /** Drawer accordion section (`rcta-accordion`) */
  drawerAccordion?: string;
};

export type FilterModalClassNames = Pick<
  AdvancedTableClassNames,
  'modalOverlay' | 'modalPanel' | 'modalHeader' | 'modalBody' | 'modalFooter'
>;

export type DrawerFilterClassNames = Pick<
  AdvancedTableClassNames,
  | 'drawer'
  | 'drawerOverlay'
  | 'drawerPanel'
  | 'drawerHeader'
  | 'drawerBody'
  | 'drawerFooter'
  | 'drawerAccordion'
>;

export type TableClassNames = Pick<
  AdvancedTableClassNames,
  'tableWrapper' | 'tableLoading' | 'pagination'
>;

export type FiltersClassNames = Pick<
  AdvancedTableClassNames,
  'filterWrapper' | 'filterBar' | 'filterSearch' | 'filterChips'
>;
