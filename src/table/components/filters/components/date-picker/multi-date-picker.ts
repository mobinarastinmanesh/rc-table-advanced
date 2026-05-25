import type { ComponentType } from 'react';
import MultiDatePickerImport from 'react-multi-date-picker';

type MultiDatePickerProps = Record<string, unknown>;

/**
 * CJS/ESM interop: Vite may expose the module namespace instead of the
 * default export.  In addition, the production Rollup build already resolves
 * the default through its own interop helper, so `MultiDatePickerImport` can
 * be the component itself (a forwardRef object, not a function).  Falling
 * back to the import as-is prevents a double-unwrap that would yield
 * `undefined`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const raw: any = MultiDatePickerImport;

export const MultiDatePicker: ComponentType<MultiDatePickerProps> =
  typeof raw === 'function'
    ? raw
    : (raw?.default ?? raw) as ComponentType<MultiDatePickerProps>;
