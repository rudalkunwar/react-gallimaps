import { useState, useEffect, useCallback, useRef } from "react";
import { useGalliMapsClient } from "../context/GalliMapsContext";
import {
  AutocompleteResult,
  UseAutocompleteState,
  GalliMapsError,
} from "../types";

interface UseAutocompleteOptions {
  minLength?: number;
  debounceMs?: number;
  enabled?: boolean;
  onSuccess?: (data: AutocompleteResult[]) => void;
  onError?: (error: string) => void;
}

export const useAutocomplete = (
  word: string,
  lat: number,
  lng: number,
  options: UseAutocompleteOptions = {}
): UseAutocompleteState & {
  refetch: () => Promise<void>;
  clear: () => void;
} => {
  const {
    minLength = 3,
    debounceMs = 300,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const client = useGalliMapsClient();
  const [state, setState] = useState<UseAutocompleteState>({
    data: null,
    loading: false,
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const lastRequestRef = useRef<string>("");

  const fetchAutocomplete = useCallback(
    async (forceRefresh = false) => {
      const trimmedWord = word.trim();

      if (!enabled || trimmedWord.length < minLength) {
        setState({ data: null, loading: false, error: null });
        return;
      }

      // Check if this is the same request to avoid duplicate calls
      const requestKey = `${trimmedWord}-${lat}-${lng}`;
      if (!forceRefresh && lastRequestRef.current === requestKey) {
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      lastRequestRef.current = requestKey;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await client.autocomplete({
          word: trimmedWord,
          lat,
          lng,
        });

        // Check if request is still valid (not aborted)
        if (lastRequestRef.current === requestKey) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });
          onSuccess?.(response.data);
        }
      } catch (error: any) {
        if (
          error.name === "AbortError" ||
          lastRequestRef.current !== requestKey
        ) {
          return;
        }

        const errorMessage =
          error instanceof GalliMapsError
            ? error.message
            : "Failed to fetch autocomplete results";

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        onError?.(errorMessage);
      }
    },
    [client, word, lat, lng, minLength, enabled, onSuccess, onError]
  );

  const refetch = useCallback(async () => {
    await fetchAutocomplete(true);
  }, [fetchAutocomplete]);

  const clear = useCallback(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset state
    setState({ data: null, loading: false, error: null });
    lastRequestRef.current = "";
  }, []);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debouncing
    timeoutRef.current = setTimeout(() => {
      fetchAutocomplete();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchAutocomplete, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    clear,
  };
};
