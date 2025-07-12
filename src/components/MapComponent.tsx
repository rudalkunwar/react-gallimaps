import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MapComponentProps } from '../types';

// Import MapLibre CSS
import 'maplibre-gl/dist/maplibre-gl.css';

// Custom Language Control Class
class LanguageControl {
    private _map: maplibregl.Map | undefined;
    private _container: HTMLDivElement;
    private _currentLanguage: string;
    private _setLanguage: (lang: string) => void;

    constructor(currentLanguage: string, setLanguage: (lang: string) => void) {
        this._currentLanguage = currentLanguage;
        this._setLanguage = setLanguage;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        this._container.style.margin = '0';
        this._container.style.display = 'flex';
        this._container.style.flexDirection = 'column';

        const enButton = document.createElement('button');
        enButton.type = 'button';
        enButton.textContent = 'EN';
        enButton.style.padding = '4px 8px';
        enButton.style.fontSize = '11px';
        enButton.style.fontWeight = currentLanguage === 'en' ? 'bold' : 'normal';
        enButton.style.backgroundColor = currentLanguage === 'en' ? '#e6f3ff' : 'white';
        enButton.style.border = 'none';
        enButton.style.cursor = 'pointer';
        enButton.onclick = () => this._setLanguage('en');

        const neButton = document.createElement('button');
        neButton.type = 'button';
        neButton.textContent = 'नेपाली';
        neButton.style.padding = '4px 8px';
        neButton.style.fontSize = '10px';
        neButton.style.fontWeight = currentLanguage === 'ne' ? 'bold' : 'normal';
        neButton.style.backgroundColor = currentLanguage === 'ne' ? '#e6f3ff' : 'white';
        neButton.style.border = 'none';
        neButton.style.cursor = 'pointer';
        neButton.onclick = () => this._setLanguage('ne');

        this._container.appendChild(enButton);
        this._container.appendChild(neButton);
    }

    onAdd(map: maplibregl.Map): HTMLElement {
        this._map = map;
        return this._container;
    }

    onRemove(): void {
        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        this._map = undefined;
    }
}

export const MapComponent: React.FC<MapComponentProps> = ({
    center = [27.7172, 85.3240], // Default to Kathmandu
    zoom = 12,
    markers = [],
    routes = [],
    className = '',
    style = {},
    language = 'en'
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<maplibregl.Map | null>(null);
    const markersRef = useRef<maplibregl.Marker[]>([]);
    const [currentLanguage, setCurrentLanguage] = useState(language);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Language-specific tile sources
    const getTileSource = (lang: string) => {
        switch (lang) {
            case 'ne':
                // For Nepali, we'll use a localized OSM source or custom tiles
                return {
                    type: 'raster' as const,
                    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '© OpenStreetMap contributors'
                };
            case 'en':
            default:
                return {
                    type: 'raster' as const,
                    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '© OpenStreetMap contributors'
                };
        }
    };

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize MapLibre GL map
        mapInstanceRef.current = new maplibregl.Map({
            container: mapRef.current,
            style: {
                version: 8,
                sources: {
                    'osm': getTileSource(currentLanguage)
                },
                layers: [
                    {
                        id: 'osm',
                        type: 'raster',
                        source: 'osm'
                    }
                ]
            },
            center: [center[1], center[0]], // MapLibre uses [lng, lat]
            zoom: zoom,
        });

        // Add navigation controls
        mapInstanceRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Add language toggle control after style loads
        mapInstanceRef.current.on('load', () => {
            if (mapInstanceRef.current) {
                setIsMapLoaded(true);
                const languageControl = new LanguageControl(currentLanguage, (lang: string) => {
                    setCurrentLanguage(lang as 'en' | 'ne');
                });
                mapInstanceRef.current.addControl(languageControl, 'top-left');
            }
        });

        // Cleanup on unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []); // Only initialize once

    // Update map center and zoom when props change
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter([center[1], center[0]]);
            mapInstanceRef.current.setZoom(zoom);
        }
    }, [center, zoom]);

    // Update markers when they change
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        markers.forEach(markerData => {
            const marker = new maplibregl.Marker()
                .setLngLat([markerData.position[1], markerData.position[0]]) // [lng, lat]
                .addTo(mapInstanceRef.current!);

            if (markerData.title) {
                const popup = new maplibregl.Popup({ offset: 25 })
                    .setHTML(`<div style="font-size: 14px;">${markerData.title}</div>`);
                marker.setPopup(popup);
            }

            markersRef.current.push(marker);
        });
    }, [markers]);

    // Update routes when they change
    useEffect(() => {
        if (!mapInstanceRef.current || !routes.length) return;

        const updateRoutes = () => {
            if (!mapInstanceRef.current) return;

            try {
                routes.forEach((route, index) => {
                    const sourceId = `route-${index}`;
                    const layerId = `route-layer-${index}`;

                    // Check if style is loaded before manipulating sources/layers
                    if (mapInstanceRef.current!.isStyleLoaded()) {
                        // Remove existing route if it exists
                        if (mapInstanceRef.current!.getLayer(layerId)) {
                            mapInstanceRef.current!.removeLayer(layerId);
                        }
                        if (mapInstanceRef.current!.getSource(sourceId)) {
                            mapInstanceRef.current!.removeSource(sourceId);
                        }

                        // Add route source and layer
                        mapInstanceRef.current!.addSource(sourceId, {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'LineString',
                                    coordinates: route.coordinates.map(coord => [coord[1], coord[0]]) // Convert to [lng, lat]
                                }
                            }
                        });

                        mapInstanceRef.current!.addLayer({
                            id: layerId,
                            type: 'line',
                            source: sourceId,
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': route.color || '#007bff',
                                'line-width': route.width || 4
                            }
                        });
                    } else {
                        // Wait for style to load then add routes
                        mapInstanceRef.current!.once('styledata', () => {
                            if (!mapInstanceRef.current) return;

                            // Remove existing route if it exists
                            if (mapInstanceRef.current!.getLayer(layerId)) {
                                mapInstanceRef.current!.removeLayer(layerId);
                            }
                            if (mapInstanceRef.current!.getSource(sourceId)) {
                                mapInstanceRef.current!.removeSource(sourceId);
                            }

                            // Add route source and layer
                            mapInstanceRef.current!.addSource(sourceId, {
                                type: 'geojson',
                                data: {
                                    type: 'Feature',
                                    properties: {},
                                    geometry: {
                                        type: 'LineString',
                                        coordinates: route.coordinates.map(coord => [coord[1], coord[0]]) // Convert to [lng, lat]
                                    }
                                }
                            });

                            mapInstanceRef.current!.addLayer({
                                id: layerId,
                                type: 'line',
                                source: sourceId,
                                layout: {
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                },
                                paint: {
                                    'line-color': route.color || '#007bff',
                                    'line-width': route.width || 4
                                }
                            });
                        });
                    }
                });
            } catch (error) {
                console.warn('Error updating routes:', error);
            }
        };

        updateRoutes();
    }, [routes]);

    // Update map language when currentLanguage changes
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const updateMapStyle = () => {
            if (!mapInstanceRef.current) return;

            try {
                // Update the tile source for language change
                const newSource = getTileSource(currentLanguage);

                // Check if style is loaded before manipulating sources/layers
                if (mapInstanceRef.current.isStyleLoaded()) {
                    if (mapInstanceRef.current.getLayer('osm')) {
                        mapInstanceRef.current.removeLayer('osm');
                    }
                    if (mapInstanceRef.current.getSource('osm')) {
                        mapInstanceRef.current.removeSource('osm');
                    }

                    mapInstanceRef.current.addSource('osm', newSource);
                    mapInstanceRef.current.addLayer({
                        id: 'osm',
                        type: 'raster',
                        source: 'osm'
                    });
                } else {
                    // Wait for style to load then update
                    mapInstanceRef.current.once('styledata', () => {
                        if (!mapInstanceRef.current) return;

                        if (mapInstanceRef.current.getLayer('osm')) {
                            mapInstanceRef.current.removeLayer('osm');
                        }
                        if (mapInstanceRef.current.getSource('osm')) {
                            mapInstanceRef.current.removeSource('osm');
                        }

                        mapInstanceRef.current.addSource('osm', newSource);
                        mapInstanceRef.current.addLayer({
                            id: 'osm',
                            type: 'raster',
                            source: 'osm'
                        });
                    });
                }
            } catch (error) {
                console.warn('Error updating map style:', error);
            }
        };

        updateMapStyle();
    }, [currentLanguage]);

    return (
        <div
            ref={mapRef}
            className={`gallimaps-map ${className}`}
            style={{
                width: '100%',
                height: '400px',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                ...style,
            }}
        >
            {!isMapLoaded && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    fontSize: '14px',
                    color: '#666'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '8px' }}>🗺️</div>
                        <div>Loading map...</div>
                    </div>
                </div>
            )}
        </div>
    );
};