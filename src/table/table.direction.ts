import { createContext, useContext } from 'react';

export type TableDirection = 'ltr' | 'rtl';

const TableDirectionContext = createContext<TableDirection>('ltr');

export const TableDirectionProvider = TableDirectionContext.Provider;

export const useTableDirection = (): TableDirection =>
  useContext(TableDirectionContext);
