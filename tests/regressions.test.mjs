import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AdvancedTable,
  DrawerFilter,
  FilterModal,
  FilterType,
  DEFAULT_LABELS,
  serialize,
  deserialize,
  calculateFilterCounts,
  hasAnyFilters,
  toCanonicalDate,
  toDisplayDate,
  validateFilters,
} from '../dist/rc-table-advanced.js';

for (const value of [
  '00123',
  'a,b',
  'true',
  '~rcta1:123',
  true,
  false,
  0,
  ['00123', 'a,b'],
  { min: 0, max: 10 },
]) {
  test(`URL roundtrip preserves ${JSON.stringify(value)}`, () =>
    assert.deepEqual(deserialize(serialize(value)), value));
}
test('legacy shared links remain readable and malformed values stay strings', () => {
  assert.deepEqual(deserialize('["paid","draft"]'), ['paid', 'draft']);
  assert.equal(deserialize('10'), 10);
  assert.equal(deserialize('~rcta1:{oops'), '~rcta1:{oops');
});
test('filter counts agree on empty collections and use exact namespaces', () => {
  assert.equal(calculateFilterCounts({ tags: [], amount: {} }), 0);
  assert.equal(hasAnyFilters({ amount: { min: undefined } }), false);
  assert.equal(
    calculateFilterCounts(
      { orders_status: 'paid', other_orders_status: 'paid', orders_page: 2 },
      'orders',
    ),
    1,
  );
});
test('ESM and CommonJS both render an actual table on the server', () => {
  const require = createRequire(import.meta.url);
  for (const Table of [
    AdvancedTable,
    require('../dist/rc-table-advanced.cjs').AdvancedTable,
  ]) {
    const html = renderToStaticMarkup(
      createElement(Table, {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        data: [{ key: '1', name: 'Jane' }],
      }),
    );
    assert.match(html, /Jane/);
    assert.match(html, /<table/);
  }
});
test('open dialog primitives are safe to render during SSR', () => {
  for (const [Component, props] of [
    [DrawerFilter, { groups: [] }],
    [FilterModal, { schema: [] }],
  ]) {
    assert.equal(
      renderToStaticMarkup(
        createElement(Component, {
          ...props,
          open: true,
          onApply() {},
          onClose() {},
        }),
      ),
      '',
    );
  }
});
test('calendar changes preserve the canonical day, including localized digits', () => {
  for (const system of ['jalali', 'gregorian', 'hijri']) {
    const date = toDisplayDate('2026-11-11', system);
    assert.ok(date);
    assert.equal(toCanonicalDate(date), '2026-11-11');
  }
  assert.equal(toDisplayDate('2026-02-30', 'gregorian'), undefined);
  assert.equal(toDisplayDate('1405/08/20', 'jalali'), undefined);
});
test('schema validation enforces required, amount bounds and date order', () => {
  const schema = [
    {
      key: 'status',
      label: 'Status',
      type: FilterType.SINGLE_SELECT,
      required: true,
      options: [],
    },
    {
      key: 'amount',
      label: 'Amount',
      type: FilterType.AMOUNT_RANGE,
      min: 0,
      max: 100,
    },
    { key: 'date', label: 'Date', type: FilterType.DATE_RANGE_PICKER },
  ];
  assert.deepEqual(
    Object.keys(
      validateFilters(
        schema,
        {
          amount: { min: 40, max: 20 },
          date: { from: '2026-11-11', to: '2026-10-01' },
        },
        DEFAULT_LABELS,
      ),
    ),
    ['status', 'amount', 'date'],
  );
  assert.deepEqual(
    validateFilters(
      schema,
      { status: 'paid', amount: { min: 0, max: 100 } },
      DEFAULT_LABELS,
    ),
    {},
  );
});

test('TableCell unwraps value-only fields and honors table-wide error renderers', async () => {
  const { TableCell, Table } = await import('../dist/rc-table-advanced.js');
  assert.match(
    renderToStaticMarkup(
      createElement(TableCell, { value: { value: 'Wrapped' } }),
    ),
    /Wrapped/,
  );
  const html = renderToStaticMarkup(
    createElement(Table, {
      rowKey: 'id',
      columns: [
        {
          dataIndex: 'name',
          render: (value) => createElement(TableCell, { value }),
        },
      ],
      data: [{ id: 1, name: { value: 'Bad', isValid: false } }],
      slots: {
        renderErrorCell: ({ value }) =>
          createElement('strong', null, `Custom: ${value}`),
      },
    }),
  );
  assert.match(html, /Custom: Bad/);
});
