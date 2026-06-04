import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { GallimapsContextType, GalliMapPlugin, MarkerData } from "../types";

const GallimapsContext = createContext<GallimapsContextType | undefined>(undefined);

/**
 * Provides the shared map instance and marker registry to all GalliMaps
 * components. Wrap your tree once, above any `<Gallimap />`.
 */
export const GallimapsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mapInstance, setMapInstance] = useState<GalliMapPlugin | null>(null);
  const markersRef = useRef<Map<string, MarkerData>>(new Map());

  const value = useMemo<GallimapsContextType>(
    () => ({ mapInstance, setMapInstance, markersRef }),
    [mapInstance],
  );

  return <GallimapsContext.Provider value={value}>{children}</GallimapsContext.Provider>;
};

export const useGallimaps = (): GallimapsContextType => {
  const context = useContext(GallimapsContext);
  if (context === undefined) {
    throw new Error("useGallimaps must be used within a <GallimapsProvider>");
  }
  return context;
};
