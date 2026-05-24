import type { ComponentType } from 'react';
import MultiDatePickerImport from 'react-multi-date-picker';

type MultiDatePickerProps = Record<string, unknown>;

/**
 * CJS/ESM interop: Vite may expose the module namespace instead of the default export.
 */
export const MultiDatePicker: ComponentType<MultiDatePickerProps> =
  typeof MultiDatePickerImport === 'function'
    ? (MultiDatePickerImport as ComponentType<MultiDatePickerProps>)
    : (
        MultiDatePickerImport as {
          default: ComponentType<MultiDatePickerProps>;
        }
      ).default;
