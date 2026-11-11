import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import './setup-dom.mjs';
import { createElement as h } from 'react';
import {
  render,
  cleanup,
  fireEvent,
  act,
  renderHook,
} from '@testing-library/react';
import {
  Filters,
  FilterMode,
  FilterType,
  AdvancedTable,
  useQueryControl,
  serialize,
} from '../../src/index.ts';
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/orders');
});
const show = (filters, schema = []) =>
  render(
    h(Filters, {
      filters,
      filterModalSchema: schema,
      hasSearch: false,
      hasSort: false,
      setFilters() {},
      applyFilter() {},
      changeMode: FilterMode.ON_CHANGE,
    }),
  );
test('chips render option titles, generic collections and every partial range', () => {
  const cases = [
    [
      { status: 'paid' },
      [
        {
          key: 'status',
          label: 'Status',
          type: FilterType.SINGLE_SELECT,
          options: [{ value: 'paid', label: 'Paid', title: 'Settled' }],
        },
      ],
      'Status: Settled',
    ],
    [{ tags: ['a', 'b'] }, [], 'tags: a, b'],
    [{ custom: { min: 1, empty: '' } }, [], 'custom: min: 1'],
    [
      { amount: { min: 0, max: 2 } },
      [{ key: 'amount', label: 'Amount', type: FilterType.AMOUNT_RANGE }],
      'Amount: 0 - 2',
    ],
    [
      { amount: { min: 0 } },
      [{ key: 'amount', label: 'Amount', type: FilterType.AMOUNT_RANGE }],
      'Amount: from 0',
    ],
    [
      { amount: { max: 20 } },
      [{ key: 'amount', label: 'Amount', type: FilterType.AMOUNT_RANGE }],
      'Amount: to 20',
    ],
    [
      { date: { from: '2026-01-01', to: '2026-12-31' } },
      [{ key: 'date', label: 'Date', type: FilterType.DATE_RANGE_PICKER }],
      'Date: 2026-01-01 - 2026-12-31',
    ],
    [
      { status: 'unknown' },
      [
        {
          key: 'status',
          label: 'Status',
          type: FilterType.SINGLE_SELECT,
          options: [],
        },
      ],
      'Status: unknown',
    ],
    [{ status: true, empty: {}, other: [], blank: '' }, [], 'status: true'],
  ];
  for (const [filters, schema, text] of cases) {
    const view = show(filters, schema);
    assert.ok(view.getByRole('button', { name: text }));
    cleanup();
  }
});
test('search button and Enter apply once, while debounce collapses rapid edits and cancels on unmount', async () => {
  const changes = vi.fn();
  const view = render(
    h(AdvancedTable, {
      columns: [],
      data: [],
      onChange: changes,
      searchTrigger: 'button',
    }),
  );
  const input = view.getByRole('searchbox');
  fireEvent.change(input, { target: { value: 'one' } });
  assert.equal(changes.mock.calls.length, 0);
  fireEvent.keyDown(input, { key: 'a' });
  assert.equal(changes.mock.calls.length, 0);
  fireEvent.keyDown(input, { key: 'Enter' });
  assert.equal(changes.mock.calls.length, 1);
  fireEvent.click(view.getByRole('button', { name: 'Search' }));
  assert.equal(changes.mock.calls.length, 1);
  view.rerender(
    h(AdvancedTable, {
      columns: [],
      data: [],
      onChange: changes,
      searchTrigger: 'debounced',
      searchDebounceMs: 10,
    }),
  );
  fireEvent.change(input, { target: { value: 'two' } });
  fireEvent.change(input, { target: { value: 'three' } });
  await act(() => pause(30));
  assert.equal(changes.mock.calls.at(-1)[0].filters.query, 'three');
  assert.equal(changes.mock.calls.length, 2);
  fireEvent.change(input, { target: { value: 'cancelled' } });
  view.unmount();
  await act(() => pause(30));
  assert.equal(changes.mock.calls.length, 2);
});
test('legacy instant-search alias and explicit trigger priority work in AdvancedTable and Filters', () => {
  const changes = vi.fn();
  const view = render(
    h(AdvancedTable, {
      columns: [],
      data: [],
      onChange: changes,
      realTimeSearch: true,
    }),
  );
  fireEvent.change(view.getByRole('searchbox'), {
    target: { value: 'instant' },
  });
  assert.equal(changes.mock.calls.length, 1);
  cleanup();
  const set = vi.fn();
  const filters = render(
    h(Filters, {
      filters: { orders_query: 'before', hidden: true },
      tableKey: 'orders',
      excludedKeys: ['hidden'],
      setFilters: set,
      applyFilter() {},
      changeMode: FilterMode.ON_CHANGE,
      realTimeSearch: true,
      searchTrigger: 'button',
    }),
  );
  fireEvent.change(filters.getByRole('searchbox'), {
    target: { value: 'after' },
  });
  assert.equal(set.mock.calls.length, 0);
  fireEvent.keyDown(filters.getByRole('searchbox'), { key: 'Enter' });
  assert.deepEqual(set.mock.calls, [['orders_query', 'after']]);
  assert.equal(filters.queryByRole('button', { name: /hidden/ }), null);
});
test('submit-mode reset changes the draft and applies only when requested', () => {
  const changes = vi.fn();
  const view = render(
    h(AdvancedTable, {
      columns: [],
      data: [],
      onChange: changes,
      filterMode: FilterMode.ON_SUBMIT,
      searchTrigger: 'instant',
    }),
  );
  fireEvent.change(view.getByRole('searchbox'), { target: { value: 'draft' } });
  fireEvent.click(view.getByRole('button', { name: 'Clear all' }));
  assert.equal(changes.mock.calls.length, 0);
  fireEvent.change(view.getByRole('searchbox'), { target: { value: 'new' } });
  fireEvent.click(view.getByRole('button', { name: 'Apply', exact: true }));
  assert.deepEqual(changes.mock.calls[0][0].filters, { query: 'new' });
});
test('URL adapter ignores invalid pages, hydrates valid paging and preserves numeric legacy search strings', async () => {
  window.history.replaceState(null, '', '?query=00123&page=0&pageSize=10');
  const view = renderHook(() =>
    useQueryControl({}, { syncUrl: true, debounceMs: 5 }),
  );
  assert.equal(view.result.current.filters.query, '00123');
  assert.equal(view.result.current.filters.page, undefined);
  assert.equal(view.result.current.filters.pageSize, 10);
  act(() => view.result.current.setFilters('query', undefined));
  await act(() => pause(15));
  assert.equal(
    new URLSearchParams(window.location.search).has('rcta_query'),
    false,
  );
  const before = window.location.href;
  view.unmount();
  await act(() => pause(10));
  assert.equal(window.location.href, before);
});
test('controlled URL state accepts external updates and has no sync activity when disabled', async () => {
  const view = renderHook(
    ({ value, syncUrl }) =>
      useQueryControl({}, { value, syncUrl, keys: ['status'], debounceMs: 5 }),
    { initialProps: { value: { status: 'paid' }, syncUrl: false } },
  );
  const before = window.location.href;
  view.rerender({ value: { status: 'draft' }, syncUrl: false });
  await act(() => pause(15));
  assert.equal(window.location.href, before);
  view.rerender({ value: { status: 'draft' }, syncUrl: true });
  await act(() => pause(15));
  assert.equal(
    new URLSearchParams(window.location.search).get('rcta_status'),
    serialize('draft'),
  );
});
