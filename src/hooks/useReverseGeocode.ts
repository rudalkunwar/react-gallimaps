import { useCallback } from "react";
import { useGalliClient } from "./useGalliClient";
import { useAsyncAction, AsyncAction } from "./useAsyncAction";
import type { ReverseGeocodeParams, ReverseGeocodeResult } from "../api/types";

export type UseReverseGeocodeResult = AsyncAction<
  ReverseGeocodeParams,
  ReverseGeocodeResult
>;

/**
 * Reverse-geocode a coordinate into an address.
 *
 * ```tsx
 * const { run, data, loading, error } = useReverseGeocode();
 * await run({ lat: 27.7172, lng: 85.324 });
 * ```
 */
export const useReverseGeocode = (): UseReverseGeocodeResult => {
  const client = useGalliClient();
  const fn = useCallback(
    (params: ReverseGeocodeParams, signal: AbortSignal) =>
      client.reverseGeocode(params, { signal }),
    [client],
  );
  return useAsyncAction(fn);
};
