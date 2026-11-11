import { createContext } from 'react';
import type { TableSlots } from '../../table.type';
export const ErrorRendererContext =
  createContext<TableSlots['renderErrorCell']>(undefined);
