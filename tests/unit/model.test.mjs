import assert from 'node:assert/strict';
import { test } from 'vitest';
import fc from 'fast-check';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AdvancedTable,
  TableCell,
  ErrorCell,
  DrawerFilter,
  FilterModal,
  FilterType,
  DEFAULT_LABELS,
  serialize,
  deserialize,
  buildNextFilters,
  clearUserFilters,
  isEmptyFilterValue,
  calculateFilterCounts,
  toCanonicalDate,
  toDisplayDate,
  validateFilters,
  injectStyles,
  mergeLabels,
  resolveDrawerPlacement,
} from '../../src/index.ts';
import { schemaDefaults } from '../../src/table/components/filters/filters.validation.ts';

const supported = fc.oneof(
  fc.string(),
  fc.boolean(),
  fc.integer(),
  fc.array(fc.string()),
  fc.record(
    { min: fc.integer(), max: fc.integer() },
    { noNullPrototype: true },
  ),
  fc.record({ from: fc.string(), to: fc.string() }, { noNullPrototype: true }),
);
test('typed URL encoding preserves 500 generated supported values without type inference', () => {
  fc.assert(
    fc.property(supported, (value) =>
      assert.deepEqual(deserialize(serialize(value)), value),
    ),
    { seed: 20261111, numRuns: 500 },
  );
});
test('filter updates remove empty values, preserve valid falsy values and never mutate input', () => {
  const original = Object.freeze({ status: 'paid', query: 'hello' });
  for (const value of [
    undefined,
    null,
    '',
    [],
    {},
    { min: undefined },
    { from: '' },
  ]) {
    assert.equal(isEmptyFilterValue(value), true);
    assert.deepEqual(buildNextFilters(original, 'status', value), {
      query: 'hello',
    });
  }
  for (const value of [0, false, ['vip'], { min: 0 }]) {
    assert.equal(isEmptyFilterValue(value), false);
    assert.deepEqual(buildNextFilters(original, 'status', value), {
      status: value,
      query: 'hello',
    });
  }
  assert.deepEqual(original, { status: 'paid', query: 'hello' });
  assert.deepEqual(
    clearUserFilters(
      {
        query: 'draft',
        orders_page: 4,
        orders_pageSize: 5,
        orders_sort: 'oldest',
      },
      { query: 'default' },
    ),
    {
      query: 'default',
      orders_page: 4,
      orders_pageSize: 5,
      orders_sort: 'oldest',
    },
  );
});
test('legacy serialization handles nested old links, malformed JSON, decimals and commas', () => {
  assert.deepEqual(
    deserialize(
      '{"status":"[\\"paid\\",\\"draft\\"]","amount":"{\\"min\\":\\"-1.5\\"}"}',
    ),
    { status: ['paid', 'draft'], amount: { min: -1.5 } },
  );
  assert.deepEqual(deserialize('a, b'), ['a', 'b']);
  assert.equal(deserialize('{invalid'), '{invalid');
  assert.equal(deserialize('null'), 'null');
  assert.equal(deserialize('~rcta1:null'), null);
  assert.equal(deserialize('~rcta1:{invalid'), '~rcta1:{invalid');
  const cyclic = {};
  cyclic.self = cyclic;
  assert.equal(serialize(cyclic), '');
  assert.equal(serialize(undefined), '');
  assert.equal(
    calculateFilterCounts({
      page: 2,
      sortType: 'desc',
      hasError: true,
      tags: [],
      amount: { min: 0 },
    }),
    1,
  );
});
test('date-only conversion retains leap days across every supported calendar', () => {
  for (const date of ['2024-02-29', '2026-01-01', '2026-12-31']) {
    for (const calendar of ['jalali', 'gregorian', 'hijri'])
      assert.equal(toCanonicalDate(toDisplayDate(date, calendar)), date);
  }
  for (const value of [
    undefined,
    '',
    '2025-02-29',
    '2026-13-01',
    '2026/11/11',
    '۱۴۰۵/۰۸/۲۰',
  ])
    assert.equal(toDisplayDate(value, 'gregorian'), undefined);
});
test('required and range validation accepts partial ranges and rejects wrong shapes', () => {
  const schemas = [
    {
      key: 'single',
      type: FilterType.SINGLE_SELECT,
      label: 'Single',
      options: [],
      required: true,
    },
    {
      key: 'multiple',
      type: FilterType.MULTIPLE_SELECT,
      label: 'Multiple',
      options: [],
    },
    {
      key: 'amount',
      type: FilterType.AMOUNT_RANGE,
      label: 'Amount',
      min: 0,
      max: 100,
    },
    { key: 'date', type: FilterType.DATE_PICKER, label: 'Date' },
    { key: 'range', type: FilterType.DATE_RANGE_PICKER, label: 'Range' },
  ];
  assert.deepEqual(
    Object.keys(
      validateFilters(
        schemas,
        {
          single: 1,
          multiple: [1],
          amount: 'bad',
          date: '2026-02-30',
          range: 'bad',
        },
        DEFAULT_LABELS,
      ),
    ),
    ['single', 'multiple', 'amount', 'date', 'range'],
  );
  for (const amount of [
    { min: -1 },
    { max: 101 },
    { min: 8, max: 2 },
    { min: NaN },
    { max: Infinity },
  ])
    assert.ok(
      validateFilters(schemas, { single: 'paid', amount }, DEFAULT_LABELS)
        .amount,
    );
  for (const range of [
    { from: '2026-12-01', to: '2026-01-01' },
    { from: 'bad' },
    { to: 1 },
  ])
    assert.ok(
      validateFilters(schemas, { single: 'paid', range }, DEFAULT_LABELS).range,
    );
  for (const range of [{ from: '2026-01-01' }, { to: '2026-12-01' }])
    assert.deepEqual(
      validateFilters(
        schemas,
        { single: 'paid', range, amount: { min: 0 } },
        DEFAULT_LABELS,
      ),
      {},
    );
  assert.equal(
    validateFilters(schemas, {}, DEFAULT_LABELS).single,
    DEFAULT_LABELS.requiredField,
  );
  assert.deepEqual(
    schemaDefaults([
      { key: 'a', defaultValue: false },
      { key: 'b', defaultValue: 0 },
      { key: 'c' },
    ]),
    { a: false, b: 0 },
  );
});
test('SSR renders actual rows, cells and custom renderers without browser globals', () => {
  injectStyles();
  const html = renderToStaticMarkup(
    h(AdvancedTable, {
      rowKey: 'id',
      columns: [{ title: 'Name', dataIndex: 'name' }],
      data: [{ id: 1, name: 'Server row' }],
      hasSearch: false,
      hasSort: false,
      dir: 'rtl',
    }),
  );
  assert.match(html, /Server row/);
  assert.match(html, /dir="rtl"/);
  assert.equal(
    renderToStaticMarkup(
      h(DrawerFilter, { open: true, groups: [], onClose() {}, onApply() {} }),
    ),
    '',
  );
  assert.equal(
    renderToStaticMarkup(
      h(FilterModal, { open: true, schema: [], onClose() {}, onApply() {} }),
    ),
    '',
  );
  assert.match(
    renderToStaticMarkup(h(TableCell, { value: { value: 'Wrapped' } })),
    /Wrapped/,
  );
  assert.match(
    renderToStaticMarkup(h(TableCell, { value: null, fallback: 'None' })),
    /None/,
  );
  assert.match(
    renderToStaticMarkup(
      h(TableCell, { value: 0, renderValue: (value) => h('b', null, value) }),
    ),
    /<b>0<\/b>/,
  );
  assert.match(
    renderToStaticMarkup(
      h(TableCell, {
        value: { value: 'Invalid', isValid: false },
        errorMessage: 'Explain',
        renderErrorCell: ({ message }) => h('strong', null, message),
      }),
    ),
    /<strong>Explain<\/strong>/,
  );
  assert.match(
    renderToStaticMarkup(
      h(ErrorCell, { value: null, message: h('em', null, 'Error') }),
    ),
    /aria-describedby/,
  );
});
test('localization overrides merge without changing defaults and drawer placement is explicit', () => {
  const merged = mergeLabels({ search: 'جستجو' });
  assert.equal(merged.search, 'جستجو');
  assert.equal(merged.paginationNext, 'Next');
  assert.equal(DEFAULT_LABELS.search, 'Search');
  for (const key of [
    'paginationPageInfo',
    'drawerSelectedCount',
    'drawerGroupSelectedCount',
    'loadingFilter',
    'filteredItemCount',
  ])
    assert.equal(typeof DEFAULT_LABELS[key](1), 'string');
  assert.match(DEFAULT_LABELS.paginationPageInfo(1, 3), /3/);
  assert.equal(resolveDrawerPlacement(undefined, 'rtl'), 'left');
  assert.equal(resolveDrawerPlacement(undefined, 'ltr'), 'right');
  assert.equal(resolveDrawerPlacement('right', 'rtl'), 'right');
});

test('empty validation cells expose fallback values without unrelated error descriptions', () => {
  for (const value of [null, undefined, '']) {
    const plain = renderToStaticMarkup(h(TableCell, { value }));
    assert.match(plain, /-<\/div>/);
    const error = renderToStaticMarkup(h(ErrorCell, { value }));
    assert.doesNotMatch(error, /aria-describedby|title=/);
    assert.match(error, /rcta-error-cell__value/);
  }
});
