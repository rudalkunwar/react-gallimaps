import { useEffect, useRef } from "react";
import { useGallimapsAPI } from "../hooks/useGallimapsAPI";
import { useGallimaps } from "../context/GallimapsContext";
import { MarkerProps } from "../types/components";

/** Module-level counter to generate stable, unique marker ids. */
let markerCounter = 0;

/**
 * Renders a pin marker on the parent `<Gallimap />`. Renders nothing in the
 * DOM itself — the pin is drawn by the underlying map. `onClick` is dispatched
 * by the map's centralized click handler (requires `clickable` on `Gallimap`).
 */
const Marker = ({ position, draggable, color, onClick }: MarkerProps): null => {
  const { displayPinMarker, removePinMarker, isReady } = useGallimapsAPI();
  const { markersRef } = useGallimaps();
  const markerRef = useRef<unknown>(null);
  const idRef = useRef<string>();
  if (!idRef.current) {
    idRef.current = `gallimap-marker-${++markerCounter}`;
  }

  const [lat, lng] = position;

  useEffect(() => {
    if (!isReady) return;
    const markerId = idRef.current!;
    const registry = markersRef.current;

    if (!markerRef.current) {
      markerRef.current = displayPinMarker({ position, draggable, color });
    }
    registry.set(markerId, { position, onClick });

    return () => {
      if (markerRef.current) {
        removePinMarker(markerRef.current);
        markerRef.current = null;
      }
      registry.delete(markerId);
    };
    // `position` is destructured into lat/lng to keep the dep array stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, lat, lng, draggable, color, onClick, displayPinMarker, removePinMarker]);

  return null;
};

export default Marker;
