import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "./useQueryClient.js";

const buildResult = (state, previousData, keepPreviousData) => {
  const status = state?.status ?? "idle";
  const dataPresent = state?.data !== undefined ? state.data : undefined;
  const data =
    dataPresent !== undefined
      ? dataPresent
      : keepPreviousData
        ? previousData
        : undefined;

  return {
    data,
    error: state?.error ?? null,
    status,
    isLoading: status === "idle" || status === "loading",
    isFetching: state?.isFetching ?? status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    isStale: state?.isInvalidated ?? false,
  };
};

export const useQuery = (options) => {
  const {
    queryKey,
    queryFn,
    enabled = true,
    staleTime,
    cacheTime,
    keepPreviousData,
    refetchInterval,
    retry,
    onSuccess,
    onError,
    onSettled,
  } = options;

  if (!queryKey) {
    throw new Error("useQuery requiere un queryKey");
  }
  if (typeof queryFn !== "function") {
    throw new Error("useQuery requiere un queryFn");
  }

  const queryClient = useQueryClient();
  const defaultKeepPrevious =
    keepPreviousData ??
    queryClient.getDefaultQueryOptions().keepPreviousData ??
    false;

  const callbacksRef = useRef({ onSuccess, onError, onSettled });
  callbacksRef.current = { onSuccess, onError, onSettled };

  const [result, setResult] = useState(() => {
    const initial = queryClient.getQueryState(queryKey);
    return buildResult(initial, undefined, defaultKeepPrevious);
  });

  const previousDataRef = useRef(
    result.data !== undefined ? result.data : undefined,
  );

  const fetchOptions = useMemo(
    () => ({
      staleTime,
      cacheTime,
      retry,
    }),
    [staleTime, cacheTime, retry],
  );

  const runFetch = useCallback(
    (force = false) => {
      if (!enabled) {
        return Promise.resolve(result.data);
      }
      return queryClient.fetchQuery(
        queryKey,
        queryFn,
        {
          ...fetchOptions,
          onSuccess: (data) => callbacksRef.current.onSuccess?.(data),
          onError: (error) => callbacksRef.current.onError?.(error),
          onSettled: (data, error) =>
            callbacksRef.current.onSettled?.(data, error),
        },
        { force },
      );
    },
    [enabled, fetchOptions, queryClient, queryFn, queryKey, result.data],
  );

  useEffect(() => {
    const unsubscribe = queryClient.subscribe(queryKey, (state) => {
      setResult(
        buildResult(state, previousDataRef.current, defaultKeepPrevious),
      );
      if (state?.data !== undefined) {
        previousDataRef.current = state.data;
      }
    });
    return unsubscribe;
  }, [defaultKeepPrevious, queryClient, queryKey]);

  useEffect(() => {
    if (!enabled) return;
    if (queryClient.shouldFetch(queryKey, { staleTime })) {
      runFetch();
    }
  }, [enabled, queryClient, queryKey, runFetch, staleTime]);

  useEffect(() => {
    if (!enabled || !refetchInterval) return undefined;
    const timer = setInterval(() => {
      runFetch(true);
    }, refetchInterval);
    return () => clearInterval(timer);
  }, [enabled, refetchInterval, runFetch]);

  const refetch = useCallback(() => runFetch(true), [runFetch]);

  return {
    ...result,
    refetch,
  };
};
