import { useRef, useCallback } from 'react';
import { GalliMapRef, PinMarkerOptions, PolygonOptions } from '../types';

export const useGalliMap = () => {
  const mapRef = useRef<GalliMapRef | null>(null);

  const addMarker = useCallback((options: PinMarkerOptions) => {
    return mapRef.current?.displayPinMarker(options);
  }, []);

  const removeMarker = useCallback((marker: any) => {
    mapRef.current?.removePinMarker(marker);
  }, []);

  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 3) return [];
    return mapRef.current?.autoCompleteSearch(query) ?? [];
  }, []);

  const searchLocation = useCallback((searchText: string) => {
    mapRef.current?.searchData(searchText);
  }, []);

  const addPolygon = useCallback((options: PolygonOptions) => {
    mapRef.current?.drawPolygon(options);
  }, []);

  const removePolygon = useCallback((name: string) => {
    mapRef.current?.removePolygon(name);
  }, []);

  return {
    mapRef,
    addMarker,
    removeMarker,
    searchPlaces,
    searchLocation,
    addPolygon,
    removePolygon,
  };
};