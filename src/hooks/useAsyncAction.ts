import { useCallback, useEffect, useRef, useState } from "react";

/** State shared by the imperative REST hooks. */
export interface AsyncState<T> {
  /** The most recent successful result, or `null`. */
  data: T | null;
  /** The most recent error, or `null`. */
  error: Error | null;
  /** True while a request is in flight. */
  loading: boolean;
}

export interface AsyncAction<P, T> extends AsyncState<T> {
  /** Trigger the request. Resolves with the data, or `null` if aborted/failed. */
  run: (params: P) => Promise<T | null>;
  /** Abort any in-flight request and clear state. */
  reset: () => void;
}

const isAbort = (err: unknown): boolean =>
  (err as { name?: string })?.name === "AbortError";

/**
 * Wraps an async, abortable function into a hook with `{ data, error, loading }`
 * plus a `run()` trigger. Guarantees latest-call-wins and aborts on unmount.
 */
export function useAsyncAction<P, T>(
  fn: (params: P, signal: AbortSignal) => Promise<T>,
): AsyncAction<P, T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const run = useCallback(
    async (params: P): Promise<T | null> => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await fn(params, controller.signal);
        if (controller.signal.aborted || !mountedRef.current) return null;
        setState({ data, error: null, loading: false });
        return data;
      } catch (err) {
        if (isAbort(err) || controller.signal.aborted || !mountedRef.current) {
          return null;
        }
        setState({ data: null, error: err as Error, loading: false });
        return null;
      }
    },
    [fn],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    if (mountedRef.current) {
      setState({ data: null, error: null, loading: false });
    }
  }, []);

  return { ...state, run, reset };
}
