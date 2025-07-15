import React, { createContext, useContext, useRef } from 'react';

export type MarkerData = { position: [number, number], onClick?: (marker: any) => void };

const MarkerRegistryContext = createContext<React.MutableRefObject<Map<string, MarkerData>> | null>(null);

export function MarkerRegistryProvider({ children }: { children: React.ReactNode }) {
    const markersRef = useRef<Map<string, MarkerData>>(new Map());
    return (
        <MarkerRegistryContext.Provider value={markersRef}>
            {children}
        </MarkerRegistryContext.Provider>
    );
}

export function useMarkerRegistry() {
    return useContext(MarkerRegistryContext);
} 