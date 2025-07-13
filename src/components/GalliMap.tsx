import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { loadScript } from '../utils/loadScript';
import { GalliMapOptions, GalliMapRef } from '../types';

declare global {
    interface Window {
        GalliMapPlugin: any;
    }
}

interface GalliMapProps {
    options: GalliMapOptions;
    style?: React.CSSProperties;
    className?: string;
    panoStyle?: React.CSSProperties;
    panoClassName?: string;
    onMapLoad?: (map: any) => void;
    onMapError?: (error: Error) => void;
}

const GalliMap = forwardRef<GalliMapRef, GalliMapProps>(({
    options,
    style = { width: '100%', height: '400px' },
    className,
    panoStyle,
    panoClassName,
    onMapLoad,
    onMapError,
}, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const panoContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useImperativeHandle(ref, () => ({
        displayPinMarker: (markerOptions) => mapInstanceRef.current?.displayPinMarker(markerOptions),
        removePinMarker: (marker) => mapInstanceRef.current?.removePinMarker(marker),
        autoCompleteSearch: (searchText) => mapInstanceRef.current?.autoCompleteSearch(searchText),
        searchData: (searchText) => mapInstanceRef.current?.searchData(searchText),
        drawPolygon: (polygonOptions) => mapInstanceRef.current?.drawPolygon(polygonOptions),
        removePolygon: (name) => mapInstanceRef.current?.removePolygon(name),
        getMapInstance: () => mapInstanceRef.current,
    }));

    useEffect(() => {
        const initializeMap = async () => {
            try {
                setIsLoading(true);
                setError(null);

                await loadScript('https://gallimap.com/static/dist/js/gallimaps.vector.min.latest.js');

                const mapId = `gallimaps-${Date.now()}`;
                const panoId = `gallipano-${Date.now()}`;

                if (mapContainerRef.current) {
                    mapContainerRef.current.id = mapId;
                }
                if (panoContainerRef.current) {
                    panoContainerRef.current.id = panoId;
                }

                const galliMapsOptions = {
                    ...options,
                    map: { ...options.map, container: mapId },
                    pano: options.pano ? { ...options.pano, container: panoId } : undefined,
                };

                mapInstanceRef.current = new window.GalliMapPlugin(galliMapsOptions);
                onMapLoad?.(mapInstanceRef.current);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to initialize GalliMaps');
                setError(error);
                onMapError?.(error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeMap();

        return () => {
            mapInstanceRef.current = null;
        };
    }, [options, onMapLoad, onMapError]);

    if (error) {
        return (
            <div 
                style={{ 
                    color: '#dc3545', 
                    padding: '20px', 
                    textAlign: 'center',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    margin: '10px 0'
                }}
                data-testid="gallimap-error"
            >
                <strong>Error loading map:</strong> {error.message}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div 
                style={{ 
                    padding: '20px', 
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    margin: '10px 0'
                }}
                data-testid="gallimap-loading"
            >
                Loading GalliMaps...
            </div>
        );
    }

    return (
        <div>
            <div
                ref={mapContainerRef}
                style={style}
                className={className}
                data-testid="gallimap-container"
            />
            {options.pano && (
                <div
                    ref={panoContainerRef}
                    style={panoStyle}
                    className={panoClassName}
                    data-testid="gallimap-pano"
                />
            )}
        </div>
    );
});

GalliMap.displayName = 'GalliMap';

export default GalliMap;