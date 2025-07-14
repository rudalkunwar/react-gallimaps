import React, { useEffect, useRef, useState } from 'react';
import { useGallimaps } from '../context/GallimapsContext';
import { useScript } from '../hooks/useScript';
import { GallimapProps, GalliMapPlugin, GallimapOptions } from '../types';

const Gallimap: React.FC<GallimapProps> = ({
    accessToken,
    center = [27.7172, 85.3240],  // Default: Kathmandu
    zoom = 15,
    minZoom = 5,
    maxZoom = 25,
    clickable = false,
    customClickFunctions = [],
    panoId,
    mapStyle = { width: '100%', height: '400px' },
    panoStyle = { width: '100%', height: '300px' },
    onMapInit,
    children
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const panoRef = useRef<HTMLDivElement>(null);
    const { mapInstance, setMapInstance } = useGallimaps();
    const [isMounted, setIsMounted] = useState(false);
    const scriptStatus = useScript('https://gallimap.com/static/dist/js/gallimaps.vector.min.latest.js');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track component mount state
    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // Initialize map when conditions are met
    useEffect(() => {
        if (scriptStatus !== 'ready' || !isMounted || !mapRef.current || mapInstance) return;

        setLoading(true);

        try {
            const options: GallimapOptions = {
                accessToken,
                map: {
                    container: 'gallimap-' + Date.now(), // Use a unique ID
                    center,
                    zoom,
                    minZoom,
                    maxZoom,
                    clickable
                },
                customClickFunctions
            };

            // Set the ID on the map div
            mapRef.current.id = options.map.container as string;

            // Always add pano configuration since the library expects it
            if (panoRef.current) {
                const panoContainerId = panoId ? 'gallimap-pano-' + Date.now() : 'gallimap-pano-hidden-' + Date.now();
                panoRef.current.id = panoContainerId;
                options.pano = { container: panoContainerId };
            }

            const gallimap = new window.GalliMapPlugin(options);
            setMapInstance(gallimap);
            setError(null);
            if (onMapInit) onMapInit(gallimap);
        } catch (err) {
            console.error('Gallimaps initialization failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to initialize map');
        } finally {
            setLoading(false);
        }

        return () => {
            if (mapInstance) {
                // Add any necessary cleanup logic here
                setMapInstance(null);
            }
        };
    }, [
        scriptStatus,
        isMounted,
        accessToken,
        center,
        zoom,
        mapInstance,
        panoId
    ]);

    return (
        <div className="gallimap-container">
            {loading && <div className="map-loading">Loading map...</div>}
            {error && <div className="map-error">Error: {error}</div>}

            <div
                ref={mapRef}
                style={mapStyle}
                className="gallimap"
            />

            {panoId && (
                <div
                    ref={panoRef}
                    style={panoStyle}
                    className="gallimap-pano"
                />
            )}

            {/* Hidden pano div for cases when panoId is not provided but library expects it */}
            {!panoId && (
                <div
                    ref={panoRef}
                    style={{ display: 'none' }}
                    className="gallimap-pano-hidden"
                />
            )}

            {children}
        </div>
    );
};

export default Gallimap;
