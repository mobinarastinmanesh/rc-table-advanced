'use client';
import { useState } from 'react';
import { AdvancedTable, FilterType } from 'rc-table-advanced/core';
const rows = [
  { id: 1, name: 'Jane SSR' },
  { id: 2, name: 'Sara SSR' },
];
export function Orders() {
  const [filters, setFilters] = useState<{
    query?: string;
    createdAt?: string;
  }>({ createdAt: '2026-11-11' });
  return (
    <>
      <output aria-label="Stored date">{filters.createdAt}</output>
      <AdvancedTable
        rowKey="id"
        columns={[{ title: 'Name', dataIndex: 'name' }]}
        data={rows.filter((row) =>
          row.name.toLowerCase().includes((filters.query ?? '').toLowerCase()),
        )}
        filterModalSchema={[
          {
            key: 'createdAt',
            label: 'Created',
            type: FilterType.DATE_PICKER,
            calendarSystem: 'gregorian',
            calendarSystems: ['gregorian', 'jalali', 'hijri'],
          },
        ]}
        filters={filters}
        onFiltersChange={setFilters}
        hasSort={false}
        searchTrigger="instant"
      />
    </>
  );
}
