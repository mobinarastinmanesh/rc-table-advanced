import { FilterType, type DrawerFilterGroup, type FilterSchema } from 'rc-table-advanced';

export const filterModalSchema: FilterSchema[] = [
  {
    key: 'status',
    label: 'Status',
    type: FilterType.SINGLE_SELECT,
    options: [
      { label: 'Paid', value: 'paid' },
      { label: 'Draft', value: 'draft' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority badge',
    type: FilterType.SINGLE_BADGE_SELECT,
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Normal', value: 'normal' },
      { label: 'High', value: 'high' },
    ],
  },
  {
    key: 'receivers',
    label: 'Receivers (multi select)',
    type: FilterType.MULTIPLE_SELECT,
    options: [
      { label: 'Jane Cooper', value: 'narges' },
      { label: 'Cody Fisher', value: 'arsh' },
      { label: 'Esther Howard', value: 'sara' },
    ],
  },
  {
    key: 'tags',
    label: 'Tags (badge multi select)',
    type: FilterType.MULTIPLE_BADGE_SELECT,
    options: [
      { label: 'Refund', value: 'refund' },
      { label: 'Manual review', value: 'manual-review' },
      { label: 'VIP', value: 'vip' },
    ],
  },
  {
    key: 'amount',
    label: 'Amount range',
    type: FilterType.AMOUNT_RANGE,
    min: 0,
    max: 1000,
  },
  {
    key: 'createdAt',
    label: 'Date (Jalali / Miladi / Qamari)',
    type: FilterType.DATE_PICKER,
    calendarSystems: ['jalali', 'miladi', 'ghamari'],
  },
  {
    key: 'createdRange',
    label: 'Date range (multi-calendar)',
    type: FilterType.DATE_RANGE_PICKER,
    calendarSystems: ['jalali', 'miladi', 'ghamari'],
  },
];

export const drawerFilterGroups: DrawerFilterGroup[] = [
  {
    key: 'order',
    title: 'Order filters',
    schema: [
      {
        key: 'status',
        label: 'Status',
        type: FilterType.SINGLE_SELECT,
        options: [
          { label: 'Paid', value: 'paid' },
          { label: 'Draft', value: 'draft' },
        ],
      },
      {
        key: 'priority',
        label: 'Priority',
        type: FilterType.SINGLE_BADGE_SELECT,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Normal', value: 'normal' },
          { label: 'High', value: 'high' },
        ],
      },
      {
        key: 'receivers',
        label: 'Receivers',
        type: FilterType.MULTIPLE_SELECT,
        options: [
          { label: 'Jane Cooper', value: 'narges' },
          { label: 'Cody Fisher', value: 'arsh' },
          { label: 'Esther Howard', value: 'sara' },
        ],
      },
    ],
  },
  {
    key: 'dates',
    title: 'Date filters',
    schema: [
      {
        key: 'createdAt',
        label: 'Single date',
        type: FilterType.DATE_PICKER,
        calendarSystems: ['jalali', 'miladi', 'ghamari'],
      },
      {
        key: 'createdRange',
        label: 'Date range',
        type: FilterType.DATE_RANGE_PICKER,
        calendarSystems: ['jalali', 'miladi', 'ghamari'],
      },
    ],
  },
  {
    key: 'meta',
    title: 'Other filters',
    schema: [
      {
        key: 'tags',
        label: 'Tags',
        type: FilterType.MULTIPLE_BADGE_SELECT,
        options: [
          { label: 'Refund', value: 'refund' },
          { label: 'Manual review', value: 'manual-review' },
          { label: 'VIP', value: 'vip' },
        ],
      },
      {
        key: 'amount',
        label: 'Amount',
        type: FilterType.AMOUNT_RANGE,
        min: 0,
        max: 1000,
      },
    ],
  },
];

export const persianFilterModalSchema: FilterSchema[] = [
  {
    key: 'status',
    label: 'وضعیت',
    type: FilterType.SINGLE_SELECT,
    options: [
      { label: 'پرداخت‌شده', value: 'paid' },
      { label: 'پیش‌نویس', value: 'draft' },
    ],
  },
  {
    key: 'priority',
    label: 'اولویت',
    type: FilterType.SINGLE_BADGE_SELECT,
    options: [
      { label: 'کم', value: 'low' },
      { label: 'معمولی', value: 'normal' },
      { label: 'زیاد', value: 'high' },
    ],
  },
  {
    key: 'receivers',
    label: 'گیرندگان (چند انتخابی)',
    type: FilterType.MULTIPLE_SELECT,
    options: [
      { label: 'نرگس احمدی', value: 'narges' },
      { label: 'آرش رضایی', value: 'arsh' },
      { label: 'سارا موسوی', value: 'sara' },
    ],
  },
  {
    key: 'tags',
    label: 'برچسب‌ها (چند انتخابی)',
    type: FilterType.MULTIPLE_BADGE_SELECT,
    options: [
      { label: 'استرداد', value: 'refund' },
      { label: 'بررسی دستی', value: 'manual-review' },
      { label: 'ویژه', value: 'vip' },
    ],
  },
  {
    key: 'amount',
    label: 'بازه مبلغ',
    type: FilterType.AMOUNT_RANGE,
    min: 0,
    max: 1000,
  },
  {
    key: 'createdAt',
    label: 'تاریخ (شمسی / میلادی / قمری)',
    type: FilterType.DATE_PICKER,
    calendarSystems: ['jalali', 'miladi', 'ghamari'],
  },
  {
    key: 'createdRange',
    label: 'بازه تاریخ (چند تقویم)',
    type: FilterType.DATE_RANGE_PICKER,
    calendarSystems: ['jalali', 'miladi', 'ghamari'],
  },
];

export const persianDrawerFilterGroups: DrawerFilterGroup[] = [
  {
    key: 'order',
    title: 'فیلترهای سفارش',
    schema: [
      {
        key: 'status',
        label: 'وضعیت',
        type: FilterType.SINGLE_SELECT,
        options: [
          { label: 'پرداخت‌شده', value: 'paid' },
          { label: 'پیش‌نویس', value: 'draft' },
        ],
      },
      {
        key: 'priority',
        label: 'اولویت',
        type: FilterType.SINGLE_BADGE_SELECT,
        options: [
          { label: 'کم', value: 'low' },
          { label: 'معمولی', value: 'normal' },
          { label: 'زیاد', value: 'high' },
        ],
      },
      {
        key: 'receivers',
        label: 'گیرندگان',
        type: FilterType.MULTIPLE_SELECT,
        options: [
          { label: 'نرگس احمدی', value: 'narges' },
          { label: 'آرش رضایی', value: 'arsh' },
          { label: 'سارا موسوی', value: 'sara' },
        ],
      },
    ],
  },
  {
    key: 'dates',
    title: 'فیلترهای تاریخ',
    schema: [
      {
        key: 'createdAt',
        label: 'تاریخ تکی',
        type: FilterType.DATE_PICKER,
        calendarSystems: ['jalali', 'miladi', 'ghamari'],
      },
      {
        key: 'createdRange',
        label: 'بازه تاریخ',
        type: FilterType.DATE_RANGE_PICKER,
        calendarSystems: ['jalali', 'miladi', 'ghamari'],
      },
    ],
  },
  {
    key: 'meta',
    title: 'سایر فیلترها',
    schema: [
      {
        key: 'tags',
        label: 'برچسب‌ها',
        type: FilterType.MULTIPLE_BADGE_SELECT,
        options: [
          { label: 'استرداد', value: 'refund' },
          { label: 'بررسی دستی', value: 'manual-review' },
          { label: 'ویژه', value: 'vip' },
        ],
      },
      {
        key: 'amount',
        label: 'مبلغ',
        type: FilterType.AMOUNT_RANGE,
        min: 0,
        max: 1000,
      },
    ],
  },
];

export const persianLabels = {
  search: 'جستجو',
  sortNewest: 'جدیدترین',
  sortOldest: 'قدیمی‌ترین',
  sortPlaceholder: 'مرتب‌سازی',
  filtersButton: 'فیلترها',
  drawerFiltersButton: 'فیلترهای بیشتر',
  applyButton: 'اعمال',
  filtersModalTitle: 'فیلترها',
  modalClear: 'پاک کردن',
  modalApply: 'اعمال',
  drawerTitle: 'فیلترها',
  drawerSelectedCount: (count: number) =>
    count ? `${count} فیلتر فعال` : 'بدون فیلتر',
  drawerGroupSelectedCount: (count: number) => `${count} مورد`,
  drawerClearSection: 'حذف این بخش',
  drawerClearAll: 'حذف همه',
  drawerApply: 'اعمال',
  appliedFiltersLabel: 'فیلترهای فعال',
  clearAllFilters: 'حذف همه',
  paginationPrevious: 'قبلی',
  paginationNext: 'بعدی',
  paginationPageInfo: (page: number, totalPages?: number) =>
    totalPages ? `صفحه ${page} از ${totalPages}` : `صفحه ${page}`,
  paginationRowsPerPage: 'تعداد در هر صفحه',
  selectAll: 'همه',
  selectPlaceholder: 'انتخاب کنید',
  amountMin: 'از',
  amountMax: 'تا',
  calendarJalali: 'شمسی',
  calendarMiladi: 'میلادی',
  calendarGhamari: 'قمری',
  close: 'بستن',
  drawerExpandEmpty: 'باز کردن',
  emptyText: 'داده‌ای نیست',
  loading: 'در حال بارگذاری…',
};
