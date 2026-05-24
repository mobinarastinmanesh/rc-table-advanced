import { useMemo, useState } from 'react';
import AdvancedTable from '../table/advanced-table';
import { FilterType } from '../table/components/filters';
import TableCell from '../table/components/table-cell';
import type { PaginationState, TableColumnType } from '../table/table.type';
import {
  demoRecords,
  filterDemoRecords,
  type DemoFilters,
  type DemoRecord,
} from './demo-data';

const DemoTable = () => {
  const [filters, setFilters] = useState<DemoFilters>({});
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
  });

  const filteredData = useMemo(
    () => filterDemoRecords(demoRecords, filters),
    [filters],
  );

  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return filteredData.slice(start, start + pagination.pageSize);
  }, [filteredData, pagination]);

  const columns: TableColumnType<DemoRecord>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
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
  ];

  return (
    <main style={{ padding: 24 }}>
      <AdvancedTable<DemoRecord, DemoFilters>
        columns={columns}
        data={paginatedData}
        drawerFilterGroups={[
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
            ],
          },
        ]}
        filterModalSchema={[
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
            label: 'Receivers multi select',
            type: FilterType.MULTIPLE_SELECT,
            options: [
              { label: 'Jane Cooper', value: 'jane' },
              { label: 'Cody Fisher', value: 'cody' },
              { label: 'Esther Howard', value: 'esther' },
            ],
          },
          {
            key: 'tags',
            label: 'Tags badge multi select',
            type: FilterType.MULTIPLE_BADGE_SELECT,
            options: [
              { label: 'Refund', value: 'refund' },
              { label: 'Manual review', value: 'manual-review' },
              { label: 'VIP', value: 'vip' },
            ],
          },
          { key: 'amount', label: 'Amount', type: FilterType.AMOUNT_RANGE },
          {
            key: 'createdAt',
            label: 'Date',
            type: FilterType.DATE_PICKER,
            calendarSystems: ['jalali', 'miladi', 'ghamari'],
          },
          {
            key: 'createdRange',
            label: 'Date range',
            type: FilterType.DATE_RANGE_PICKER,
            calendarSystems: ['jalali', 'miladi', 'ghamari'],
          },
        ]}
        filters={filters}
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
        onChange={({ pagination: nextPagination, paginationChanged }) => {
          if (paginationChanged) {
            setPagination(nextPagination);
          }
        }}
      />
    </main>
  );
};

export default DemoTable;
