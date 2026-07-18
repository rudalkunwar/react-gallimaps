/**
 * Base URL for the GalliMaps REST API (the documented `route-init` host).
 * Override via `GalliApiClient({ baseUrl })` if GalliMaps gives you a
 * different host or you proxy requests through your own backend.
 */
export const DEFAULT_BASE_URL = "https://route-init.gallimap.com/api/v1";

/**
 * Paths for the five officially documented GalliMaps REST endpoints,
 * relative to {@link DEFAULT_BASE_URL}.
 *
 * @see https://gallimaps.com/documentation
 */
export const ENDPOINTS = {
  /** Autocomplete search suggestions. */
  autocomplete: "/search/autocomplete",
  /** Full search by name relative to a current location. */
  search: "/search/currentLocation",
  /** Reverse geocoding (coordinates -> address). */
  reverse: "/reverse/generalReverse",
  /** Routing between two points (returns geometry). */
  routing: "/routing",
  /** Distance + duration only between two points. */
  distance: "/routing/distance",
} as const;
