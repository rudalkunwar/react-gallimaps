// Core API Client
export { GalliMapsClient } from "./api/client";

// Context and Provider
export {
  GalliMapsProvider,
  useGalliMaps,
  useGalliMapsClient,
} from "./context/GalliMapsContext";

// Hooks
export { useAutocomplete } from "./hooks/useAutocomplete";
export { useSearch } from "./hooks/useSearch";
export { useReverseGeocoding } from "./hooks/useReverseGeocoding";
export { useRouting } from "./hooks/useRouting";
export { useDistance } from "./hooks/useDistance";

// Components
export { AutocompleteInput } from "./components/AutocompleteInput";
export { SearchInput } from "./components/SearchInput";
export { MapComponent } from "./components/MapComponent";

// Types
export type {
  // Base types
  BaseApiResponse,
  GalliMapsConfig,
  GalliMapsProviderProps,

  // Autocomplete types
  AutocompleteParams,
  AutocompleteResult,
  AutocompleteResponse,
  UseAutocompleteState,
  AutocompleteInputProps,

  // Search types
  SearchParams,
  SearchFeatureProperties,
  SearchFeatureGeometry,
  SearchFeature,
  SearchData,
  SearchResponse,
  UseSearchState,
  SearchInputProps,

  // Reverse geocoding types
  ReverseGeocodingParams,
  ReverseGeocodingData,
  ReverseGeocodingResponse,
  UseReverseGeocodingState,

  // Routing types
  TransportMode,
  RoutingParams,
  RouteSegment,
  RoutingData,
  RoutingResponse,
  UseRoutingState,

  // Distance types
  DistanceParams,
  DistanceData,
  DistanceResponse,
  UseDistanceState,

  // Map component types
  MapComponentProps,

  // Utility types
  Location,
  MapMarker,
  MapRoute,
} from "./types";

// Re-export the error class
export { GalliMapsError } from "./types";

// Utility functions
export {
  validateCoordinates,
  validateAccessToken,
  validateSearchWord,
  validateTransportMode,
  sanitizeInput,
  isValidUrl,
  validateTimeout,
} from "./utils/validation";
