import {
  GalliMapPlugin,
  GalliMarkerOptions,
  GalliPolygonOptions,
} from "./index";

// Wrapper types for React components
export interface MarkerOptions {
  position: [number, number];
  draggable?: boolean;
  color?: string;
  onClick?: () => void;
}

export interface SearchOptions {
  query: string;
  limit?: number;
}

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
  displayPinMarker: (options: MarkerOptions) => any;
  removePinMarker: (marker: any) => void;
  autoCompleteSearch: (searchText: string) => Promise<any>;
  searchData: (searchText: string) => Promise<any>;
  drawPolygon: (options: PolygonOptions) => any;
  removePolygon: (name: string) => void;
  isReady: boolean;
}

// Component Props Interfaces
export interface MarkerProps extends MarkerOptions {
  className?: string;
}

export interface SearchProps {
  onSelect?: (result: any) => void;
  placeholder?: string;
  className?: string;
  onResults?: (results: any[]) => void;
}

export interface PolygonProps extends PolygonOptions {
  onPolygonClick?: (event: any) => void;
}
