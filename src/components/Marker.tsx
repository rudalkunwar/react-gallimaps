import React, { useEffect, useRef } from 'react';
import { useGallimapsAPI } from '../hooks/useGalliMaps';
import { MarkerProps } from '../types/components';
import { useMarkerRegistry, MarkerData } from '../context/MarkerRegistryContext';

interface InternalMarkerProps extends MarkerProps {
    markerId: string;
}

const Marker: React.FC<InternalMarkerProps> = ({
    position,
    draggable,
    color,
    onClick,
    className,
    markerId
}) => {
    const { displayPinMarker, removePinMarker, isReady } = useGallimapsAPI();
    const markersRef = useMarkerRegistry();
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (!isReady || !markersRef) return;

        // Only add marker if not already present in registry and not already added in this ref
        if (!markersRef.current.has(markerId) && !markerRef.current) {
            const newMarker = displayPinMarker({ position, draggable, color });
            markerRef.current = newMarker;
            markersRef.current.set(markerId, { position, onClick } as MarkerData);
        } else {
            // Update onClick if marker already exists
            const existing = markersRef.current.get(markerId);
            if (existing) {
                markersRef.current.set(markerId, { ...existing, onClick });
            }
        }

        return () => {
            if (markerRef.current) {
                removePinMarker(markerRef.current);
                markerRef.current = null;
            }
            markersRef.current.delete(markerId);
        };
    }, [isReady, markerId, position[0], position[1], draggable, color, onClick, displayPinMarker, removePinMarker, markersRef]);

    return null; // Marker is rendered by the map
};

export default Marker;
