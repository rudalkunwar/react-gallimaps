export interface GalliMapOptions {
  /** GalliMaps access token required for API access */
  accessToken: string;
  /** Map configuration options */
  map: {
    /** Container ID for the map (auto-generated if not provided) */
    container?: string;
    /** Map center coordinates [longitude, latitude] */
    center: [number, number];
    /** Initial zoom level */
    zoom: number;
    /** Maximum zoom level */
    maxZoom?: number;
    /** Minimum zoom level */
    minZoom?: number;
    /** Whether map is clickable */
    clickable?: boolean;
  };
  /** Panorama configuration (optional) */
  pano?: {
    /** Container ID for panorama view (auto-generated if not provided) */
    container?: string;
  };
  /** Custom click event handlers */
  customClickFunctions?: Array<(event: any) => void>;
}

export interface PinMarkerOptions {
  /** Marker position latitude */
  latitude: number;
  /** Marker position longitude */
  longitude: number;
  /** Marker name/title */
  name?: string;
  /** Popup text to display */
  popupText?: string;
  /** Marker color (hex, rgb, or named color) */
  color?: string;
  /** Whether the marker is draggable */
  draggable?: boolean;
}

export interface PolygonOptions {
  /** Unique name for the polygon */
  name: string;
  /** Polygon fill color */
  color: string;
  /** Polygon opacity (0-1) */
  opacity: number;
  /** Polygon height (for 3D polygons) */
  height?: number;
  /** Polygon width */
  width?: number;
  /** Polygon radius (for circular polygons) */
  radius?: number;
  /** Polygon center position [longitude, latitude] */
  latLng: [number, number];
  /** GeoJSON data for the polygon */
  geoJson: any;
}

export interface GalliMapRef {
  /** Add a pin marker to the map */
  displayPinMarker: (options: PinMarkerOptions) => any;
  /** Remove a pin marker from the map */
  removePinMarker: (marker: any) => void;
  /** Search for places with auto-complete functionality */
  autoCompleteSearch: (searchText: string) => Promise<any>;
  /** Search for a specific location */
  searchData: (searchText: string) => void;
  /** Draw a polygon on the map */
  drawPolygon: (options: PolygonOptions) => void;
  /** Remove a polygon from the map by name */
  removePolygon: (name: string) => void;
  /** Get the underlying GalliMaps instance */
  getMapInstance: () => any;
}
