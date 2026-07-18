import { useCallback, useEffect, useRef, useState } from "react";
import { useGalliClient } from "./useGalliClient";
import type { AutocompleteResult } from "../api/types";

const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_MIN_LENGTH = 3;

export interface UseAutocompleteOptions {
  /** Latitude used to order suggestions by proximity. Required by the API. */
  lat: number;
  /** Longitude used to order suggestions by proximity. Required by the API. */
  lng: number;
  /** Debounce delay in ms before firing a request. Default `300`. */
  debounceMs?: number;
  /** Minimum query length before searching. Default `3`. */
  minLength?: number;
}

export interface UseAutocompleteResult {
  /** Current query string. */
  query: string;
  /** Update the query (triggers a debounced search). */
  setQuery: (query: string) => void;
  /** Latest suggestions. */
  results: AutocompleteResult[];
  /** True while a request is in flight. */
  loading: boolean;
  /** Latest error, or `null`. */
  error: Error | null;
  /** Clear the query and results. */
  clear: () => void;
}

const isAbort = (err: unknown): boolean =>
  (err as { name?: string })?.name === "AbortError";

/**
 * Debounced autocomplete search hook backed by the GalliMaps REST API.
 *
 * ```tsx
 * const { query, setQuery, results, loading } = useAutocomplete({
 *   lat: 27.7172,
 *   lng: 85.324,
 * });
 * ```
 */
export const useAutocomplete = (
  options: UseAutocompleteOptions,
): UseAutocompleteResult => {
  const client = useGalliClient();
  const {
    lat,
    lng,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    minLength = DEFAULT_MIN_LENGTH,
  } = options;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AutocompleteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const clear = useCallback(() => {
    controllerRef.current?.abort();
    setQuery("");
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < minLength) {
      controllerRef.current?.abort();
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const found = await client.autocomplete(
          { word: trimmed, lat, lng },
          { signal: controller.signal },
        );
        if (controller.signal.aborted || !mountedRef.current) return;
        setResults(found);
      } catch (err) {
        if (isAbort(err) || controller.signal.aborted || !mountedRef.current) return;
        setResults([]);
        setError(err as Error);
      } finally {
        if (!controller.signal.aborted && mountedRef.current) setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, lat, lng, minLength, debounceMs, client]);

  return { query, setQuery, results, loading, error, clear };
};
