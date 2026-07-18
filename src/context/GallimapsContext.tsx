import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { GallimapsContextType, GalliMapPlugin, MarkerData } from "../types";
import { GalliApiClient, FetchLike } from "../api/client";

const GallimapsContext = createContext<GallimapsContextType | undefined>(undefined);

export interface GallimapsProviderProps {
  children: React.ReactNode;
  /**
   * GalliMaps access token used by the REST API hooks (`useAutocomplete`,
   * `useSearch`, `useReverseGeocode`, `useRoute`, `useDistance`). Optional —
   * omit it if you only use the map components, or pass a preconfigured
   * `client` instead.
   */
  accessToken?: string;
  /** Override the REST API base URL (e.g. to proxy through your backend). */
  baseUrl?: string;
  /** Custom fetch implementation for the REST client (older runtimes). */
  fetch?: FetchLike;
  /**
   * Provide a preconfigured {@link GalliApiClient} instead of `accessToken`.
   * Takes precedence over `accessToken`/`baseUrl`/`fetch`.
   */
  client?: GalliApiClient;
}

/**
 * Provides the shared map instance, marker registry, and (optionally) a
 * GalliMaps REST API client to all GalliMaps components and hooks. Wrap your
 * tree once, above any `<Gallimap />` or REST hook.
 */
export const GallimapsProvider: React.FC<GallimapsProviderProps> = ({
  children,
  accessToken,
  baseUrl,
  fetch: fetchImpl,
  client,
}) => {
  const [mapInstance, setMapInstance] = useState<GalliMapPlugin | null>(null);
  const markersRef = useRef<Map<string, MarkerData>>(new Map());

  const apiClient = useMemo<GalliApiClient | null>(() => {
    if (client) return client;
    if (!accessToken) return null;
    return new GalliApiClient({ accessToken, baseUrl, fetch: fetchImpl });
  }, [client, accessToken, baseUrl, fetchImpl]);

  const value = useMemo<GallimapsContextType>(
    () => ({ mapInstance, setMapInstance, markersRef, apiClient }),
    [mapInstance, apiClient],
  );

  return <GallimapsContext.Provider value={value}>{children}</GallimapsContext.Provider>;
};

export const useGallimaps = (): GallimapsContextType => {
  const context = useContext(GallimapsContext);
  if (context === undefined) {
    throw new Error("useGallimaps must be used within a <GallimapsProvider>");
  }
  return context;
};
