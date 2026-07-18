/* -------------------------------------------------------------------------- *
 * Shared
 * -------------------------------------------------------------------------- */

/** Modes of transport accepted by the routing/distance endpoints. */
export type TravelMode = "driving" | "walking" | "cycling";

/**
 * The envelope every GalliMaps REST endpoint wraps its payload in.
 * Note the routing/distance endpoints nest this envelope twice.
 */
export interface GalliApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Per-call options common to every client method. */
export interface RequestOptions {
  /** Abort the in-flight request (wire this to component unmount, etc.). */
  signal?: AbortSignal;
}

/* -------------------------------------------------------------------------- *
 * Autocomplete  — GET /search/autocomplete
 * -------------------------------------------------------------------------- */

export interface AutocompleteParams {
  /** Query string to autocomplete (minimum 3 characters). */
  word: string;
  /** Latitude of the current location (results are ordered by proximity). */
  lat: number;
  /** Longitude of the current location. */
  lng: number;
}

export interface AutocompleteResult {
  /** The general address suggested by the API. */
  name: string;
  province: string;
  /** Distance from the current location (as returned, a string). */
  distance: string;
  district: string;
  municipality: string;
  ward: string;
  /** Geometry type of the suggestion: point, polyline, or polygon. */
  geometry: string;
  /** Abbreviated / short form of the suggested name. */
  nameLower: string;
  /** Unique identifier of the suggested address. */
  id: string;
}

/* -------------------------------------------------------------------------- *
 * Search  — GET /search/currentLocation
 * -------------------------------------------------------------------------- */

export interface SearchParams {
  /** Query string to search for (place, landmark, or house number). */
  name: string;
  /** Latitude of the current location (reference point for ordering). */
  currentLat: number;
  /** Longitude of the current location. */
  currentLng: number;
}

export interface SearchFeatureProperties {
  searchedItem: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  /** Distance in meters from the current location. */
  distance: number;
}

export interface SearchFeatureGeometry {
  /** "Point", "MultiLineString", or "MultiPolygon". */
  type: string;
  /** GeoJSON coordinates; shape depends on `type`. */
  coordinates: unknown;
}

export interface SearchFeature {
  type: "Feature";
  properties: SearchFeatureProperties;
  geometry: SearchFeatureGeometry;
}

/** GeoJSON `FeatureCollection` returned by the search endpoint. */
export interface SearchFeatureCollection {
  type: "FeatureCollection";
  features: SearchFeature[];
}

/* -------------------------------------------------------------------------- *
 * Reverse geocoding  — GET /reverse/generalReverse
 * -------------------------------------------------------------------------- */

export interface ReverseGeocodeParams {
  /** Latitude of the location to reverse-geocode. */
  lat: number;
  /** Longitude of the location to reverse-geocode. */
  lng: number;
}

export interface ReverseGeocodeResult {
  /** General address name (street, neighborhood, etc.). May be empty. */
  generalName: string;
  roadName: string;
  place: string;
  municipality: string;
  ward: string;
  district: string;
  province: string;
}

/* -------------------------------------------------------------------------- *
 * Routing  — GET /routing
 * -------------------------------------------------------------------------- */

export interface RouteParams {
  /** Mode of transport. */
  mode: TravelMode;
  srcLat: number;
  srcLng: number;
  dstLat: number;
  dstLng: number;
}

export interface RouteResult {
  /** Total distance of the route, in meters. */
  distance: number;
  /** Total duration of the route, in seconds. */
  duration: number;
  /**
   * Ordered coordinate pairs describing the route geometry.
   * Each pair is `[longitude, latitude]` (GalliMaps / GeoJSON order).
   */
  latlngs: Array<[number, number]>;
}

/* -------------------------------------------------------------------------- *
 * Distance  — GET /routing/distance
 * -------------------------------------------------------------------------- */

export type DistanceParams = RouteParams;

export interface DistanceResult {
  /** Total distance, in meters. */
  distance: number;
  /** Total duration, in seconds. */
  duration: number;
}
