import { useCallback } from "react";
import { useGalliClient } from "./useGalliClient";
import { useAsyncAction, AsyncAction } from "./useAsyncAction";
import type { RouteParams, RouteResult } from "../api/types";

export type UseRouteResult = AsyncAction<RouteParams, RouteResult[]>;

/**
 * Compute route geometry (and distance/duration) between two points.
 *
 * ```tsx
 * const { run, data, loading } = useRoute();
 * await run({ mode: "driving", srcLat, srcLng, dstLat, dstLng });
 * ```
 */
export const useRoute = (): UseRouteResult => {
  const client = useGalliClient();
  const fn = useCallback(
    (params: RouteParams, signal: AbortSignal) => client.route(params, { signal }),
    [client],
  );
  return useAsyncAction(fn);
};
