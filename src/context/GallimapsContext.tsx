import React, { createContext, useContext, useState } from 'react';
import { GallimapsContextType, GalliMapPlugin } from '../types';

const GallimapsContext = createContext<GallimapsContextType | undefined>(undefined);

export const GallimapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mapInstance, setMapInstance] = useState<GalliMapPlugin | null>(null);

    return (
        <GallimapsContext.Provider value={{ mapInstance, setMapInstance }}>
            {children}
        </GallimapsContext.Provider>
    );
};

export const useGallimaps = (): GallimapsContextType => {
    const context = useContext(GallimapsContext);
    if (context === undefined) {
        throw new Error('useGallimaps must be used within a GallimapsProvider');
    }
    return context;
};
