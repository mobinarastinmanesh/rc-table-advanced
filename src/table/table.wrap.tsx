import type { TableWrapProps } from './table.type';

const TableWrap = <RecordType,>({
  renderItem,
  getData,
  pagination,
  columns,
  showSizeChanger,
  onChange,
  ...props
}: TableWrapProps<RecordType>) => {
  const currentPageSize = pagination?.pageSize ?? 10;

  const handlePageChange = (page: number) => {
    getData?.(page, currentPageSize);
    onChange?.({ pagination: { page, pageSize: currentPageSize } });
  };

  const handlePageSizeChange = (pageSize: number) => {
    getData?.(1, pageSize);
    onChange?.({ pagination: { page: 1, pageSize } });
  };

  return renderItem({
    showSizeChanger,
    pagination,
    columns,
    onChange,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    ...props,
  });
};

export default TableWrap;
