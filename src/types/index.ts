import type React from "react";
import type { GalliApiClient } from "../api/client";

/**
 * Map configuration that mirrors the official GalliMaps `map` option object.
 */
export interface MapOptions {
  container: string | HTMLDivElement;
  center: [number, number];
  zoom: number;
  minZoom: number;
  maxZoom: number;
  clickable?: boolean;
}

/**
 * Options passed to the `GalliMapPlugin` constructor. Mirrors the official
 * (nested) shape: `{ accessToken, map: {...}, pano: {...} }`.
 */
export interface GallimapOptions {
  accessToken: string;
  map: MapOptions;
  customClickFunctions?: Array<(event: GalliMapClickEvent) => void>;
  pano?: {
    container: string | HTMLDivElement;
  };
  share?: {
    container: string | HTMLDivElement;
  };
}

/** Shape of the click event emitted by the GalliMaps plugin. */
export interface GalliMapClickEvent {
  lngLat?: { lat: number; lng: number };
  [key: string]: unknown;
}

/** Native GalliMaps marker options (as expected by the underlying plugin). */
export interface GalliMarkerOptions {
  color?: string;
  draggable?: boolean;
  latLng: [number, number];
}

/** Native GalliMaps polygon options (as expected by the underlying plugin). */
export interface GalliPolygonOptions {
  name: string;
  color?: string;
  opacity?: number;
  height?: number;
  width?: number;
  radius?: number;
  latLng?: [number, number];
  geoJson: {
    type: "Feature";
    geometry: {
      type: "Polygon" | "LineString" | "Point";
      coordinates: unknown;
    };
  };
}

/** The instance returned by `new window.GalliMapPlugin(options)`. */
export interface GalliMapPlugin {
  displayPinMarker: (options: GalliMarkerOptions) => unknown;
  removePinMarker: (marker: unknown) => void;
  autoCompleteSearch: (searchText: string) => Promise<unknown>;
  searchData: (searchText: string) => Promise<unknown>;
  drawPolygon: (options: GalliPolygonOptions) => unknown;
  removePolygon: (name: string) => void;
  getCenter?: () => [number, number];
  setCenter?: (center: [number, number]) => void;
}

export interface GalliMapPluginConstructor {
  new (options: GallimapOptions): GalliMapPlugin;
}

export type ScriptStatus = "idle" | "loading" | "ready" | "error";

declare global {
  interface Window {
    GalliMapPlugin: GalliMapPluginConstructor;
  }
}

/**
 * Data we track for each rendered `<Marker />` so the centralized map-click
 * handler can dispatch `onClick` to the nearest marker.
 */
export interface MarkerData {
  position: [number, number];
  onClick?: (marker: MarkerData) => void;
}

export interface GallimapProps {
  /** A valid GalliMaps access token. Required. */
  accessToken: string;
  /**
   * Map config as documented by GalliMaps: container, center, zoom, minZoom,
   * maxZoom, clickable. If omitted, sensible defaults are used and the
   * container id is generated automatically.
   */
  mapOptions?: Partial<MapOptions>;
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  /** Enables map click handling (required for `Marker` `onClick`). */
  clickable?: boolean;
  customClickFunctions?: Array<(event: GalliMapClickEvent) => void>;
  /**
   * Whether to render a panorama container. If true, a container is created
   * automatically. Provide `panoId` to control the DOM id.
   */
  pano?: boolean;
  panoId?: string;
  shareId?: string;
  mapStyle?: React.CSSProperties;
  panoStyle?: React.CSSProperties;
  shareStyle?: React.CSSProperties;
  /** Override the script URL if self-hosting the plugin. */
  scriptUrl?: string;
  /** Called once with the map instance after a successful initialization. */
  onMapInit?: (map: GalliMapPlugin) => void;
  children?: React.ReactNode;
}

export interface GallimapsContextType {
  mapInstance: GalliMapPlugin | null;
  setMapInstance: (map: GalliMapPlugin | null) => void;
  /** Registry of mounted markers, keyed by an auto-generated id. */
  markersRef: React.MutableRefObject<Map<string, MarkerData>>;
  /**
   * Client for the GalliMaps REST APIs, or `null` when the provider was not
   * given an `accessToken`/`client`. Access it via `useGalliClient()`.
   */
  apiClient: GalliApiClient | null;
}
