import { useMemo, useState, type ComponentProps } from 'react';
import {
  AdvancedTable,
  TableCell,
  type AdvancedTableLabels,
  type DrawerFilterGroup,
  type FilterSchema,
  type PaginationState,
  type TableColumnType,
} from 'rc-table-advanced';
import type { AdvancedTableClassNames } from '../../src/table/table.class-names';
import {
  drawerFilterGroups,
  filterModalSchema,
  persianDrawerFilterGroups,
  persianFilterModalSchema,
} from './demo-config';
import {
  demoRecords,
  filterDemoRecords,
  getReceiverDisplayName,
  getReceiverErrorMessage,
  type DemoFilters,
  type DemoRecord,
} from './demo-data';

type TableProps = ComponentProps<typeof AdvancedTable<DemoRecord, DemoFilters>> & {
  classNames?: AdvancedTableClassNames;
  labels?: Partial<AdvancedTableLabels>;
};

const DemoTable = (props: TableProps) => <AdvancedTable {...props} />;

const statusLabelFa: Record<string, string> = {
  paid: 'پرداخت‌شده',
  draft: 'پیش‌نویس',
};

const priorityLabelFa: Record<string, string> = {
  low: 'کم',
  normal: 'معمولی',
  high: 'زیاد',
};

const tagLabelFa: Record<string, string> = {
  vip: 'ویژه',
  refund: 'استرداد',
  'manual-review': 'بررسی دستی',
};

const englishColumns: TableColumnType<DemoRecord>[] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 64 },
  {
    title: 'Receiver',
    dataIndex: 'name',
    key: 'name',
    render: (value) => <TableCell value={value} />,
  },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Priority', dataIndex: 'priority', key: 'priority' },
  {
    title: 'Tags',
    dataIndex: 'tags',
    key: 'tags',
    render: (tags: string[]) => tags?.join(', ') || '—',
  },
  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
  { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
];

const persianColumns: TableColumnType<DemoRecord>[] = [
  { title: 'شناسه', dataIndex: 'id', key: 'id', width: 64 },
  {
    title: 'گیرنده',
    dataIndex: 'name',
    key: 'name',
    render: (_, record) => (
      <TableCell
        value={{
          ...record.name,
          value: getReceiverDisplayName(record, 'fa'),
          message: getReceiverErrorMessage(record, 'fa'),
        }}
      />
    ),
  },
  {
    title: 'وضعیت',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => statusLabelFa[status] ?? status,
  },
  {
    title: 'اولویت',
    dataIndex: 'priority',
    key: 'priority',
    render: (priority: string) => priorityLabelFa[priority] ?? priority,
  },
  {
    title: 'برچسب‌ها',
    dataIndex: 'tags',
    key: 'tags',
    render: (tags: string[]) =>
      tags?.map((tag) => tagLabelFa[tag] ?? tag).join('، ') || '—',
  },
  { title: 'مبلغ', dataIndex: 'amount', key: 'amount' },
  { title: 'تاریخ ایجاد', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
];

export type DemoTableSectionProps = {
  title: string;
  description: string;
  classNames?: AdvancedTableClassNames;
  className?: string;
  labels?: Partial<AdvancedTableLabels>;
  dir?: 'rtl' | 'ltr';
  columns?: TableColumnType<DemoRecord>[];
  filterModalSchema?: FilterSchema[];
  drawerFilterGroups?: DrawerFilterGroup[];
};

export function DemoTableSection({
  title,
  description,
  classNames,
  className,
  labels,
  dir = 'ltr',
  columns: columnsProp,
  filterModalSchema: filterModalSchemaProp,
  drawerFilterGroups: drawerFilterGroupsProp,
}: DemoTableSectionProps) {
  const [filters, setFilters] = useState<DemoFilters>({});
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 5,
  });

  const isRtl = dir === 'rtl';
  const columns =
    columnsProp ?? (isRtl ? persianColumns : englishColumns);
  const modalSchema =
    filterModalSchemaProp ?? (isRtl ? persianFilterModalSchema : filterModalSchema);
  const drawerGroups =
    drawerFilterGroupsProp ??
    (isRtl ? persianDrawerFilterGroups : drawerFilterGroups);

  const filteredData = useMemo(
    () => filterDemoRecords(demoRecords, filters),
    [filters],
  );

  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return filteredData.slice(start, start + pagination.pageSize);
  }, [filteredData, pagination]);

  return (
    <section className="demo-section" dir={dir}>
      <header className="demo-section__header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <DemoTable
        className={className}
        classNames={classNames}
        columns={columns}
        data={paginatedData}
        dir={dir}
        drawerFilterGroups={drawerGroups}
        filterModalSchema={modalSchema}
        filters={filters}
        labels={labels}
        pagination={{
          ...pagination,
          total: filteredData.length,
          pageSizeOptions: [{ value: 5 }, { value: 10 }, { value: 20 }],
        }}
        realTimeSearch
        rowKey="id"
        showSizeChanger
        onFiltersChange={(nextFilters) => {
          setFilters(nextFilters);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
        onChange={(change) => {
          if ('paginationChanged' in change && change.paginationChanged) {
            setPagination(change.pagination);
          }
        }}
      />
    </section>
  );
}
