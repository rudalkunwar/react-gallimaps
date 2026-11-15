import { useEffect, useRef } from "react";
import { useGallimapsAPI } from "../hooks/useGallimapsAPI";
import { useGallimaps } from "../context/GallimapsContext";
import { GalliMapMarker, MarkerData } from "../types";
import { MarkerProps } from "../types/components";

/** Module-level counter to generate stable, unique marker ids. */
let markerCounter = 0;

interface MarkerElementListener {
  element: Element;
  handleClick: (event: Event) => void;
}

/**
 * Renders a pin marker on the parent `<Gallimap />`. Renders nothing in the
 * DOM itself — the pin is drawn by the underlying map. `onClick` fires for
 * clicks on the pin element, with the map's proximity handler kept as a
 * fallback.
 */
const Marker = ({ position, draggable, color, onClick }: MarkerProps): null => {
  const { displayPinMarker, removePinMarker, isReady } = useGallimapsAPI();
  const { markersRef } = useGallimaps();
  const markerRef = useRef<unknown>(null);
  const listenerRef = useRef<MarkerElementListener | null>(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
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

      // `onClick` is read through a ref, so a new handler does not recreate
      // the pin (which would fly the map and drop the marker).
      const marker = markerRef.current as GalliMapMarker | null;
      const element = marker?.getElement?.();
      if (element) {
        const handleClick = (event: Event) => {
          event.stopPropagation();
          const entry = registry.get(markerId);
          entry?.onClick?.(entry);
        };
        element.addEventListener("click", handleClick);
        listenerRef.current = { element, handleClick };
      }
    }

    const entry: MarkerData = {
      position,
      onClick: (marker) => onClickRef.current?.(marker),
    };
    registry.set(markerId, entry);

    return () => {
      const listener = listenerRef.current;
      if (listener) {
        listener.element.removeEventListener("click", listener.handleClick);
        listenerRef.current = null;
      }
      if (markerRef.current) {
        removePinMarker(markerRef.current);
        markerRef.current = null;
      }
      registry.delete(markerId);
    };
    // `position` is destructured into lat/lng to keep the dep array stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, lat, lng, draggable, color, displayPinMarker, removePinMarker]);

  return null;
};

export default Marker;
