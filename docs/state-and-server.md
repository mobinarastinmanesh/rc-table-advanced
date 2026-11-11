# Server-side React table filtering and pagination

`AdvancedTable` provides controls, not a data engine. `onFiltersChange` reports draft/filter state. `onChange` reports an applied interaction with `{ filters, pagination, reason }`. Initial loading is your application's responsibility.

## Controlled pagination

Pass `{ page, pageSize, total }`. Alternatively use `totalPages`, or `hasNext`/`hasPrev` for endpoints without a count. Page numbers start at 1. Page sizes must be positive. Changing page size returns to page 1. Changing filters/sort resets the emitted page to 1 by default; disable that with `resetPageOnFilterChange={false}`.

Consume every pagination snapshot from `onChange`, including filter changes. Avoid attaching the same request to both `getData` and `onChange`. `getData(page, pageSize)` is a legacy pagination-only callback.

## Server example with cancellation and retry

```tsx
import { useEffect, useState } from 'react';
import { AdvancedTable, type AdvancedTableChange } from 'rc-table-advanced';

type Row = { id: number; name: string };
type Filters = { query?: string; sort?: string };
type Query = {
  filters: Filters;
  pagination: { page: number; pageSize: number };
};

export function RemoteOrders() {
  const [draft, setDraft] = useState<Filters>({});
  const [query, setQuery] = useState<Query>({
    filters: {},
    pagination: { page: 1, pageSize: 10 },
  });
  const [result, setResult] = useState<{ rows: Row[]; total: number }>({
    rows: [],
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(undefined);
    const params = new URLSearchParams({
      page: String(query.pagination.page),
      pageSize: String(query.pagination.pageSize),
      query: query.filters.query ?? '',
      sort: query.filters.sort ?? 'newest',
    });
    fetch(`/api/orders?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Request failed (${response.status})`);
        return response.json() as Promise<{ rows: Row[]; total: number }>;
      })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((failure: unknown) => {
        if (active && !controller.signal.aborted)
          setError(
            failure instanceof Error ? failure.message : 'Request failed',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [query, retry]);
  const apply = (change: AdvancedTableChange<Filters>) =>
    setQuery({ filters: change.filters, pagination: change.pagination });
  return (
    <>
      {error && (
        <div role="alert">
          {error}{' '}
          <button onClick={() => setRetry((value) => value + 1)}>Retry</button>
        </div>
      )}
      <AdvancedTable<Row, Filters>
        rowKey="id"
        columns={[{ title: 'Name', dataIndex: 'name' }]}
        data={result.rows}
        filters={draft}
        onFiltersChange={setDraft}
        onChange={apply}
        pagination={{ ...query.pagination, total: result.total }}
        loading={loading}
        searchTrigger="debounced"
      />
    </>
  );
}
```

The endpoint and JSON response above are an application contract, not a service shipped by the package. Validate responses in production. If filters shrink the result set, keep page 1 from the filter event; if the server count changes independently, reconcile out-of-range pages in your application.

## Submit mode

Add `filterMode={FilterMode.ON_SUBMIT}`. Keep `draft` separate from the applied `query` as above. Do not use draft filters directly to render rows; doing so bypasses Apply. Modal/drawer Apply commits once after validation. Clear inside a dialog clears its draft; toolbar Clear all restores `initialFilters` while retaining paging/sort keys in filter state.
