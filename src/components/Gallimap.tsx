import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGallimaps } from "../context/GallimapsContext";
import { useScript } from "../hooks/useScript";
import {
  GallimapProps,
  GallimapOptions,
  GalliMapClickEvent,
  GalliMapPlugin,
  MapOptions,
  MarkerData,
} from "../types";
import { isBrowser } from "../utils";

const SCRIPT_SRC = "https://gallimap.com/static/dist/js/gallimaps.vector.min.latest.js";
const DEFAULT_CENTER: [number, number] = [27.7172, 85.324];
/** Max distance (meters) for a map click to be attributed to a marker. */
const MARKER_CLICK_THRESHOLD_M = 40;
const EARTH_RADIUS_M = 6371000;

/** Great-circle distance between two [lat, lng] points, in meters. */
const haversine = (a: [number, number], b: [number, number]): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const Gallimap: React.FC<GallimapProps> = ({
  accessToken,
  center = DEFAULT_CENTER,
  zoom = 15,
  minZoom = 5,
  maxZoom = 25,
  clickable = false,
  mapOptions,
  customClickFunctions = [],
  pano = false,
  panoId,
  shareId,
  mapStyle = { width: "100%", height: "400px" },
  panoStyle = { width: "100%", height: "300px" },
  shareStyle = { width: "100%", height: "auto" },
  scriptUrl = SCRIPT_SRC,
  onMapInit,
  children,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const panoRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const mapContainerId = useMemo(() => `gallimap-${Date.now()}`, []);
  const panoContainerId = useMemo(
    () => panoId ?? `gallimap-pano-${Date.now()}`,
    [panoId],
  );
  const shareContainerId = useMemo(
    () => shareId ?? `gallimap-share-${Date.now()}`,
    [shareId],
  );

  const { mapInstance, setMapInstance, markersRef } = useGallimaps();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scriptStatus = useScript(scriptUrl);

  // Keep the latest custom click handlers without forcing the init effect to
  // re-run (and re-create the map) when the callback identity changes.
  const customClickRef = useRef(customClickFunctions);
  customClickRef.current = customClickFunctions;

  const handleMapClick = useCallback(
    (event: GalliMapClickEvent) => {
      if (event?.lngLat) {
        const { lat, lng } = event.lngLat;
        let closest: MarkerData | null = null;
        let minDist = MARKER_CLICK_THRESHOLD_M;
        for (const marker of markersRef.current.values()) {
          const dist = haversine([lat, lng], marker.position);
          if (dist < minDist) {
            minDist = dist;
            closest = marker;
          }
        }
        closest?.onClick?.(closest);
      }
      customClickRef.current.forEach((fn) => fn(event));
    },
    [markersRef],
  );

  const resolvedMapOptions: MapOptions = useMemo(
    () => ({
      container: mapOptions?.container ?? mapContainerId,
      center: mapOptions?.center ?? center,
      zoom: mapOptions?.zoom ?? zoom,
      minZoom: mapOptions?.minZoom ?? minZoom,
      maxZoom: mapOptions?.maxZoom ?? maxZoom,
      clickable: mapOptions?.clickable ?? clickable,
    }),
    [mapOptions, mapContainerId, center, zoom, minZoom, maxZoom, clickable],
  );

  const shouldRenderPano = Boolean(pano || panoId);
  const shouldRenderShare = Boolean(shareId);

  useEffect(() => {
    if (!isBrowser()) return;
    if (scriptStatus !== "ready" || !mapRef.current || mapInstance) return;

    if (!accessToken) {
      setError("GalliMaps accessToken is required (see the docs).");
      return;
    }

    setLoading(true);
    try {
      if (typeof resolvedMapOptions.container === "string") {
        mapRef.current.id = resolvedMapOptions.container;
      }

      const options: GallimapOptions = {
        accessToken,
        map: { ...resolvedMapOptions },
        customClickFunctions: [handleMapClick],
      };

      if (shouldRenderPano && panoRef.current) {
        panoRef.current.id = panoContainerId;
        options.pano = { container: panoContainerId };
      }
      if (shouldRenderShare && shareRef.current) {
        shareRef.current.id = shareContainerId;
        options.share = { container: shareContainerId };
      }

      const gallimap: GalliMapPlugin = new window.GalliMapPlugin(options);
      setMapInstance(gallimap);
      setError(null);
      onMapInit?.(gallimap);
    } catch (err) {
      console.error("GalliMaps initialization failed:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize map");
    } finally {
      setLoading(false);
    }

    return () => setMapInstance(null);
  }, [
    scriptStatus,
    accessToken,
    resolvedMapOptions,
    panoContainerId,
    shareContainerId,
    shouldRenderPano,
    shouldRenderShare,
    mapInstance,
    setMapInstance,
    handleMapClick,
    onMapInit,
  ]);

  if (!isBrowser()) return null;

  return (
    <div className="gallimap-container">
      {loading && <div className="gallimap-loading">Loading map…</div>}
      {error && <div className="gallimap-error">Error: {error}</div>}

      <div ref={mapRef} style={mapStyle} className="gallimap" />

      {shouldRenderPano && (
        <div ref={panoRef} style={panoStyle} className="gallimap-pano" />
      )}
      {shouldRenderShare && (
        <div ref={shareRef} style={shareStyle} className="gallimap-share" />
      )}

      {children}
    </div>
  );
};

export default Gallimap;
