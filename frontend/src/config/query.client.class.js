import { hashQueryKey, queryKeyMatches, toArrayKey } from "@/utils/query-key-utils.js";

const DEFAULT_STATE = {
  status: "idle",
  data: undefined,
  error: null,
  isFetching: false,
  isInvalidated: false,
};

const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

export class QueryClient {
  constructor(config = {}) {
    this.config = config;
    this._cache = new Map();
  }

  _defaultQueryOptions() {
    return this.config.defaultOptions?.queries ?? {};
  }

  _defaultMutationOptions() {
    return this.config.defaultOptions?.mutations ?? {};
  }

  _ensureEntry(queryKey) {
    const hash = hashQueryKey(queryKey);
    if (!this._cache.has(hash)) {
      this._cache.set(hash, {
        hash,
        queryKey: toArrayKey(queryKey),
        state: { ...DEFAULT_STATE },
        options: { ...this._defaultQueryOptions() },
        observers: new Set(),
        promise: null,
        gcTimer: null,
        updatedAt: 0,
        queryFn: null,
        fetchId: 0,
      });
    }
    const entry = this._cache.get(hash);
    entry.queryKey = toArrayKey(queryKey);
    return entry;
  }

  _clearGCTimer(entry) {
    if (entry.gcTimer) {
      clearTimeout(entry.gcTimer);
      entry.gcTimer = null;
    }
  }

  _scheduleGC(entry) {
    const cacheTime =
      entry.options.cacheTime ??
      this._defaultQueryOptions().cacheTime ??
      DEFAULT_CACHE_TIME;
    if (cacheTime === Infinity) return;
    this._clearGCTimer(entry);
    entry.gcTimer = setTimeout(() => {
      this._cache.delete(entry.hash);
    }, cacheTime);
  }

  _matchEntries(partialKey, exact = false) {
    const entries = Array.from(this._cache.values());
    if (!partialKey) return entries;
    return entries.filter((entry) =>
      queryKeyMatches(entry.queryKey, partialKey, exact),
    );
  }

  _notify(entry) {
    for (const listener of entry.observers) {
      listener(entry.state);
    }
  }

  subscribe(queryKey, listener) {
    const entry = this._ensureEntry(queryKey);
    entry.observers.add(listener);
    this._clearGCTimer(entry);
    listener(entry.state);
    return () => {
      entry.observers.delete(listener);
      if (entry.observers.size === 0 && !entry.promise) {
        this._scheduleGC(entry);
      }
    };
  }

  getDefaultQueryOptions() {
    return this._defaultQueryOptions();
  }

  getQueryState(queryKey) {
    const entry = this._cache.get(hashQueryKey(queryKey));
    if (!entry) return undefined;
    return {
      ...entry.state,
      dataUpdatedAt: entry.updatedAt,
    };
  }

  getQueryData(queryKey) {
    const state = this.getQueryState(queryKey);
    return state?.data;
  }

  setQueryData(queryKey, updater) {
    const entry = this._ensureEntry(queryKey);
    const previous = entry.state.data;
    const next =
      typeof updater === "function" ? updater(previous) : updater;
    entry.state = {
      ...entry.state,
      data: next,
      status: "success",
      error: null,
      isInvalidated: false,
    };
    entry.updatedAt = Date.now();
    this._notify(entry);
    return next;
  }

  shouldFetch(queryKey, { staleTime } = {}) {
    const entry = this._cache.get(hashQueryKey(queryKey));
    if (!entry) return true;
    if (entry.state.status === "idle") return true;
    if (entry.state.isInvalidated) return true;
    const effectiveStaleTime =
      staleTime ??
      entry.options.staleTime ??
      this._defaultQueryOptions().staleTime ??
      0;
    if (effectiveStaleTime === Infinity) return false;
    const lastUpdated = entry.updatedAt ?? 0;
    return Date.now() - lastUpdated > effectiveStaleTime;
  }

  async fetchQuery(queryKey, queryFn, options = {}, { force = false } = {}) {
    if (typeof queryFn !== "function" && !force) {
      throw new Error("queryFn es obligatorio para fetchQuery");
    }

    const entry = this._ensureEntry(queryKey);
    if (typeof queryFn === "function") {
      entry.queryFn = queryFn;
    }

    const effectiveOptions = {
      ...this._defaultQueryOptions(),
      ...entry.options,
      ...options,
    };

    if (!force && !this.shouldFetch(queryKey, { staleTime: effectiveOptions.staleTime })) {
      return entry.state.data;
    }

    if (entry.promise) {
      return entry.promise;
    }

    if (!entry.queryFn) {
      throw new Error("queryFn no definido para este queryKey");
    }

    entry.fetchId += 1;
    const currentFetchId = entry.fetchId;

    entry.state = {
      ...entry.state,
      status: entry.state.status === "idle" ? "loading" : entry.state.status,
      isFetching: true,
      error: null,
    };
    this._clearGCTimer(entry);
    this._notify(entry);

    const retryCount =
      typeof effectiveOptions.retry === "number"
        ? effectiveOptions.retry
        : 0;

    const attemptFetch = async () => {
      let attempt = 0;
      while (attempt <= retryCount) {
        try {
          const data = await entry.queryFn();
          if (entry.fetchId !== currentFetchId) {
            return data;
          }
          entry.state = {
            ...entry.state,
            data,
            status: "success",
            isFetching: false,
            isInvalidated: false,
            error: null,
          };
          entry.updatedAt = Date.now();
          entry.promise = null;
          this._notify(entry);
          effectiveOptions.onSuccess?.(data);
          effectiveOptions.onSettled?.(data, null);
          return data;
        } catch (error) {
          attempt += 1;
          if (entry.fetchId !== currentFetchId) {
            entry.promise = null;
            throw error;
          }
          if (attempt > retryCount) {
            entry.state = {
              ...entry.state,
              error,
              status: "error",
              isFetching: false,
            };
            entry.promise = null;
            this._notify(entry);
            effectiveOptions.onError?.(error);
            effectiveOptions.onSettled?.(undefined, error);
            throw error;
          }
        }
      }
      return entry.state.data;
    };

    entry.promise = attemptFetch();
    return entry.promise;
  }

  invalidateQueries({ queryKey, exact = false } = {}) {
    const matches = this._matchEntries(queryKey, exact);
    for (const entry of matches) {
      entry.state = { ...entry.state, isInvalidated: true };
      this._notify(entry);
      if (entry.observers.size > 0 && entry.queryFn) {
        this.fetchQuery(entry.queryKey, entry.queryFn, entry.options, {
          force: true,
        });
      }
    }
  }

  refetchQueries({ queryKey, exact = false } = {}) {
    const matches = this._matchEntries(queryKey, exact);
    return Promise.all(
      matches.map((entry) => {
        if (!entry.queryFn) return Promise.resolve(entry.state.data);
        return this.fetchQuery(entry.queryKey, entry.queryFn, entry.options, {
          force: true,
        });
      }),
    );
  }

  prefetchQuery({ queryKey, queryFn, options = {} }) {
    return this.fetchQuery(queryKey, queryFn, options, { force: true });
  }

  cancelQueries({ queryKey, exact = false } = {}) {
    const matches = this._matchEntries(queryKey, exact);
    for (const entry of matches) {
      entry.fetchId += 1;
      entry.promise = null;
      entry.state = { ...entry.state, isFetching: false };
      this._notify(entry);
    }
    return Promise.resolve();
  }

  removeQueries({ queryKey, exact = false } = {}) {
    const matches = this._matchEntries(queryKey, exact);
    for (const entry of matches) {
      this._clearGCTimer(entry);
      this._cache.delete(entry.hash);
    }
  }

  clear() {
    for (const entry of this._cache.values()) {
      this._clearGCTimer(entry);
    }
    this._cache.clear();
  }

  getQueryCache() {
    return {
      getAll: () =>
        Array.from(this._cache.values()).map((entry) => ({
          queryKey: entry.queryKey,
          state: {
            ...entry.state,
            dataUpdatedAt: entry.updatedAt,
          },
          observersCount: entry.observers.size,
          isStale: () => this.shouldFetch(entry.queryKey),
        })),
    };
  }
}
