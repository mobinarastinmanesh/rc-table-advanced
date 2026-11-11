import assert from 'node:assert/strict';
import { afterEach, test } from 'vitest';
import './setup-dom.mjs';
const { createElement: h, useState, StrictMode } = await import('react');
const { render, renderHook, fireEvent, cleanup, act } =
  await import('@testing-library/react');
const {
  AdvancedTable,
  Table,
  Dropdown,
  FilterModal,
  DrawerFilter,
  FilterType,
  FilterMode,
  useQueryControl,
  serialize,
  deserialize,
  injectStyles,
} = await import('../../src/index.ts');
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/orders?utm_source=news#results');
});

test('URL sync preserves unrelated params, router state, hashes, types and removes cleared owned keys', async () => {
  window.history.replaceState(
    { router: 1 },
    '',
    '/orders?utm_source=news#results',
  );
  const { result } = renderHook(() =>
    useQueryControl({}, { syncUrl: true, keys: ['status'], debounceMs: 5 }),
  );
  act(() => result.current.setFilters('status', '00123'));
  await act(() => pause(20));
  let params = new URLSearchParams(window.location.search);
  assert.equal(deserialize(params.get('rcta_status')), '00123');
  assert.equal(params.get('utm_source'), 'news');
  assert.deepEqual(window.history.state, { router: 1 });
  assert.equal(window.location.hash, '#results');
  act(() => result.current.clearFilters());
  await act(() => pause(20));
  params = new URLSearchParams(window.location.search);
  assert.equal(params.has('rcta_status'), false);
  assert.equal(params.get('utm_source'), 'news');
});
test('controlled URL filters hydrate after mount and navigation cancels pending writes', async () => {
  window.history.replaceState(
    null,
    '',
    `?rcta_status=${encodeURIComponent(serialize('paid'))}`,
  );
  const { result } = renderHook(() => {
    const [value, onChange] = useState({});
    return useQueryControl(
      {},
      { syncUrl: true, keys: ['status'], value, onChange, debounceMs: 10 },
    );
  });
  assert.equal(result.current.filters.status, 'paid');
  act(() => result.current.setFilters('status', 'draft'));
  act(() => {
    window.history.replaceState(
      { router: 2 },
      '',
      '?rcta_status=' + encodeURIComponent(serialize('refunded')),
    );
    window.dispatchEvent(new window.PopStateEvent('popstate'));
  });
  await act(() => pause(30));
  assert.equal(result.current.filters.status, 'refunded');
  assert.equal(
    deserialize(new URLSearchParams(window.location.search).get('rcta_status')),
    'refunded',
  );
});
test('two tables keep their own URL state', async () => {
  const a = renderHook(() =>
    useQueryControl(
      {},
      { syncUrl: true, prefix: 'a_', keys: ['query'], debounceMs: 5 },
    ),
  );
  const b = renderHook(() =>
    useQueryControl(
      {},
      { syncUrl: true, prefix: 'b_', keys: ['query'], debounceMs: 5 },
    ),
  );
  act(() => {
    a.result.current.setFilters('query', 'a,b');
    b.result.current.setFilters('query', '002');
  });
  await act(() => pause(20));
  const params = new URLSearchParams(window.location.search);
  assert.equal(deserialize(params.get('a_query')), 'a,b');
  assert.equal(deserialize(params.get('b_query')), '002');
  assert.equal(params.get('utm_source'), 'news');
});
test('one search change emits one event and resets the page', () => {
  const changes = [];
  const view = render(
    h(
      StrictMode,
      null,
      h(AdvancedTable, {
        columns: [],
        data: [],
        pagination: { page: 8, pageSize: 10, total: 100 },
        searchTrigger: 'instant',
        onChange: (change) => changes.push(change),
      }),
    ),
  );
  assert.equal(changes.length, 0);
  fireEvent.change(view.getByRole('searchbox'), { target: { value: 'Jane' } });
  assert.equal(changes.length, 1);
  assert.equal(changes[0].reason, 'filter');
  assert.deepEqual(changes[0].pagination, { page: 1, pageSize: 10 });
});
test('submit mode does not apply a draft until Apply', () => {
  const changes = [];
  const view = render(
    h(AdvancedTable, {
      columns: [],
      data: [],
      filterMode: FilterMode.ON_SUBMIT,
      searchTrigger: 'instant',
      onChange: (change) => changes.push(change),
    }),
  );
  fireEvent.change(view.getByRole('searchbox'), { target: { value: 'draft' } });
  assert.equal(changes.length, 0);
  fireEvent.click(view.getByRole('button', { name: 'Apply' }));
  assert.equal(changes.length, 1);
  assert.equal(changes[0].filters.query, 'draft');
});
test('modal validates required fields and exposes helper text', () => {
  const applied = [];
  const view = render(
    h(FilterModal, {
      open: true,
      schema: [
        {
          type: FilterType.SINGLE_SELECT,
          key: 'status',
          label: 'Status',
          required: true,
          helperText: 'Choose a status',
          options: [{ value: 'paid', label: 'Paid' }],
        },
      ],
      onClose() {},
      onApply: (value) => applied.push(value),
    }),
  );
  assert.ok(view.getByText('Choose a status'));
  fireEvent.click(view.getByRole('button', { name: 'Apply filters' }));
  assert.equal(applied.length, 0);
  assert.equal(view.getByRole('alert').textContent, 'This field is required');
  fireEvent.click(view.getByRole('combobox', { name: 'Status' }));
  fireEvent.click(view.getByRole('option', { name: 'Paid' }));
  fireEvent.click(view.getByRole('button', { name: 'Apply filters' }));
  assert.deepEqual(applied, [{ status: 'paid' }]);
});
test('dropdown keyboard exposes active option and skips disabled options', () => {
  const selected = [];
  const view = render(
    h(Dropdown, {
      ariaLabel: 'Status',
      options: [
        { value: 'disabled', label: 'Disabled', disabled: true },
        { value: 'paid', label: 'Paid' },
        { value: 'draft', label: 'Draft' },
      ],
      onChange: (value) => selected.push(value),
    }),
  );
  const trigger = view.getByRole('combobox');
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  assert.equal(
    document.getElementById(trigger.getAttribute('aria-activedescendant'))
      .textContent,
    'Paid',
  );
  fireEvent.keyDown(trigger, { key: 'End' });
  fireEvent.keyDown(trigger, { key: 'Enter' });
  assert.deepEqual(selected, ['draft']);
});
test('Escape closes a dropdown before closing its dialog', () => {
  let closes = 0;
  const view = render(
    h(FilterModal, {
      open: true,
      schema: [
        {
          type: FilterType.SINGLE_SELECT,
          key: 'status',
          label: 'Status',
          options: [],
        },
      ],
      onApply() {},
      onClose() {
        closes++;
      },
    }),
  );
  const trigger = view.getByRole('combobox');
  fireEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: 'Escape' });
  assert.equal(closes, 0);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  fireEvent.keyDown(trigger, { key: 'Escape' });
  assert.equal(closes, 1);
});
test('closed drawer groups are hidden and table className is applied', () => {
  const view = render(
    h(DrawerFilter, {
      open: true,
      groups: [
        { key: 'a', title: 'A', schema: [] },
        {
          key: 'b',
          title: 'B',
          schema: [
            { key: 'amount', label: 'Amount', type: FilterType.AMOUNT_RANGE },
          ],
        },
      ],
      onApply() {},
      onClose() {},
    }),
  );
  assert.equal(view.queryByRole('spinbutton'), null);
  fireEvent.click(view.getByRole('button', { name: 'B' }));
  assert.equal(view.getAllByRole('spinbutton').length, 2);
  cleanup();
  const table = render(
    h(Table, { className: 'custom-root', columns: [], data: [] }),
  );
  assert.ok(table.container.querySelector('.rcta-table.custom-root'));
});
test('style injection includes calendar styles and accepts a CSP nonce', () => {
  document.getElementById('rc-table-advanced-styles')?.remove();
  injectStyles({ nonce: 'test-nonce' });
  injectStyles();
  assert.equal(
    document.querySelectorAll('#rc-table-advanced-styles').length,
    1,
  );
  assert.equal(
    document.getElementById('rc-table-advanced-styles').nonce,
    'test-nonce',
  );
  assert.match(
    document.getElementById('rc-table-advanced-styles').textContent,
    /rmdp-header/,
  );
});

test('AdvancedTable controlled filters write their visible state to URL', async () => {
  const view = render(
    h(function Controlled() {
      const [filters, setFilters] = useState({});
      return h(AdvancedTable, {
        columns: [],
        data: [],
        filters,
        onFiltersChange: setFilters,
        syncFiltersWithUrl: true,
        searchTrigger: 'instant',
      });
    }),
  );
  fireEvent.change(view.getByRole('searchbox'), {
    target: { value: '00123,a' },
  });
  await act(() => pause(300));
  assert.equal(
    deserialize(new URLSearchParams(window.location.search).get('rcta_query')),
    '00123,a',
  );
});
test('every inline filter schema renders and presentation props are honored', () => {
  const { Filters } = exportsForInline;
  const view = render(
    h(Filters, {
      filters: {},
      setFilters() {},
      applyFilter() {},
      changeMode: FilterMode.ON_SUBMIT,
      hasSearch: false,
      hasSort: false,
      hasModal: false,
      isSubmitDisabled: true,
      headerContent: h('p', null, 'Custom header'),
      subTitle: 'Subtitle',
      filteredItemCount: 12,
      otherFilters: [
        { key: 'amount', label: 'Amount', type: FilterType.AMOUNT_RANGE },
      ],
      children: h('p', null, 'Custom child'),
    }),
  );
  assert.ok(view.getByText('Custom header'));
  assert.ok(view.getByText('Custom child'));
  assert.ok(view.getByText('12 results'));
  assert.equal(view.getAllByRole('spinbutton').length, 2);
  assert.equal(view.getByRole('button', { name: 'Apply' }).disabled, true);
});
const exportsForInline = await import('../../src/index.ts');

test('malformed owned URL values do not violate builtin and schema types', () => {
  window.history.replaceState(
    null,
    '',
    `?rcta_query=${encodeURIComponent(serialize({}))}&rcta_status=${encodeURIComponent(serialize(123))}`,
  );
  const { result } = renderHook(() =>
    useQueryControl(
      {},
      {
        syncUrl: true,
        keys: ['query', 'status'],
        schema: [
          {
            key: 'status',
            label: 'Status',
            type: FilterType.SINGLE_SELECT,
            options: [],
          },
        ],
      },
    ),
  );
  assert.equal(result.current.filters.query, undefined);
  assert.equal(result.current.filters.status, undefined);
});

test('AdvancedTable honors schema defaults when its active value is absent', () => {
  const changes = [];
  const view = render(
    h(AdvancedTable, {
      columns: [],
      data: [],
      hasSort: false,
      filterModalSchema: [
        {
          key: 'status',
          label: 'Status',
          type: FilterType.SINGLE_SELECT,
          defaultValue: 'paid',
          options: [{ value: 'paid', label: 'Paid' }],
        },
      ],
      onChange: (change) => changes.push(change),
    }),
  );
  fireEvent.click(view.getByRole('button', { name: 'Filters', exact: true }));
  assert.equal(
    view.getByRole('combobox', { name: 'Status' }).textContent,
    'Paid',
  );
  fireEvent.click(
    view.getByRole('button', { name: 'Apply filters', exact: true }),
  );
  assert.equal(changes[0].filters.status, 'paid');
});

test('standalone RTL primitives pass direction to portaled dropdowns', () => {
  const view = render(
    h(Table, {
      columns: [],
      data: [],
      dir: 'rtl',
      showSizeChanger: true,
      pagination: { page: 1, pageSize: 10, total: 10 },
    }),
  );
  assert.equal(view.getByRole('combobox').getAttribute('dir'), 'rtl');
  fireEvent.click(view.getByRole('combobox'));
  assert.equal(view.getByRole('listbox').getAttribute('dir'), 'rtl');
});

test('clearing a migrated legacy link does not reactivate its filters after remount', async () => {
  window.history.replaceState(null, '', '?status=paid&utm_source=news');
  const first = renderHook(() =>
    useQueryControl({}, { syncUrl: true, keys: ['status'], debounceMs: 5 }),
  );
  assert.equal(first.result.current.filters.status, 'paid');
  act(() => first.result.current.clearFilters());
  await act(() => pause(20));
  first.unmount();
  const second = renderHook(() =>
    useQueryControl({}, { syncUrl: true, keys: ['status'], debounceMs: 5 }),
  );
  assert.equal(second.result.current.filters.status, undefined);
  assert.equal(
    new URLSearchParams(window.location.search).get('utm_source'),
    'news',
  );
});

test('date and date-range inputs have associated accessible labels', () => {
  const { DatePickerFilter, DateRangePickerFilter } = exportsForInline;
  const view = render(
    h(
      'div',
      null,
      h(DatePickerFilter, {
        schema: {
          key: 'date',
          label: 'Created day',
          type: FilterType.DATE_PICKER,
        },
        onChange() {},
      }),
      h(DateRangePickerFilter, {
        schema: {
          key: 'range',
          label: 'Created range',
          type: FilterType.DATE_RANGE_PICKER,
        },
        onChange() {},
      }),
    ),
  );
  assert.ok(view.getByRole('textbox', { name: 'Created day' }));
  assert.ok(view.getByRole('textbox', { name: 'Created range' }));
});
