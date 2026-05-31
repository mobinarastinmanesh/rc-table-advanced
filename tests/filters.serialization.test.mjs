import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  calculateFilterCounts,
  deserialize,
  hasAnyFilters,
  serialize,
} from '../dist/rc-table-advanced.es.js';

test('serializes and deserializes structured filter values', () => {
  const value = { status: ['paid', 'draft'], amount: { min: 10 } };

  assert.deepEqual(deserialize(serialize(value)), value);
});

test('counts active filters and ignores paging/sorting keys', () => {
  const count = calculateFilterCounts(
    { query: 'jane', page: 1, pageSize: 10, sort: 'newest', status: '' },
    '',
  );

  assert.equal(count, 1);
  assert.equal(hasAnyFilters({ page: 1, pageSize: 10 }), false);
  assert.equal(hasAnyFilters({ page: 1, status: 'paid' }), true);
});
