import type { BaseFiltersState, FiltersProps } from './filters.types';
import FiltersView from './filters.view';
import FiltersWrap from './filters.wrap';
import {
  TableDirectionProvider,
  useTableDirection,
} from '../../table.direction';

const Filters = <T extends BaseFiltersState>({
  dir,
  ...props
}: FiltersProps<T>) => {
  const inherited = useTableDirection();
  return (
    <TableDirectionProvider value={dir ?? inherited}>
      <FiltersWrap renderItem={FiltersView} dir={dir ?? inherited} {...props} />
    </TableDirectionProvider>
  );
};
export default Filters;
