import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  FilterMode,
  TableCell,
  getSortOptions,
} from '../dist/rc-table-advanced.es.js';

test('renders invalid table fields with accessible error markup', () => {
  const html = renderToStaticMarkup(
    TableCell({
      value: {
        value: 'Bad value',
        isValid: false,
        message: 'Invalid value',
      },
    }),
  );

  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /Bad value/);
  assert.match(html, /Invalid value/);
});

test('exposes aligned pagination and sort defaults', () => {
  assert.equal(DEFAULT_PAGE_SIZE, 10);
  assert.equal(DEFAULT_SORT, 'newest');
  assert.deepEqual(getSortOptions().map((option) => option.value), [
    'newest',
    'oldest',
  ]);
});

test('exports filter modes for submit and live workflows', () => {
  assert.equal(FilterMode.ON_CHANGE, 'on-change');
  assert.equal(FilterMode.ON_SUBMIT, 'on-submit');
});
