import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@/config/query.client.config.js";

const defaultState = {
  status: "idle",
  data: null,
  error: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
};

export const useMutation = (options) => {
  const {
    mutationFn,
    onMutate,
    onSuccess,
    onError,
    onSettled,
  } = options;

  if (typeof mutationFn !== "function") {
    throw new Error("useMutation requiere mutationFn");
  }

  const queryClient = useQueryClient();
  const [state, setState] = useState(defaultState);
  const runningRef = useRef(0);

  const mutateAsync = useCallback(
    async (variables) => {
      runningRef.current += 1;
      const current = runningRef.current;
      setState({
        status: "loading",
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });

      let context;
      try {
        if (onMutate) {
          context = await onMutate(variables);
        }
        const data = await mutationFn(variables, { queryClient });
        if (runningRef.current !== current) {
          return data;
        }
        setState({
          status: "success",
          data,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });
        await onSuccess?.(data, variables, context);
        await onSettled?.(data, null, variables, context);
        return data;
      } catch (error) {
        if (runningRef.current !== current) {
          throw error;
        }
        setState({
          status: "error",
          data: null,
          error,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });
        await onError?.(error, variables, context);
        await onSettled?.(undefined, error, variables, context);
        throw error;
      }
    },
    [mutationFn, onMutate, onSuccess, onError, onSettled, queryClient],
  );

  const mutate = useCallback(
    (variables, callbacks = {}) => {
      mutateAsync(variables)
        .then((data) => callbacks.onSuccess?.(data, variables, undefined))
        .catch((error) => callbacks.onError?.(error, variables, undefined))
        .finally(() => callbacks.onSettled?.());
    },
    [mutateAsync],
  );

  const reset = useCallback(() => setState(defaultState), []);

  return {
    ...state,
    isIdle: state.status === "idle",
    mutate,
    mutateAsync,
    reset,
  };
};
