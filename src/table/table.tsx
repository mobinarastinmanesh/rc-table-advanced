import type { DefaultRecordType } from 'rc-table/es/interface';
import type { AdvancedTableBaseProps } from './table.type';
import TableWrap from './table.wrap';
import TableView from './table.view';

const Table = <RecordType extends DefaultRecordType>({
  columns,
  pagination,
  getData,
  showSizeChanger,
  ...props
}: AdvancedTableBaseProps<RecordType>) => (
  <TableWrap<RecordType>
    renderItem={TableView<RecordType>}
    columns={columns}
    pagination={pagination}
    getData={getData}
    showSizeChanger={showSizeChanger}
    {...props}
  />
);

export default Table;
