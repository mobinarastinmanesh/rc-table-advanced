# Shareable URL state and multiple tables

Enable `syncFiltersWithUrl`. The default namespace is `rcta_`, for example `rcta_status`. Supply `urlPrefix="orders_"` and `urlPrefix="customers_"` for independent tables on one page.

```tsx
<AdvancedTable
  columns={columns}
  data={pageRows}
  filters={filters}
  onFiltersChange={setFilters}
  onChange={handleChange}
  syncFiltersWithUrl
  urlPrefix="orders_"
  urlFilterKeys={['status', 'customFilter']}
/>
```

## Ownership and encoding

Owned keys come from `query`, `sort`, `page`, `pageSize`, schema keys, initial/controlled filter keys and `urlFilterKeys`. Pass `urlFilterKeys` explicitly for custom dynamic filters so clearing a key does not remove its ownership.

Values are encoded as versioned JSON (`~rcta1:` followed by JSON). `URLSearchParams` handles escaping. Strings such as `00123` and `a,b`, booleans, numbers and supported objects retain their types. This is an internal URL representation, not your API's query format.

Other parameters, duplicate unrelated parameters, the hash and `history.state` are preserved. Writes use debounced `replaceState`, so typing does not create a browser history entry. Back/Forward reads owned v2 keys and cancels pending writes.

V1 unprefixed links are read on mount as a compatibility fallback when no scoped values exist. Their original type inference remains ambiguous: an already-written `00123` cannot reveal whether it meant a string or number. Recreate such links from correctly typed state. Legacy keys are left untouched because the library cannot assume ownership of unprefixed application parameters. A namespaced `__version=2` marker prevents those old parameters from becoming active again after a v2 clear/reload; `__version` is reserved for this metadata.

## Hydration and controlled values

Initial server and client rendering use `initialFilters` or controlled `filters`. URL values are read after mount, avoiding markup differences during hydration. In controlled mode, accept the proposed state in `onFiltersChange`; rejecting it means your application remains authoritative.

URL sync concerns filter state, including drafts in submit mode. Pagination remains controlled separately; `pagination` is not automatically written to URL. If your application stores page/pageSize in filters, translate them explicitly.

## Routers

The built-in adapter uses browser history and the `popstate` event. Framework-specific navigation that does not emit `popstate` is not automatically observed. For router-managed query strings, leave built-in sync off and adapt `filters`/`onFiltersChange` through your router. Do not mount two URL adapters that both claim the same keys.

The standalone `useQueryControl(initialState, { syncUrl, prefix, keys, debounceMs, value, onChange, schema })` exposes `filters`, `setFilters(key, value)`, `replaceFilters(next)` and `clearFilters()` with the same behavior. Supplying `schema` validates decoded field shapes; AdvancedTable supplies its modal/drawer schemas automatically. Malformed built-in query/sort/page values are ignored.
