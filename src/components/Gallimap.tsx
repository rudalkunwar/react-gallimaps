import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGallimaps } from "../context/GallimapsContext";
import { useScript } from "../hooks/useScript";
import { GallimapProps, GallimapOptions, GalliMapPlugin } from "../types";
import { useMarkerRegistry, MarkerData } from "../context/MarkerRegistryContext";
import { isBrowser } from "../utils";

const SCRIPT_SRC = "https://gallimap.com/static/dist/js/gallimaps.vector.min.latest.js";
const DEFAULT_CENTER: [number, number] = [27.7172, 85.324];

const Gallimap: React.FC<GallimapProps> = ({
  accessToken,
  center = DEFAULT_CENTER,
  zoom = 15,
  minZoom = 5,
  maxZoom = 25,
  clickable = false,
  customClickFunctions = [],
  panoId,
  shareId,
  mapStyle = { width: "100%", height: "400px" },
  panoStyle = { width: "100%", height: "300px" },
  shareStyle = { width: "100%", height: "auto" },
  onMapInit,
  children
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const panoRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const mapContainerId = useMemo(() => `gallimap-${Date.now()}`, []);
  const panoContainerId = useMemo(
    () => (panoId ? panoId : `gallimap-pano-${Date.now()}`),
    [panoId]
  );
  const shareContainerId = useMemo(
    () => (shareId ? shareId : `gallimap-share-${Date.now()}`),
    [shareId]
  );

  const { mapInstance, setMapInstance } = useGallimaps();
  const markersRef = useMarkerRegistry();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scriptStatus = useScript(SCRIPT_SRC);

  // Track component mount state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Centralized marker click handler
  const handleMapClick = (event: any) => {
    if (!event || !event.lngLat || !markersRef) return;
    const { lat, lng } = event.lngLat;
    const threshold = 40; // meters
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371000;
    const distance = (a: [number, number], b: [number, number]) => {
      const dLat = toRad(b[0] - a[0]);
      const dLng = toRad(b[1] - a[1]);
      const aa =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
      return R * c;
    };

    let closestMarker: MarkerData | null = null;
    let minDist = threshold;
    for (const marker of markersRef.current.values() as IterableIterator<MarkerData>) {
      const dist = distance([lat, lng], marker.position);
      if (dist < minDist) {
        minDist = dist;
        closestMarker = marker;
      }
    }
    if (closestMarker?.onClick) closestMarker.onClick(closestMarker);
    customClickFunctions.forEach((fn) => fn(event));
  };

  // Initialize map when conditions are met
  useEffect(() => {
    if (!isBrowser()) return;
    if (scriptStatus !== "ready" || !isMounted || !mapRef.current || mapInstance) return;

    setLoading(true);

    try {
      const options: GallimapOptions = {
        accessToken,
        map: {
          container: mapContainerId,
          center,
          zoom,
          minZoom,
          maxZoom,
          clickable
        },
        customClickFunctions: [handleMapClick]
      };

      mapRef.current.id = mapContainerId;

      if (panoRef.current) {
        panoRef.current.id = panoContainerId;
        options.pano = { container: panoContainerId };
      }

      if (shareRef.current && shareId) {
        shareRef.current.id = shareContainerId;
        options.share = { container: shareContainerId };
      }

      const gallimap: GalliMapPlugin = new (window as any).GalliMapPlugin(options);
      setMapInstance(gallimap);
      setError(null);
      onMapInit?.(gallimap);
    } catch (err) {
      console.error("Gallimaps initialization failed:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize map");
    } finally {
      setLoading(false);
    }

    return () => {
      setMapInstance(null);
    };
  }, [
    scriptStatus,
    isMounted,
    accessToken,
    center,
    zoom,
    minZoom,
    maxZoom,
    clickable,
    mapContainerId,
    panoContainerId,
    shareContainerId,
    shareId,
    mapInstance,
    setMapInstance
  ]);

  if (!isBrowser()) return null;

  return (
    <div className="gallimap-container">
      {loading && <div className="map-loading">Loading map...</div>}
      {error && <div className="map-error">Error: {error}</div>}

      <div ref={mapRef} style={mapStyle} className="gallimap" />

      {panoId && <div ref={panoRef} style={panoStyle} className="gallimap-pano" />}

      {!panoId && (
        <div ref={panoRef} style={{ display: "none" }} className="gallimap-pano-hidden" />
      )}

      {shareId && <div ref={shareRef} style={shareStyle} className="gallimap-share" />}

      {children}
    </div>
  );
};

export default Gallimap;

