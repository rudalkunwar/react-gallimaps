// Base API Response Types
export interface BaseApiResponse {
  success: boolean;
  message: string;
}

// Autocomplete Search Types
export interface AutocompleteParams {
  accessToken: string;
  word: string;
  lat: number;
  lng: number;
}

export interface AutocompleteResult {
  name: string;
  province: string;
  distance: string;
  district: string;
  municipality: string;
  ward: string;
  geometry: string;
  nameLower: string;
  id: string;
}

export interface AutocompleteResponse extends BaseApiResponse {
  data: AutocompleteResult[];
}

// Search API Types
export interface SearchParams {
  accessToken: string;
  name: string;
  currentLat: number;
  currentLng: number;
}

export interface SearchFeatureProperties {
  searchedItem: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  distance: number;
}

export interface SearchFeatureGeometry {
  type: "Point" | "MultiLineString" | "MultiPolygon";
  coordinates: [number, number] | [number, number][] | [number, number][][];
}

export interface SearchFeature {
  type: "Feature";
  properties: SearchFeatureProperties;
  geometry: SearchFeatureGeometry;
}

export interface SearchData {
  type: "FeatureCollection";
  features: SearchFeature[];
}

export interface SearchResponse extends BaseApiResponse {
  data: SearchData;
}

// Reverse Geocoding Types
export interface ReverseGeocodingParams {
  accessToken: string;
  lat: number;
  lng: number;
}

export interface ReverseGeocodingData {
  generalName: string;
  roadName: string;
  place: string;
  municipality: string;
  ward: string;
  district: string;
  province: string;
}

export interface ReverseGeocodingResponse extends BaseApiResponse {
  data: ReverseGeocodingData;
}

// Routing Types
export type TransportMode = "driving" | "walking" | "cycling";

export interface RoutingParams {
  accessToken: string;
  mode: TransportMode;
  srcLat: number;
  srcLng: number;
  dstLat: number;
  dstLng: number;
}

export interface RouteSegment {
  distance: number;
  duration: number;
  latlngs: [number, number][];
}

export interface RoutingData {
  success: boolean;
  message: string;
  data: RouteSegment[];
}

export interface RoutingResponse extends BaseApiResponse {
  data: RoutingData;
}

// Distance API Types
export interface DistanceParams {
  accessToken: string;
  mode: TransportMode;
  srcLat: number;
  srcLng: number;
  dstLat: number;
  dstLng: number;
}

export interface DistanceData {
  success: boolean;
  message: string;
  data: {
    distance: number;
    duration: number;
  }[];
}

export interface DistanceResponse extends BaseApiResponse {
  data: DistanceData;
}

// Hook State Types
export interface UseAutocompleteState {
  data: AutocompleteResult[] | null;
  loading: boolean;
  error: string | null;
}

export interface UseSearchState {
  data: SearchData | null;
  loading: boolean;
  error: string | null;
}

export interface UseReverseGeocodingState {
  data: ReverseGeocodingData | null;
  loading: boolean;
  error: string | null;
}

export interface UseRoutingState {
  data: RoutingData | null;
  loading: boolean;
  error: string | null;
}

export interface UseDistanceState {
  data: DistanceData | null;
  loading: boolean;
  error: string | null;
}

// Component Props Types
export interface GalliMapsProviderProps {
  accessToken: string;
  children: React.ReactNode;
  config?: Partial<GalliMapsConfig>;
}

export interface AutocompleteInputProps {
  placeholder?: string;
  className?: string;
  onSelect?: (result: AutocompleteResult) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  minLength?: number;
  debounceMs?: number;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  maxResults?: number;
  "aria-label"?: string;
  "aria-describedby"?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
}

export interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSelect?: (result: SearchFeature) => void;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  style?: React.CSSProperties;
  "aria-label"?: string;
  "aria-describedby"?: string;
  id?: string;
  name?: string;
}

export interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title?: string;
    onClick?: () => void;
  }>;
  routes?: Array<{
    coordinates: [number, number][];
    color?: string;
    width?: number;
  }>;
  className?: string;
  style?: React.CSSProperties;
  language?: "en" | "ne";
}

// Error Types
export class GalliMapsError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "GalliMapsError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GalliMapsError);
    }
  }

  override toString(): string {
    return `${this.name}: ${this.message}${
      this.status ? ` (Status: ${this.status})` : ""
    }${this.code ? ` (Code: ${this.code})` : ""}`;
  }
}

// Configuration Types
export interface GalliMapsConfig {
  accessToken: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

// Enhanced API response types with better error handling
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: number;
    requestId?: string;
    rateLimit?: {
      limit: number;
      remaining: number;
      reset: number;
    };
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, any>;
  meta?: {
    timestamp: number;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Performance and monitoring types
export interface PerformanceMetrics {
  requestDuration: number;
  cacheHit?: boolean;
  retryCount?: number;
  errorCount?: number;
}

// Configuration enhancement
export interface AdvancedGalliMapsConfig extends GalliMapsConfig {
  enableCache?: boolean;
  cacheTimeout?: number;
  enableMetrics?: boolean;
  customHeaders?: Record<string, string>;
  interceptors?: {
    request?: (config: any) => any;
    response?: (response: any) => any;
  };
}

// Additional utility types
export interface Location {
  lat: number;
  lng: number;
}

export interface MapMarker {
  position: [number, number];
  title?: string;
  onClick?: () => void;
}

export interface MapRoute {
  coordinates: [number, number][];
  color?: string;
  width?: number;
}
