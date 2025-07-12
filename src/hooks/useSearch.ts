import { useState, useCallback } from "react";
import { useGalliMapsClient } from "../context/GalliMapsContext";
import { SearchData, UseSearchState } from "../types";

interface UseSearchOptions {
  enabled?: boolean;
}

export const useSearch = (
  options: UseSearchOptions = {}
): UseSearchState & {
  search: (
    name: string,
    currentLat: number,
    currentLng: number
  ) => Promise<void>;
  clearResults: () => void;
} => {
  const { enabled = true } = options;

  const client = useGalliMapsClient();
  const [state, setState] = useState<UseSearchState>({
    data: null,
    loading: false,
    error: null,
  });

  const search = useCallback(
    async (name: string, currentLat: number, currentLng: number) => {
      if (!enabled || !name.trim()) {
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await client.search({ name, currentLat, currentLng });
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setState({
          data: null,
          loading: false,
          error: error.message || "Failed to search for locations",
        });
      }
    },
    [client, enabled]
  );

  const clearResults = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    search,
    clearResults,
  };
};
