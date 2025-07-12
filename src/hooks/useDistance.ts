import { useState, useCallback } from "react";
import { useGalliMapsClient } from "../context/GalliMapsContext";
import { DistanceData, UseDistanceState, TransportMode } from "../types";

interface UseDistanceOptions {
  enabled?: boolean;
}

export const useDistance = (
  options: UseDistanceOptions = {}
): UseDistanceState & {
  getDistance: (
    mode: TransportMode,
    srcLat: number,
    srcLng: number,
    dstLat: number,
    dstLng: number
  ) => Promise<void>;
  clearResults: () => void;
} => {
  const { enabled = true } = options;

  const client = useGalliMapsClient();
  const [state, setState] = useState<UseDistanceState>({
    data: null,
    loading: false,
    error: null,
  });

  const getDistance = useCallback(
    async (
      mode: TransportMode,
      srcLat: number,
      srcLng: number,
      dstLat: number,
      dstLng: number
    ) => {
      if (!enabled) {
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await client.getDistance({
          mode,
          srcLat,
          srcLng,
          dstLat,
          dstLng,
        });
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setState({
          data: null,
          loading: false,
          error: error.message || "Failed to get distance",
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
    getDistance,
    clearResults,
  };
};
