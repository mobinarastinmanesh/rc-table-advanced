import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import './setup-dom.mjs';
import { createElement as h, useState } from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import {
  FilterType,
  Filters,
  FilterMode,
  AdvancedTable,
  Table,
} from '../../src/index.ts';
import FilterRenderer from '../../src/table/components/filters/filter-renderer.tsx';
import { filterCreator } from '../../src/table/components/filters/filters.creator.tsx';
const options = [
  { value: 'paid', label: 'Paid', title: 'Paid title' },
  { value: 'draft', label: 'Draft' },
  { value: 'disabled', label: 'Disabled', disabled: true },
];
afterEach(cleanup);
function Field({ schema, initial, changed }) {
  const [value, setValue] = useState(initial);
  return h(FilterRenderer, {
    schema,
    value,
    onChange(key, next) {
      setValue(next);
      changed(key, next);
    },
  });
}
for (const type of [
  FilterType.SINGLE_SELECT,
  FilterType.MULTIPLE_SELECT,
  FilterType.SINGLE_BADGE_SELECT,
  FilterType.MULTIPLE_BADGE_SELECT,
]) {
  test(`${type}: selecting, deselecting, disabled options and schema callbacks`, () => {
    const changed = vi.fn();
    const schemaChange = vi.fn();
    const view = render(
      h(Field, {
        schema: {
          key: 'status',
          label: 'Status',
          type,
          options,
          onChange: schemaChange,
        },
        changed,
      }),
    );
    const multiple = [
      FilterType.MULTIPLE_SELECT,
      FilterType.MULTIPLE_BADGE_SELECT,
    ].includes(type);
    if (type.includes('badge')) {
      fireEvent.click(view.getByRole('button', { name: 'Paid' }));
      assert.equal(
        view.getByRole('button', { name: 'Paid' }).getAttribute('aria-pressed'),
        'true',
      );
      fireEvent.click(view.getByRole('button', { name: 'Disabled' }));
      assert.equal(changed.mock.calls.length, 1);
      fireEvent.click(view.getByRole('button', { name: 'Paid' }));
    } else {
      fireEvent.click(view.getByRole('combobox'));
      fireEvent.click(
        view.getByRole('option', {
          name: type === FilterType.SINGLE_SELECT ? 'Paid title' : 'Paid',
        }),
      );
      if (!multiple) fireEvent.click(view.getByRole('combobox'));
      fireEvent.click(
        view.getByRole('option', { name: multiple ? 'Paid' : 'All' }),
      );
    }
    assert.deepEqual(changed.mock.calls[0], [
      'status',
      multiple ? ['paid'] : 'paid',
    ]);
    assert.deepEqual(changed.mock.calls.at(-1), ['status', undefined]);
    assert.deepEqual(schemaChange.mock.calls, changed.mock.calls);
  });
}
test('amount ranges preserve zero, update each endpoint independently and clear both', () => {
  const changed = vi.fn();
  const view = render(
    h(Field, {
      schema: {
        key: 'amount',
        label: 'Amount',
        type: FilterType.AMOUNT_RANGE,
        min: 0,
        max: 100,
      },
      changed,
    }),
  );
  fireEvent.change(view.getByRole('spinbutton', { name: 'Amount: Min' }), {
    target: { value: '0' },
  });
  fireEvent.change(view.getByRole('spinbutton', { name: 'Amount: Max' }), {
    target: { value: '80' },
  });
  assert.deepEqual(changed.mock.calls.at(-1)[1], { min: 0, max: 80 });
  fireEvent.change(view.getByRole('spinbutton', { name: 'Amount: Min' }), {
    target: { value: '' },
  });
  fireEvent.change(view.getByRole('spinbutton', { name: 'Amount: Max' }), {
    target: { value: '' },
  });
  assert.deepEqual(changed.mock.calls.at(-1)[1], {
    min: undefined,
    max: undefined,
  });
});
test('custom filters receive current values and report changed keys', () => {
  const changed = vi.fn();
  const view = render(
    h(Field, {
      initial: 'one',
      changed,
      schema: {
        key: 'custom',
        label: 'Custom',
        type: FilterType.CUSTOM,
        helperText: 'Help',
        render: ({ value, onChange }) =>
          h('button', { onClick: () => onChange('two') }, String(value)),
      },
    }),
  );
  fireEvent.click(view.getByRole('button', { name: 'one' }));
  assert.deepEqual(changed.mock.calls, [['custom', 'two']]);
  assert.ok(view.getByText('Help'));
});
test('renderer handles malformed JavaScript values defensively and distinguishes range shapes', () => {
  for (const [type, value] of [
    [FilterType.SINGLE_SELECT, 0],
    [FilterType.MULTIPLE_SELECT, 'bad'],
    [FilterType.SINGLE_BADGE_SELECT, false],
    [FilterType.MULTIPLE_BADGE_SELECT, false],
    [FilterType.AMOUNT_RANGE, 'bad'],
    [FilterType.AMOUNT_RANGE, { max: 2 }],
    [FilterType.DATE_RANGE_PICKER, { to: '2026-11-11' }],
    [FilterType.DATE_RANGE_PICKER, []],
    [FilterType.DATE_PICKER, 3],
    [FilterType.CUSTOM, undefined],
    ['unknown', undefined],
  ]) {
    const view = render(
      h(FilterRenderer, {
        schema: { key: 'value', label: 'Value', type, options },
        value,
        onChange() {},
      }),
    );
    assert.ok(
      view.getAllByRole('group', { name: 'Value', exact: true }).length >= 1,
    );
    cleanup();
  }
});
test('inline filters use defaults, loading state, custom children and real event handlers', () => {
  const change = vi.fn();
  const view = render(
    h(Filters, {
      filters: {},
      setFilters: change,
      applyFilter() {},
      changeMode: FilterMode.ON_CHANGE,
      hasSearch: false,
      hasSort: false,
      otherFilters: [
        {
          key: 'loading',
          label: 'Pending',
          type: FilterType.SINGLE_SELECT,
          options,
          isLoading: true,
        },
        {
          key: 'amount',
          label: 'Amount',
          type: FilterType.AMOUNT_RANGE,
          defaultValue: { min: 1 },
        },
      ],
    }),
  );
  assert.match(view.getByText(/Pending/).textContent, /Loading/);
  fireEvent.change(view.getByRole('spinbutton', { name: 'Amount: Min' }), {
    target: { value: '2' },
  });
  assert.deepEqual(change.mock.calls, [['amount', { min: 2, max: undefined }]]);
  cleanup();
  const deprecated = render(
    filterCreator({
      key: 'custom',
      type: FilterType.CUSTOM,
      label: 'Legacy',
      defaultValue: 'old',
      render: ({ value, onChange }) =>
        h('button', { onClick: () => onChange('new') }, value),
    }),
  );
  fireEvent.click(deprecated.getByRole('button', { name: 'old' }));
});
test('table pagination calls legacy fetch and emits controlled page and size snapshots', () => {
  const fetch = vi.fn(),
    change = vi.fn();
  const view = render(
    h(Table, {
      rowKey: 'id',
      columns: [],
      data: [],
      loading: true,
      slots: { loading: 'Waiting', footer: h('p', null, 'Footer') },
      pagination: { page: 2, pageSize: 10, total: 45 },
      showSizeChanger: true,
      getData: fetch,
      onChange: change,
    }),
  );
  assert.ok(view.getByRole('status'));
  assert.equal(
    view.container.querySelector('.rcta-table').getAttribute('aria-busy'),
    'true',
  );
  fireEvent.click(view.getByRole('button', { name: 'Previous' }));
  fireEvent.click(view.getByRole('button', { name: 'Next' }));
  fireEvent.click(view.getByRole('combobox'));
  fireEvent.click(view.getByRole('option', { name: '20', exact: true }));
  assert.deepEqual(fetch.mock.calls, [
    [1, 10],
    [3, 10],
    [1, 20],
  ]);
  assert.deepEqual(change.mock.calls.at(-1), [
    { pagination: { page: 1, pageSize: 20 } },
  ]);
});
test('custom pagination handlers and zero-total empty slots work', () => {
  const change = vi.fn();
  const view = render(
    h(Table, {
      columns: [],
      data: [],
      pagination: { page: 1, pageSize: 10, total: 0 },
      onChange: change,
      slots: {
        empty: 'Nothing here',
        renderPagination: ({ onPageChange, onPageSizeChange }) =>
          h(
            'div',
            null,
            h('button', { onClick: () => onPageChange(2) }, 'Custom page'),
            h('button', { onClick: () => onPageSizeChange(5) }, 'Custom size'),
          ),
      },
    }),
  );
  assert.ok(view.getByText('Nothing here'));
  fireEvent.click(view.getByRole('button', { name: 'Custom page' }));
  fireEvent.click(view.getByRole('button', { name: 'Custom size' }));
  assert.deepEqual(change.mock.calls, [
    [{ pagination: { page: 2, pageSize: 10 } }],
    [{ pagination: { page: 1, pageSize: 5 } }],
  ]);
});
test('AdvancedTable emits sort, reset and pagination reasons and can preserve page on filter change', () => {
  const change = vi.fn();
  const view = render(
    h(AdvancedTable, {
      columns: [],
      data: [],
      initialFilters: { query: 'initial' },
      pagination: { page: 3, pageSize: 10, hasNext: true },
      resetPageOnFilterChange: false,
      onChange: change,
      sortOptions: [{ value: 'amount', label: 'By amount' }],
    }),
  );
  fireEvent.click(view.getByRole('combobox', { name: 'Sort' }));
  fireEvent.click(view.getByRole('option', { name: 'By amount' }));
  assert.equal(change.mock.calls.at(-1)[0].reason, 'sort');
  assert.equal(change.mock.calls.at(-1)[0].pagination.page, 3);
  fireEvent.change(view.getByRole('searchbox'), {
    target: { value: 'changed' },
  });
  fireEvent.click(view.getByRole('button', { name: 'Search' }));
  fireEvent.click(view.getByRole('button', { name: 'Clear all' }));
  assert.equal(change.mock.calls.at(-1)[0].reason, 'reset');
  fireEvent.click(view.getByRole('button', { name: 'Next' }));
  assert.equal(change.mock.calls.at(-1)[0].reason, 'pagination');
});
