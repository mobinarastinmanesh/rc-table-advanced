import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPaginationSnapshot } from '../dist/rc-table-advanced.es.js';

test('getPaginationSnapshot returns defaults when pagination is missing', () => {
  assert.deepEqual(getPaginationSnapshot(), { page: 1, pageSize: 10 });
});

test('getPaginationSnapshot preserves provided pagination values', () => {
  assert.deepEqual(getPaginationSnapshot({ page: 3, pageSize: 25, total: 100 }), {
    page: 3,
    pageSize: 25,
  });
});
