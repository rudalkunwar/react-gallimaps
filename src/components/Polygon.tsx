import React, { useEffect } from 'react';
import { useGallimapsAPI } from '../hooks/useGalliMaps';
import { PolygonProps } from '../types/components';

const Polygon: React.FC<PolygonProps> = ({
    coordinates,
    name,
    type = 'Polygon',
    style = {},
    onPolygonClick
}) => {
    const { drawPolygon, removePolygon, isReady } = useGallimapsAPI();

    useEffect(() => {
        if (!isReady || !coordinates.length) return;

        const polygon = drawPolygon({
            coordinates,
            name,
            type,
            style
        });

        if (onPolygonClick && polygon) {
            // Add click handler if provided
            // Implementation depends on the map library's API
        }

        return () => {
            removePolygon(name);
        };
    }, [isReady, coordinates, name, type, style, drawPolygon, removePolygon, onPolygonClick]);

    return null; // Polygon is rendered by the map
};

export default Polygon;
