import { useCallback } from "react";
import { useGallimaps } from "../context/GallimapsContext";
import { GallimapsAPIHook, MarkerOptions, PolygonOptions } from "../types/components";
import { GalliMarkerOptions, GalliPolygonOptions } from "../types";

/** Maps a React-friendly `MarkerOptions` to the native plugin shape. */
const toGalliMarker = (options: MarkerOptions): GalliMarkerOptions => ({
  latLng: options.position,
  draggable: options.draggable,
  color: options.color,
});

/** Maps a React-friendly `PolygonOptions` to the native GeoJSON-based shape. */
const toGalliPolygon = (options: PolygonOptions): GalliPolygonOptions => {
  const { coordinates, name, type = "Polygon", style = {} } = options;

  let geoJsonCoordinates: unknown;
  if (type === "Polygon") {
    geoJsonCoordinates = [coordinates];
  } else if (type === "LineString") {
    geoJsonCoordinates = coordinates;
  } else {
    geoJsonCoordinates = coordinates[0] ?? [0, 0];
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
      geometry: { type, coordinates: geoJsonCoordinates },
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

      // The plugin recenters the map when a marker is added; capture and
      // restore the current center so adding markers doesn't move the view.
      const currentCenter = mapInstance.getCenter?.() ?? null;
      const marker = mapInstance.displayPinMarker(toGalliMarker(options));

      if (currentCenter && typeof mapInstance.setCenter === "function") {
        setTimeout(() => mapInstance.setCenter?.(currentCenter), 50);
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
    async (searchText: string): Promise<unknown[]> => {
      if (!mapInstance) return [];
      const results = await mapInstance.autoCompleteSearch(searchText);
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
