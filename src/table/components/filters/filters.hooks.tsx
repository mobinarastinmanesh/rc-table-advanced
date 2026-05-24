import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  BaseFiltersState,
  FilterValue,
  UseFilterReturn,
} from './filters.types';
import { deserialize, serialize } from './filters.serialization';

type QueryControlOptions = {
  debounceMs?: number;
  syncUrl?: boolean;
};

export const useQueryControl = <T extends BaseFiltersState>(
  initialState?: T,
  opts?: QueryControlOptions,
): UseFilterReturn<T> => {
  const { debounceMs = 250, syncUrl = false } = opts ?? {};
  const mountedRef = useRef(false);
  const isParsingSearchParamsRef = useRef(false);
  const writeTimerRef = useRef<number | undefined>(undefined);

  const getSearchParams = useCallback(
    () =>
      typeof window === 'undefined' || !syncUrl
        ? new URLSearchParams()
        : new URLSearchParams(window.location.search),
    [syncUrl],
  );

  const isEmptyValue = (val: unknown): boolean =>
    val === undefined ||
    val === null ||
    val === '' ||
    (Array.isArray(val) && val.length === 0) ||
    (typeof val === 'object' &&
      val !== null &&
      !Array.isArray(val) &&
      Object.values(val).filter(Boolean).length === 0);

  const safeDeserialize = (value: string) => {
    try {
      return deserialize(value);
    } catch {
      return value;
    }
  };

  const parseUrlToState = useCallback((): Partial<T> => {
    const next: Partial<T> = {};
    Array.from(getSearchParams().entries()).forEach(([key, value]) => {
      next[key as keyof T] = safeDeserialize(value) as T[keyof T];
    });
    return next;
  }, [getSearchParams]);

  const buildSearchParams = useCallback((source: Record<string, unknown>) => {
    const next = new URLSearchParams();
    Object.entries(source).forEach(([key, val]) => {
      if (!isEmptyValue(val)) {
        try {
          next.set(key, serialize(val));
        } catch {
          // Skip values that cannot be serialized.
        }
      }
    });
    return next;
  }, []);

  const getInitialState = useCallback((): T => {
    const urlState = parseUrlToState();
    const base = (initialState ?? {}) as T;

    return { ...base, ...urlState };
  }, [initialState, parseUrlToState]);

  const [state, setState] = useState<T>(getInitialState);
  const lastSyncedUrlRef = useRef<string>(getSearchParams().toString());

  const debouncedWrite = useMemo(() => {
    const write = (nextStr: string) => {
      if (typeof window === 'undefined' || !syncUrl) return;
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${nextStr ? `?${nextStr}` : ''}${window.location.hash}`,
      );
      lastSyncedUrlRef.current = nextStr;
    };

    return (nextStr: string) => {
      window.clearTimeout(writeTimerRef.current);
      writeTimerRef.current = window.setTimeout(() => write(nextStr), debounceMs);
    };
  }, [debounceMs, syncUrl]);

  useEffect(
    () => () => {
      window.clearTimeout(writeTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!syncUrl || !initialState) {
      mountedRef.current = true;
      lastSyncedUrlRef.current = getSearchParams().toString();
      return;
    }

    if (mountedRef.current) return;

    mountedRef.current = true;

    const urlState = parseUrlToState();
    const merged = { ...(initialState as T), ...urlState };
    const nextParams = buildSearchParams(merged);
    const nextStr = nextParams.toString();

    if (nextStr !== getSearchParams().toString()) {
      lastSyncedUrlRef.current = nextStr;
      if (typeof window !== 'undefined') {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}?${nextStr}${window.location.hash}`,
        );
      }
    } else {
      lastSyncedUrlRef.current = getSearchParams().toString();
    }
  }, [buildSearchParams, getSearchParams, initialState, parseUrlToState, syncUrl]);

  useEffect(() => {
    if (!syncUrl) return;

    const syncFromUrl = () => {
      const currentUrlString = getSearchParams().toString();

      if (currentUrlString === lastSyncedUrlRef.current) {
        return;
      }

      isParsingSearchParamsRef.current = true;

      const parsed = parseUrlToState();
      setState({ ...(initialState ?? ({} as T)), ...parsed });

      lastSyncedUrlRef.current = currentUrlString;

      window.setTimeout(() => {
        isParsingSearchParamsRef.current = false;
      }, 200);
    };

    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [getSearchParams, initialState, parseUrlToState, syncUrl]);

  useEffect(() => {
    if (!syncUrl || isParsingSearchParamsRef.current) {
      return;
    }

    const nextStr = buildSearchParams(state).toString();

    if (
      nextStr === getSearchParams().toString() ||
      nextStr === lastSyncedUrlRef.current
    ) {
      return;
    }

    debouncedWrite(nextStr);
  }, [state, buildSearchParams, debouncedWrite, getSearchParams, syncUrl]);

  const setFilter = useCallback((key: keyof T, value: FilterValue | null | undefined) => {
    setState((prev) => ({
      ...prev,
      [key]: isEmptyValue(value) ? undefined : (value as T[keyof T]),
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(initialState ?? ({} as T));
  }, [initialState]);

  return {
    filters: state,
    setFilters: setFilter,
    clearFilters,
  };
};
