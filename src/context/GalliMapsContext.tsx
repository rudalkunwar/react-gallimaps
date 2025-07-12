import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { GalliMapsClient } from '../api/client';
import { GalliMapsConfig, GalliMapsProviderProps, GalliMapsError } from '../types';

interface GalliMapsContextType {
    client: GalliMapsClient;
    config: Readonly<GalliMapsConfig>;
    updateAccessToken: (token: string) => void;
    isConfigured: boolean;
}

const GalliMapsContext = createContext<GalliMapsContextType | null>(null);

export const GalliMapsProvider: React.FC<GalliMapsProviderProps> = ({
    accessToken,
    children,
    config = {},
}) => {
    const fullConfig: GalliMapsConfig = useMemo(() => ({
        accessToken,
        ...config,
    }), [accessToken, config]);

    const client = useMemo(() => {
        try {
            return new GalliMapsClient(fullConfig);
        } catch (error) {
            console.error('Failed to initialize GalliMaps client:', error);
            throw error;
        }
    }, [fullConfig]);

    const updateAccessToken = useCallback((token: string) => {
        try {
            client.updateAccessToken(token);
        } catch (error) {
            console.error('Failed to update access token:', error);
            throw error;
        }
    }, [client]);

    const isConfigured = useMemo(() => client.isConfigured(), [client]);

    const value: GalliMapsContextType = useMemo(() => ({
        client,
        config: fullConfig,
        updateAccessToken,
        isConfigured,
    }), [client, fullConfig, updateAccessToken, isConfigured]);

    return (
        <GalliMapsContext.Provider value={value}>
            {children}
        </GalliMapsContext.Provider>
    );
};

export const useGalliMaps = (): GalliMapsContextType => {
    const context = useContext(GalliMapsContext);

    if (!context) {
        throw new GalliMapsError(
            'useGalliMaps must be used within a GalliMapsProvider',
            undefined,
            'CONTEXT_ERROR'
        );
    }

    return context;
};

export const useGalliMapsClient = (): GalliMapsClient => {
    const { client } = useGalliMaps();
    return client;
}; 