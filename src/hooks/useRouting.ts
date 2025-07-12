import { useState, useCallback } from "react";
import { useGalliMapsClient } from "../context/GalliMapsContext";
import { RoutingData, UseRoutingState, TransportMode } from "../types";

interface UseRoutingOptions {
  enabled?: boolean;
}

export const useRouting = (
  options: UseRoutingOptions = {}
): UseRoutingState & {
  getRoute: (
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
  const [state, setState] = useState<UseRoutingState>({
    data: null,
    loading: false,
    error: null,
  });

  const getRoute = useCallback(
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
        const response = await client.getRoute({
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
          error: error.message || "Failed to get route",
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
    getRoute,
    clearResults,
  };
};
