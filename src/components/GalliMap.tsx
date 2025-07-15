import React, { useEffect, useRef, useState } from 'react';
import { useGallimaps } from '../context/GallimapsContext';
import { useScript } from '../hooks/useScript';
import { GallimapProps, GalliMapPlugin, GallimapOptions } from '../types';
import { useMarkerRegistry, MarkerData } from '../context/MarkerRegistryContext';

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
    const markersRef = useMarkerRegistry();
    const [isMounted, setIsMounted] = useState(false);
    const scriptStatus = useScript('https://gallimap.com/static/dist/js/gallimaps.vector.min.latest.js');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track component mount state
    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // Centralized marker click handler
    const handleMapClick = (event: any) => {
        if (!event || !event.lngLat || !markersRef) return;
        const { lat, lng } = event.lngLat;
        const threshold = 40; // meters
        const toRad = (x: number) => x * Math.PI / 180;
        const R = 6371000;
        const distance = (a: [number, number], b: [number, number]) => {
            const dLat = toRad(b[0] - a[0]);
            const dLng = toRad(b[1] - a[1]);
            const aa = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
            return R * c;
        };
        // Find the closest marker within the threshold
        let closestMarker: MarkerData | null = null;
        let minDist = threshold;
        for (const marker of markersRef.current.values() as IterableIterator<MarkerData>) {
            const dist = distance([lat, lng], marker.position);
            if (dist < minDist) {
                minDist = dist;
                closestMarker = marker;
            }
        }
        if (closestMarker && closestMarker.onClick) closestMarker.onClick(closestMarker);
        // Call any user customClickFunctions
        customClickFunctions.forEach(fn => fn(event));
    };

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
                customClickFunctions: [handleMapClick]
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
