import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import { forwardRef } from 'react';
afterEach(() => {
  vi.doUnmock('react-multi-date-picker');
  vi.resetModules();
});
for (const shape of ['function', 'default', 'exports', 'forwardRef']) {
  test(`date-picker import resolves ${shape} module exports`, async () => {
    const Component =
      shape === 'forwardRef' ? forwardRef(() => null) : () => null;
    const value =
      shape === 'default'
        ? { default: Component }
        : shape === 'exports'
          ? { exports: Component }
          : Component;
    vi.doMock('react-multi-date-picker', () => ({ default: value }));
    const { MultiDatePicker } =
      await import('../../src/table/components/filters/components/date-picker/multi-date-picker.ts');
    assert.equal(MultiDatePicker, Component);
  });
}
for (const value of [null, 'invalid', {}]) {
  test(`date-picker import rejects invalid module ${JSON.stringify(value)}`, async () => {
    vi.doMock('react-multi-date-picker', () => ({ default: value }));
    await assert.rejects(
      import('../../src/table/components/filters/components/date-picker/multi-date-picker.ts'),
      /failed to load|Invalid/,
    );
  });
}
