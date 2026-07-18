import type { MarkerData } from "./index";

/** Options accepted by the `useGallimapsAPI().displayPinMarker` helper. */
export interface MarkerOptions {
  position: [number, number];
  draggable?: boolean;
  color?: string;
}

/** Options accepted by the `useGallimapsAPI().drawPolygon` helper. */
export interface PolygonOptions {
  name: string;
  coordinates: Array<[number, number]>;
  type?: "Polygon" | "LineString" | "Point";
  style?: {
    color?: string;
    opacity?: number;
    width?: number;
    height?: number;
    radius?: number;
  };
}

export interface GallimapsAPIHook {
  displayPinMarker: (options: MarkerOptions) => unknown;
  removePinMarker: (marker: unknown) => void;
  autoCompleteSearch: (searchText: string) => Promise<unknown[]>;
  searchData: (searchText: string) => Promise<unknown>;
  drawPolygon: (options: PolygonOptions) => unknown;
  removePolygon: (name: string) => void;
  /** True once the map instance is available. */
  isReady: boolean;
}

/* ---------------------------------------------------------------- *
 * Component props
 * ---------------------------------------------------------------- */

export interface MarkerProps {
  position: [number, number];
  color?: string;
  draggable?: boolean;
  /** Called with the marker data when the marker is clicked on the map. */
  onClick?: (marker: MarkerData) => void;
}

export type PolygonProps = PolygonOptions;

export interface SearchProps {
  /** Called when a search result is selected. */
  onSelect?: (result: SearchResult) => void;
  /** Called whenever the list of autocomplete results updates. */
  onResults?: (results: SearchResult[]) => void;
  placeholder?: string;
  className?: string;
  /**
   * Latitude used for proximity ordering. When provided together with `lng`
   * and a REST client (via `<GallimapsProvider accessToken>`), the component
   * uses the REST autocomplete API and works without a rendered map. Otherwise
   * it falls back to the map plugin's search.
   */
  lat?: number;
  /** Longitude counterpart to {@link SearchProps.lat}. */
  lng?: number;
}

/** A single autocomplete result. The GalliMaps API returns loosely-typed
 * objects, so we model the fields we read and allow the rest. */
export interface SearchResult {
  name?: string;
  display_name?: string;
  [key: string]: unknown;
}
