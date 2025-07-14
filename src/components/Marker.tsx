import React, { useEffect, useState } from 'react';
import { useGallimapsAPI } from '../hooks/useGalliMaps';
import { MarkerProps } from '../types/components';

const Marker: React.FC<MarkerProps> = ({
    position,
    draggable,
    color,
    onClick,
    className
}) => {
    const { displayPinMarker, removePinMarker, isReady } = useGallimapsAPI();
    const [marker, setMarker] = useState<any>(null);

    useEffect(() => {
        if (!isReady) return;

        const newMarker = displayPinMarker({
            position,
            draggable,
            color,
            onClick
        });

        setMarker(newMarker);

        return () => {
            if (marker) {
                removePinMarker(marker);
            }
        };
    }, [isReady, position, draggable, color, onClick, displayPinMarker, removePinMarker]);

    return null; // Marker is rendered by the map
};

export default Marker;
