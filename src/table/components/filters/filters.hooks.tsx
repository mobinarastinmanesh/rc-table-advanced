import { validateFilters } from './filters.validation';
import { DEFAULT_LABELS } from '../../table.labels';
import type { FilterSchema, FilterSchemaValue } from './filters-schema.types';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BaseFiltersState,
  FilterValue,
  UseFilterReturn,
} from './filters.types';
import {
  clearUserFilters,
  isEmptyFilterValue,
  serializeFilters,
} from './filters.state';
import { deserialize, serialize } from './filters.serialization';

export type QueryControlOptions<T extends BaseFiltersState = BaseFiltersState> =
  {
    debounceMs?: number;
    syncUrl?: boolean;
    /** URL keys owned by this table. Other search parameters are preserved. */
    keys?: string[];
    /** Use a different prefix for each table. Default `rcta_`. */
    prefix?: string;
    value?: T;
    schema?: FilterSchema[];
    onChange?: (filters: T) => void;
  };

export const useQueryControl = <T extends BaseFiltersState>(
  initialState?: T,
  opts?: QueryControlOptions<T>,
): UseFilterReturn<T> => {
  const { debounceMs = 250, syncUrl = false, prefix = 'rcta_' } = opts ?? {};
  const [internal, setInternal] = useState<T>(() => ({ ...initialState }) as T);
  const [ready, setReady] = useState(false);
  const filters = opts?.value ?? internal;
  const current = useRef(filters);
  current.current = filters;
  const initial = useRef(initialState);
  const onChange = useRef(opts?.onChange);
  onChange.current = opts?.onChange;
  const schemaRef = useRef(opts?.schema);
  schemaRef.current = opts?.schema;
  const controlled = opts?.value !== undefined;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const skipWrite = useRef(false);
  const keySignature = JSON.stringify(
    [
      ...new Set(
        opts?.keys ?? [
          'query',
          'sort',
          'page',
          'pageSize',
          ...Object.keys(initialState ?? {}),
        ],
      ),
    ]
      .filter((key) => key !== '__version')
      .sort(),
  );

  const replaceFilters = useCallback(
    (next: T) => {
      current.current = next;
      if (!controlled) setInternal(next);
      onChange.current?.(next);
    },
    [controlled],
  );

  useEffect(() => {
    if (!syncUrl) {
      setReady(false);
      return;
    }
    const keys: string[] = JSON.parse(keySignature);
    const decode = (key: string, raw: string): FilterValue => {
      const value = deserialize(raw);
      if (['query', 'sort'].includes(key) && typeof value !== 'string')
        return raw.startsWith('~rcta1:') ? undefined : raw;
      if (
        ['page', 'pageSize'].includes(key) &&
        (typeof value !== 'number' || !Number.isInteger(value) || value < 1)
      )
        return undefined;
      const schema = schemaRef.current?.find((item) => item.key === key);
      if (
        schema &&
        validateFilters(
          [schema],
          { [key]: value as FilterSchemaValue },
          DEFAULT_LABELS,
        )[key]
      )
        return undefined;
      return value as FilterValue;
    };
    const read = (mount: boolean) => {
      clearTimeout(timer.current);
      const params = new URLSearchParams(window.location.search);
      const base = mount ? current.current : ({ ...initial.current } as T);
      const next = { ...base };
      let found = false;
      for (const key of keys) {
        const encoded = params.get(prefix + key);
        if (encoded !== null) {
          Object.defineProperty(next, key, {
            value: decode(key, encoded),
            enumerable: true,
            writable: true,
            configurable: true,
          });
          found = true;
        }
      }
      // Read old links only on mount; v2 writes exclusively to owned prefixed keys.
      if (mount && !found && params.get(prefix + '__version') !== '2') {
        for (const key of keys) {
          const legacy = params.get(key);
          if (legacy !== null)
            Object.defineProperty(next, key, {
              value: decode(key, legacy),
              enumerable: true,
              writable: true,
              configurable: true,
            });
        }
      }
      if (serializeFilters(next) !== serializeFilters(current.current)) {
        if (!mount) skipWrite.current = true;
        replaceFilters(next);
      }
    };
    read(true);
    setReady(true);
    const navigate = () => read(false);
    window.addEventListener('popstate', navigate);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('popstate', navigate);
    };
  }, [syncUrl, prefix, keySignature, replaceFilters]);

  const stateSignature = serializeFilters(filters);
  useEffect(() => {
    if (!syncUrl || !ready) return;
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    const keys: string[] = JSON.parse(keySignature);
    const snapshot: T = JSON.parse(stateSignature);
    timer.current = setTimeout(() => {
      // Read at write time so another table/router cannot lose its parameters.
      const params = new URLSearchParams(window.location.search);
      params.set(prefix + '__version', '2');
      for (const key of keys) {
        params.delete(prefix + key);
        if (!isEmptyFilterValue(snapshot[key])) {
          const encoded = serialize(snapshot[key]);
          if (encoded) params.set(prefix + key, encoded);
        }
      }
      const search = params.toString();
      const url = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
      if (
        url !==
        `${window.location.pathname}${window.location.search}${window.location.hash}`
      ) {
        window.history.replaceState(window.history.state, '', url);
      }
    }, debounceMs);
    return () => clearTimeout(timer.current);
  }, [stateSignature, syncUrl, ready, prefix, keySignature, debounceMs]);

  const setFilters = useCallback(
    (key: keyof T, value: FilterValue) => {
      const next = { ...current.current };
      if (isEmptyFilterValue(value)) delete next[key];
      else
        Object.defineProperty(next, key, {
          value,
          enumerable: true,
          writable: true,
          configurable: true,
        });
      replaceFilters(next);
    },
    [replaceFilters],
  );
  const clearFilters = useCallback(
    () => replaceFilters(clearUserFilters(current.current, initial.current)),
    [replaceFilters],
  );
  return { filters, setFilters, clearFilters, replaceFilters };
};
