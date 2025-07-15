export interface GallimapOptions {
  accessToken: string;
  map: {
    container: string | HTMLDivElement;
    center: [number, number];
    zoom: number;
    minZoom: number;
    maxZoom: number;
    clickable?: boolean;
  };
  customClickFunctions?: Array<(event: any) => void>;
  pano?: {
    container: string | HTMLDivElement;
  };
}

// GalliMaps API marker options based on documentation
export interface GalliMarkerOptions {
  color?: string;
  draggable?: boolean;
  latLng: [number, number];
}

// GalliMaps API polygon options based on documentation
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
      coordinates: any;
    };
  };
}

export interface GalliMapPlugin {
  displayPinMarker: (options: GalliMarkerOptions) => any;
  removePinMarker: (marker: any) => void;
  autoCompleteSearch: (searchText: string) => Promise<any>;
  searchData: (searchText: string) => Promise<any>;
  drawPolygon: (options: GalliPolygonOptions) => any;
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

export interface GallimapProps {
  accessToken: string;
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  clickable?: boolean;
  customClickFunctions?: Array<(event: any) => void>;
  panoId?: string;
  mapStyle?: React.CSSProperties;
  panoStyle?: React.CSSProperties;
  onMapInit?: (map: GalliMapPlugin) => void;
  children?: React.ReactNode;
}

export interface GallimapsContextType {
  mapInstance: GalliMapPlugin | null;
  setMapInstance: (map: GalliMapPlugin | null) => void;
}
