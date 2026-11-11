import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import './setup-dom.mjs';
import { createElement as h, useState } from 'react';
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import {
  AdvancedTable,
  FilterModal,
  DrawerFilter,
  FilterType,
} from '../../src/index.ts';
import { useDialogA11y } from '../../src/hooks/use-dialog-a11y.ts';
const option = {
  key: 'status',
  label: 'Status',
  type: FilterType.SINGLE_SELECT,
  options: [
    { value: 'paid', label: 'Paid' },
    { value: 'draft', label: 'Draft' },
  ],
};
afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});
const select = (view, name) => {
  fireEvent.click(view.getByRole('combobox', { name: 'Status' }));
  fireEvent.click(view.getByRole('option', { name }));
};
test('modal snapshots on open, preserves a draft across prop rerenders, cancels and reloads applied state', () => {
  const apply = vi.fn(),
    close = vi.fn();
  const props = {
    open: true,
    schema: [option],
    values: { status: 'paid' },
    onApply: apply,
    onClose: close,
    dir: 'rtl',
    renderShell: ({ children }) =>
      h('section', { 'data-testid': 'shell' }, children),
  };
  const view = render(h(FilterModal, props));
  select(view, 'Draft');
  view.rerender(h(FilterModal, { ...props, values: { status: 'paid' } }));
  assert.equal(view.getByRole('combobox').textContent, 'Draft');
  fireEvent.click(view.getByRole('button', { name: 'Close' }));
  assert.equal(close.mock.calls.length, 1);
  assert.equal(apply.mock.calls.length, 0);
  view.rerender(h(FilterModal, { ...props, open: false }));
  view.rerender(h(FilterModal, props));
  assert.equal(view.getByRole('combobox').textContent, 'Paid');
  fireEvent.click(view.getByRole('button', { name: 'Clear' }));
  fireEvent.click(view.getByRole('button', { name: 'Apply filters' }));
  assert.deepEqual(apply.mock.calls, [[{}]]);
  fireEvent.click(view.getByRole('dialog'));
  assert.equal(close.mock.calls.length, 2);
  assert.ok(view.getByTestId('shell'));
});
for (const autoApplyOnClear of [false, true]) {
  test(`drawer group and whole-draft clear honor autoApplyOnClear=${autoApplyOnClear}`, () => {
    const apply = vi.fn();
    const props = {
      open: true,
      onClose() {},
      onApply: apply,
      autoApplyOnClear,
      dir: 'rtl',
      groups: [
        { key: 'a', title: 'Status group', schema: [option] },
        {
          key: 'b',
          title: 'More',
          schema: [
            {
              key: 'amount',
              label: 'Amount',
              type: FilterType.AMOUNT_RANGE,
              required: true,
            },
          ],
        },
      ],
      values: { status: 'paid', amount: { min: 10 } },
    };
    const view = render(h(DrawerFilter, props));
    select(view, 'Draft');
    fireEvent.click(view.getByRole('button', { name: 'Clear section' }));
    assert.equal(view.getByRole('combobox').textContent, 'All');
    assert.equal(apply.mock.calls.length, autoApplyOnClear ? 1 : 0);
    fireEvent.click(view.getByRole('button', { name: /More/ }));
    fireEvent.click(view.getByRole('button', { name: 'Clear all' }));
    assert.equal(apply.mock.calls.length, autoApplyOnClear ? 2 : 0);
    fireEvent.click(view.getByRole('button', { name: 'Apply filters' }));
    assert.equal(view.getByRole('alert').textContent, 'This field is required');
    fireEvent.change(view.getByRole('spinbutton', { name: 'Amount: Min' }), {
      target: { value: '0' },
    });
    fireEvent.click(view.getByRole('button', { name: 'Apply filters' }));
    assert.deepEqual(apply.mock.calls.at(-1), [{ amount: { min: 0 } }]);
  });
}
test('AdvancedTable applies modal values atomically and can remove a previously active schema key', () => {
  const changes = vi.fn();
  const view = render(
    h(AdvancedTable, {
      columns: [],
      data: [],
      initialFilters: { status: 'paid' },
      filterModalSchema: [option],
      onChange: changes,
    }),
  );
  fireEvent.click(view.getByRole('button', { name: /^Filters/ }));
  fireEvent.click(view.getByRole('button', { name: 'Clear', exact: true }));
  fireEvent.click(view.getByRole('button', { name: 'Apply filters' }));
  assert.equal(changes.mock.calls.length, 1);
  assert.deepEqual(changes.mock.calls[0][0].filters, {});
  assert.equal(view.queryByRole('dialog'), null);
});
test('controlled AdvancedTable drawer commits both field changes in one applied event', () => {
  const changes = vi.fn();
  function Controlled() {
    const [filters, setFilters] = useState({ status: 'paid' });
    return h(AdvancedTable, {
      columns: [],
      data: [],
      filters,
      onFiltersChange: setFilters,
      onChange: changes,
      drawerFilterGroups: [
        { key: 'orders', title: 'Orders', schema: [option] },
      ],
    });
  }
  const view = render(h(Controlled));
  fireEvent.click(view.getByRole('button', { name: 'Drawer filters' }));
  select(view, 'Draft');
  fireEvent.click(view.getByRole('button', { name: 'Apply filters' }));
  assert.deepEqual(changes.mock.calls[0][0].filters, { status: 'draft' });
  assert.equal(changes.mock.calls.length, 1);
  assert.ok(view.getByRole('button', { name: 'Status: Draft' }));
});
function FocusHarness({ onClose, closeOnBackdrop = true, empty = false }) {
  const { panelRef, titleId, handleBackdropClick } = useDialogA11y({
    open: true,
    onClose,
    closeOnBackdrop,
  });
  return h(
    'div',
    null,
    h('button', { onClick: handleBackdropClick }, 'Backdrop'),
    h(
      'div',
      {
        ref: panelRef,
        tabIndex: -1,
        'data-testid': 'panel',
        'data-rcta-dialog-panel': titleId,
      },
      empty
        ? null
        : [
            h('button', { key: 'first' }, 'First'),
            h('button', { key: 'last' }, 'Last'),
          ],
    ),
  );
}
test('focus trap wraps, recovers escaped focus, uses latest close callback and restores background state', async () => {
  const rects = vi
    .spyOn(HTMLElement.prototype, 'getClientRects')
    .mockImplementation(() => [new window.DOMRect(0, 0, 10, 10)]);
  const before = document.createElement('button');
  before.textContent = 'Outside';
  document.body.append(before);
  before.focus();
  document.body.style.overflow = 'scroll';
  const firstClose = vi.fn(),
    latestClose = vi.fn();
  const view = render(h(FocusHarness, { onClose: firstClose }));
  await act(
    () => new Promise((resolve) => window.requestAnimationFrame(resolve)),
  );
  assert.equal(
    document.activeElement,
    view.getByRole('button', { name: 'First' }),
  );
  const first = view.getByRole('button', { name: 'First' }),
    last = view.getByRole('button', { name: 'Last' });
  last.focus();
  fireEvent.keyDown(last, { key: 'Tab' });
  assert.equal(document.activeElement, first);
  fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
  assert.equal(document.activeElement, last);
  before.focus();
  fireEvent.keyDown(before, { key: 'Tab' });
  assert.equal(document.activeElement, first);
  last.focus();
  view.rerender(h(FocusHarness, { onClose: latestClose }));
  assert.equal(document.activeElement, last);
  fireEvent.keyDown(last, { key: 'Escape' });
  assert.equal(latestClose.mock.calls.length, 1);
  assert.equal(firstClose.mock.calls.length, 0);
  fireEvent.keyDown(last, { key: 'ArrowLeft' });
  view.unmount();
  assert.equal(document.activeElement, before);
  assert.equal(document.body.style.overflow, 'scroll');
  assert.notEqual(before.inert, true);
  before.remove();
  rects.mockRestore();
});
test('empty panels retain focus on Tab and backdrop close can be disabled', async () => {
  const close = vi.fn();
  const view = render(
    h(FocusHarness, { onClose: close, closeOnBackdrop: false, empty: true }),
  );
  await act(
    () => new Promise((resolve) => window.requestAnimationFrame(resolve)),
  );
  const event = new window.KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
  });
  view.getByTestId('panel').dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  fireEvent.click(view.getByRole('button', { name: 'Backdrop' }));
  assert.equal(close.mock.calls.length, 0);
});

test('an empty amount object is not counted as an active drawer filter, while zero is', () => {
  const view = render(
    h(DrawerFilter, {
      open: true,
      groups: [
        {
          key: 'amounts',
          title: 'Amount group',
          schema: [
            { key: 'amount', type: FilterType.AMOUNT_RANGE, label: 'Amount' },
          ],
        },
      ],
      values: { amount: {} },
      onApply() {},
      onClose() {},
    }),
  );
  assert.equal(view.queryByRole('button', { name: 'Clear section' }), null);
  fireEvent.change(view.getByRole('spinbutton', { name: 'Amount: Min' }), {
    target: { value: '0' },
  });
  assert.ok(view.getByRole('button', { name: 'Clear section' }));
  fireEvent.click(view.getByRole('button', { name: 'Clear section' }));
  assert.equal(view.queryByRole('button', { name: 'Clear section' }), null);
});
