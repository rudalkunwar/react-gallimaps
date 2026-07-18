export { GalliApiClient } from "./client";
export type { FetchLike, GalliApiClientOptions } from "./client";
export { DEFAULT_BASE_URL, ENDPOINTS } from "./config";
export { GalliApiError, isGalliApiError } from "./errors";
export type { GalliApiErrorDetails } from "./errors";
export type {
  AutocompleteParams,
  AutocompleteResult,
  DistanceParams,
  DistanceResult,
  GalliApiEnvelope,
  RequestOptions,
  ReverseGeocodeParams,
  ReverseGeocodeResult,
  RouteParams,
  RouteResult,
  SearchFeature,
  SearchFeatureCollection,
  SearchFeatureGeometry,
  SearchFeatureProperties,
  SearchParams,
  TravelMode,
} from "./types";
