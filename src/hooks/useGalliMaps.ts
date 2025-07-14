import { useCallback } from "react";
import { useGallimaps } from "../context/GallimapsContext";
import {
  GallimapsAPIHook,
  MarkerOptions,
  PolygonOptions,
} from "../types/components";
import { GalliMarkerOptions, GalliPolygonOptions } from "../types";

export const useGallimapsAPI = (): GallimapsAPIHook => {
  const { mapInstance } = useGallimaps();

  // Transform MarkerOptions to GalliMarkerOptions
  const transformMarkerOptions = (
    options: MarkerOptions
  ): GalliMarkerOptions => ({
    latLng: options.position,
    draggable: options.draggable,
    color: options.color,
  });

  // Transform PolygonOptions to GalliPolygonOptions
  const transformPolygonOptions = (
    options: PolygonOptions
  ): GalliPolygonOptions => {
    const { coordinates, name, type = "Polygon", style = {} } = options;

    let geoJsonCoordinates: any;

    if (type === "Polygon") {
      // For polygons, coordinates should be wrapped in an additional array
      geoJsonCoordinates = [coordinates];
    } else if (type === "LineString") {
      geoJsonCoordinates = coordinates;
    } else if (type === "Point") {
      // For points, use the first coordinate
      geoJsonCoordinates = coordinates[0] || [0, 0];
    }

    return {
      name,
      color: style.color || "blue",
      opacity: style.opacity || 0.5,
      width: style.width,
      height: style.height,
      radius: style.radius,
      latLng: coordinates[0] || [0, 0],
      geoJson: {
        type: "Feature",
        geometry: {
          type,
          coordinates: geoJsonCoordinates,
        },
      },
    };
  };

  // Marker methods
  const displayPinMarker = useCallback(
    (options: MarkerOptions) => {
      if (!mapInstance) return null;
      const galliOptions = transformMarkerOptions(options);
      return mapInstance.displayPinMarker(galliOptions);
    },
    [mapInstance]
  );

  const removePinMarker = useCallback(
    (marker: any) => {
      mapInstance?.removePinMarker(marker);
    },
    [mapInstance]
  );

  // Search methods
  const autoCompleteSearch = useCallback(
    (searchText: string) => {
      if (!mapInstance) return Promise.resolve([]);
      return mapInstance.autoCompleteSearch(searchText);
    },
    [mapInstance]
  );

  const searchData = useCallback(
    (searchText: string) => {
      if (!mapInstance) return Promise.resolve(null);
      return mapInstance.searchData(searchText);
    },
    [mapInstance]
  );

  // Polygon methods
  const drawPolygon = useCallback(
    (options: PolygonOptions) => {
      if (!mapInstance) return null;
      const galliOptions = transformPolygonOptions(options);
      return mapInstance.drawPolygon(galliOptions);
    },
    [mapInstance]
  );

  const removePolygon = useCallback(
    (name: string) => {
      mapInstance?.removePolygon(name);
    },
    [mapInstance]
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
