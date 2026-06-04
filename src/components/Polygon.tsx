import { useEffect } from "react";
import { useGallimapsAPI } from "../hooks/useGallimapsAPI";
import { PolygonProps } from "../types/components";

/**
 * Draws a polygon, line, or point on the parent `<Gallimap />`. Renders nothing
 * in the DOM — the shape is drawn by the underlying map.
 */
const Polygon = ({
  coordinates,
  name,
  type = "Polygon",
  style = {},
}: PolygonProps): null => {
  const { drawPolygon, removePolygon, isReady } = useGallimapsAPI();

  useEffect(() => {
    if (!isReady || coordinates.length === 0) return;

    drawPolygon({ coordinates, name, type, style });

    return () => removePolygon(name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, name, type, JSON.stringify(coordinates), JSON.stringify(style)]);

  return null;
};

export default Polygon;
