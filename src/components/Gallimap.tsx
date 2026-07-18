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

  const { setMapInstance, markersRef } = useGallimaps();
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

  // Keep the latest map config + init callback in refs so the init effect can
  // run exactly once without re-creating the map when inline props (e.g. a
  // `center` array literal or an inline `onMapInit`) change identity.
  const onMapInitRef = useRef(onMapInit);
  onMapInitRef.current = onMapInit;
  const configRef = useRef({
    resolvedMapOptions,
    panoContainerId,
    shareContainerId,
    shouldRenderShare,
  });
  configRef.current = {
    resolvedMapOptions,
    panoContainerId,
    shareContainerId,
    shouldRenderShare,
  };

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isBrowser()) return;
    if (scriptStatus !== "ready" || !mapRef.current) return;
    // Initialize only once per mount — never re-create the map on re-render.
    if (initializedRef.current) return;

    if (!accessToken) {
      setError("GalliMaps accessToken is required (see the docs).");
      return;
    }

    const {
      resolvedMapOptions: mapConfig,
      panoContainerId: panoIdNow,
      shareContainerId: shareIdNow,
      shouldRenderShare: withShare,
    } = configRef.current;

    initializedRef.current = true;
    setLoading(true);
    try {
      if (typeof mapConfig.container === "string") {
        mapRef.current.id = mapConfig.container;
      }

      const options: GallimapOptions = {
        accessToken,
        map: { ...mapConfig },
        customClickFunctions: [handleMapClick],
      };

      // The plugin constructor requires a `pano` container. We always render
      // one (hidden unless requested) so initialization never crashes.
      if (panoRef.current) {
        panoRef.current.id = panoIdNow;
        options.pano = { container: panoIdNow };
      }
      if (withShare && shareRef.current) {
        shareRef.current.id = shareIdNow;
        options.share = { container: shareIdNow };
      }

      const gallimap: GalliMapPlugin = new window.GalliMapPlugin(options);
      setMapInstance(gallimap);
      setError(null);
      onMapInitRef.current?.(gallimap);
    } catch (err) {
      initializedRef.current = false;
      console.error("GalliMaps initialization failed:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize map");
    } finally {
      setLoading(false);
    }

    return () => {
      initializedRef.current = false;
      setMapInstance(null);
    };
    // Init depends only on stable inputs; config/callbacks are read via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptStatus, accessToken, scriptUrl]);

  if (!isBrowser()) return null;

  return (
    <div className="gallimap-container">
      {loading && <div className="gallimap-loading">Loading map…</div>}
      {error && <div className="gallimap-error">Error: {error}</div>}

      <div ref={mapRef} style={mapStyle} className="gallimap" />

      {/* Always mounted: the plugin requires a pano container. Hidden unless requested. */}
      <div
        ref={panoRef}
        style={shouldRenderPano ? panoStyle : { display: "none" }}
        className="gallimap-pano"
      />
      {shouldRenderShare && (
        <div ref={shareRef} style={shareStyle} className="gallimap-share" />
      )}

      {children}
    </div>
  );
};

export default Gallimap;
