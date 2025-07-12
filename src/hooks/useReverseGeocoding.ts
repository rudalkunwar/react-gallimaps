import { useState, useCallback } from "react";
import { useGalliMapsClient } from "../context/GalliMapsContext";
import { ReverseGeocodingData, UseReverseGeocodingState } from "../types";

interface UseReverseGeocodingOptions {
  enabled?: boolean;
}

export const useReverseGeocoding = (
  options: UseReverseGeocodingOptions = {}
): UseReverseGeocodingState & {
  reverseGeocode: (lat: number, lng: number) => Promise<void>;
  clearResults: () => void;
} => {
  const { enabled = true } = options;

  const client = useGalliMapsClient();
  const [state, setState] = useState<UseReverseGeocodingState>({
    data: null,
    loading: false,
    error: null,
  });

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!enabled) {
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await client.reverseGeocode({ lat, lng });
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setState({
          data: null,
          loading: false,
          error: error.message || "Failed to reverse geocode location",
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
    reverseGeocode,
    clearResults,
  };
};
