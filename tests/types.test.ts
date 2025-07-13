import {
  GalliMapOptions,
  PinMarkerOptions,
  PolygonOptions,
  GalliMapRef,
} from "../src/types";

describe("Type Definitions", () => {
  it("GalliMapOptions has required properties", () => {
    const options: GalliMapOptions = {
      accessToken: "test-token",
      map: {
        center: [85.324, 27.7172],
        zoom: 13,
      },
    };

    expect(options.accessToken).toBe("test-token");
    expect(options.map.center).toEqual([85.324, 27.7172]);
    expect(options.map.zoom).toBe(13);
  });

  it("GalliMapOptions supports optional properties", () => {
    const options: GalliMapOptions = {
      accessToken: "test-token",
      map: {
        container: "map-container",
        center: [85.324, 27.7172],
        zoom: 13,
        maxZoom: 18,
        minZoom: 1,
        clickable: true,
      },
      pano: {
        container: "pano-container",
      },
      customClickFunctions: [() => {}],
    };

    expect(options.map.container).toBe("map-container");
    expect(options.map.maxZoom).toBe(18);
    expect(options.map.minZoom).toBe(1);
    expect(options.map.clickable).toBe(true);
    expect(options.pano?.container).toBe("pano-container");
    expect(options.customClickFunctions).toHaveLength(1);
  });

  it("PinMarkerOptions has correct structure", () => {
    const marker: PinMarkerOptions = {
      color: "#ff0000",
      draggable: true,
      latLng: [85.324, 27.7172],
    };

    expect(marker.color).toBe("#ff0000");
    expect(marker.draggable).toBe(true);
    expect(marker.latLng).toEqual([85.324, 27.7172]);
  });

  it("PolygonOptions has correct structure", () => {
    const polygon: PolygonOptions = {
      name: "test-polygon",
      color: "blue",
      opacity: 0.7,
      height: 100,
      width: 200,
      radius: 50,
      latLng: [85.324, 27.7172],
      geoJson: {
        type: "Polygon",
        coordinates: [
          [
            [85.324, 27.7172],
            [85.325, 27.7182],
            [85.323, 27.7162],
          ],
        ],
      },
    };

    expect(polygon.name).toBe("test-polygon");
    expect(polygon.color).toBe("blue");
    expect(polygon.opacity).toBe(0.7);
    expect(polygon.height).toBe(100);
    expect(polygon.width).toBe(200);
    expect(polygon.radius).toBe(50);
    expect(polygon.latLng).toEqual([85.324, 27.7172]);
    expect(polygon.geoJson.type).toBe("Polygon");
  });

  it("GalliMapRef has all required methods", () => {
    // This is more of a compile-time check, but we can verify the interface structure
    const mockRef: GalliMapRef = {
      displayPinMarker: jest.fn(),
      removePinMarker: jest.fn(),
      autoCompleteSearch: jest.fn(),
      searchData: jest.fn(),
      drawPolygon: jest.fn(),
      removePolygon: jest.fn(),
      getMapInstance: jest.fn(),
    };

    expect(typeof mockRef.displayPinMarker).toBe("function");
    expect(typeof mockRef.removePinMarker).toBe("function");
    expect(typeof mockRef.autoCompleteSearch).toBe("function");
    expect(typeof mockRef.searchData).toBe("function");
    expect(typeof mockRef.drawPolygon).toBe("function");
    expect(typeof mockRef.removePolygon).toBe("function");
    expect(typeof mockRef.getMapInstance).toBe("function");
  });
});
