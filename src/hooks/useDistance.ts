import { useCallback } from "react";
import { useGalliClient } from "./useGalliClient";
import { useAsyncAction, AsyncAction } from "./useAsyncAction";
import type { DistanceParams, DistanceResult } from "../api/types";

export type UseDistanceResult = AsyncAction<DistanceParams, DistanceResult[]>;

/**
 * Get distance + duration only (no geometry) between two points.
 *
 * ```tsx
 * const { run, data } = useDistance();
 * await run({ mode: "walking", srcLat, srcLng, dstLat, dstLng });
 * ```
 */
export const useDistance = (): UseDistanceResult => {
  const client = useGalliClient();
  const fn = useCallback(
    (params: DistanceParams, signal: AbortSignal) => client.distance(params, { signal }),
    [client],
  );
  return useAsyncAction(fn);
};
