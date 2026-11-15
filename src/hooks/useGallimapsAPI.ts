import { useCallback } from "react";
import { useGallimaps } from "../context/GallimapsContext";
import { GallimapsAPIHook, MarkerOptions, PolygonOptions } from "../types/components";
import { GalliMapView, GalliMarkerOptions, GalliPolygonOptions } from "../types";

/** Maps a React-friendly `MarkerOptions` to the native plugin shape. */
const toGalliMarker = (options: MarkerOptions): GalliMarkerOptions => ({
  latLng: options.position,
  draggable: options.draggable,
  color: options.color,
});

/** Convert a public `[lat, lng]` pair to a GeoJSON `[lng, lat]` pair. */
const toLngLat = ([lat, lng]: [number, number]): [number, number] => [lng, lat];

/** Maps a React-friendly `PolygonOptions` to the native GeoJSON-based shape. */
const toGalliPolygon = (options: PolygonOptions): GalliPolygonOptions => {
  const { coordinates, name, type = "Polygon", style = {} } = options;
  const geoJsonCoordinates = coordinates.map(toLngLat);

  let geoJsonGeometry: unknown;
  if (type === "Polygon") {
    geoJsonGeometry = [geoJsonCoordinates];
  } else if (type === "LineString") {
    geoJsonGeometry = geoJsonCoordinates;
  } else {
    geoJsonGeometry = geoJsonCoordinates[0] ?? [0, 0];
  }

  return {
    name,
    color: style.color ?? "blue",
    opacity: style.opacity ?? 0.5,
    width: style.width,
    height: style.height,
    radius: style.radius,
    latLng: coordinates[0] ?? [0, 0],
    geoJson: {
      type: "Feature",
      geometry: { type, coordinates: geoJsonGeometry },
    },
  };
};

/**
 * Imperative access to the underlying GalliMaps plugin. Returns no-op safe
 * helpers when the map is not yet ready (`isReady === false`).
 */
export const useGallimapsAPI = (): GallimapsAPIHook => {
  const { mapInstance } = useGallimaps();

  const displayPinMarker = useCallback(
    (options: MarkerOptions) => {
      if (!mapInstance) return null;

      // `displayPinMarker` always calls `map.flyTo({ center, zoom: 20 })`.
      // Snapshot the viewport first, then cancel that animation and jump back
      // so declarative markers never steal the initial view.
      const view: GalliMapView | undefined = mapInstance.map;
      const currentCenter = view?.getCenter?.() ?? null;
      const currentZoom = view?.getZoom?.() ?? null;
      const marker = mapInstance.displayPinMarker(toGalliMarker(options));

      if (view && currentCenter && view.jumpTo) {
        view.stop?.();
        view.jumpTo({ center: currentCenter, zoom: currentZoom ?? undefined });
      } else {
        // Fallback for plugins that expose the old getCenter/setCenter pair.
        const legacyCenter = mapInstance.getCenter?.() ?? null;
        if (legacyCenter && typeof mapInstance.setCenter === "function") {
          setTimeout(() => mapInstance.setCenter?.(legacyCenter), 50);
        }
      }
      return marker;
    },
    [mapInstance],
  );

  const removePinMarker = useCallback(
    (marker: unknown) => {
      mapInstance?.removePinMarker(marker);
    },
    [mapInstance],
  );

  const autoCompleteSearch = useCallback(
    async (searchText: string, lat?: number, lng?: number): Promise<unknown[]> => {
      if (!mapInstance) return [];
      const results = await mapInstance.autoCompleteSearch(searchText, lat, lng);
      return Array.isArray(results) ? results : [];
    },
    [mapInstance],
  );

  const searchData = useCallback(
    (searchText: string) => {
      if (!mapInstance) return Promise.resolve(null);
      return mapInstance.searchData(searchText);
    },
    [mapInstance],
  );

  const drawPolygon = useCallback(
    (options: PolygonOptions) => {
      if (!mapInstance) return null;
      return mapInstance.drawPolygon(toGalliPolygon(options));
    },
    [mapInstance],
  );

  const removePolygon = useCallback(
    (name: string) => {
      mapInstance?.removePolygon(name);
    },
    [mapInstance],
  );

  return {
    displayPinMarker,
    removePinMarker,
    autoCompleteSearch,
    searchData,
    drawPolygon,
    removePolygon,
    isReady: !!mapInstance,
  };
};
