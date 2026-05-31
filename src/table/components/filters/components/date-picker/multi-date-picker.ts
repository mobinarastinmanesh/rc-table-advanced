import type { ComponentType } from 'react';
import MultiDatePickerImport from 'react-multi-date-picker';

type MultiDatePickerProps = Record<string, unknown>;


function resolveMultiDatePicker(mod: any): ComponentType<MultiDatePickerProps> {
  if (!mod) {
    throw new Error(
      'react-multi-date-picker failed to load. Ensure it is installed.',
    );
  }

  if (typeof mod === 'function') {
    return mod;
  }

  if (typeof mod === 'object') {
    if ('default' in mod && mod.default) {
      return resolveMultiDatePicker(mod.default);
    }

    if ('exports' in mod && mod.exports) {
      return resolveMultiDatePicker(mod.exports);
    }

    // forwardRef components are plain objects with $$typeof
    if ('$$typeof' in mod) {
      return mod;
    }
  }

  return mod;
}

export const MultiDatePicker = resolveMultiDatePicker(MultiDatePickerImport);
