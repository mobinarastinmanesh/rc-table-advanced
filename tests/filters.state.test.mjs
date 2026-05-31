import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildNextFilters,
  clearUserFilters,
  isEmptyFilterValue,
} from '../dist/rc-table-advanced.es.js';

test('removes empty filter keys instead of storing undefined', () => {
  const current = { query: 'test', status: 'paid' };
  const next = buildNextFilters(current, 'status', undefined);

  assert.deepEqual(next, { query: 'test' });
  assert.equal('status' in next, false);
});

test('clearUserFilters keeps pagination and sort only', () => {
  const current = {
    query: 'abc',
    status: 'paid',
    page: 2,
    pageSize: 20,
    sort: 'oldest',
  };

  assert.deepEqual(clearUserFilters(current), {
    page: 2,
    pageSize: 20,
    sort: 'oldest',
  });
});

test('isEmptyFilterValue treats empty collections as empty', () => {
  assert.equal(isEmptyFilterValue(undefined), true);
  assert.equal(isEmptyFilterValue(''), true);
  assert.equal(isEmptyFilterValue([]), true);
  assert.equal(isEmptyFilterValue('paid'), false);
});
