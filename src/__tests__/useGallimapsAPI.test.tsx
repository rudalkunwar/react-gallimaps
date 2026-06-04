import React from "react";
import { render, act } from "@testing-library/react";
import { GallimapsProvider, useGallimaps } from "../context/GallimapsContext";
import { useGallimapsAPI } from "../hooks/useGallimapsAPI";
import { GalliMapPlugin, GalliMarkerOptions, GalliPolygonOptions } from "../types";

/** A spyable fake of the GalliMaps plugin instance. */
const createFakePlugin = () => {
  const calls = {
    displayPinMarker: [] as GalliMarkerOptions[],
    drawPolygon: [] as GalliPolygonOptions[],
    removePolygon: [] as string[],
    autoComplete: [] as string[],
  };
  const plugin: GalliMapPlugin = {
    displayPinMarker: (opts) => {
      calls.displayPinMarker.push(opts);
      return { id: "marker" };
    },
    removePinMarker: () => {},
    drawPolygon: (opts) => {
      calls.drawPolygon.push(opts);
      return { id: "polygon" };
    },
    removePolygon: (name) => calls.removePolygon.push(name),
    autoCompleteSearch: async (text) => {
      calls.autoComplete.push(text);
      return [{ name: "Kathmandu" }];
    },
    searchData: async () => ({ ok: true }),
    getCenter: () => [27.7, 85.3],
    setCenter: () => {},
  };
  return { plugin, calls };
};

/** Renders both hooks and exposes them + a way to seed the map instance. */
function setup() {
  const api: { current: ReturnType<typeof useGallimapsAPI> | null } = {
    current: null,
  };
  const ctx: { current: ReturnType<typeof useGallimaps> | null } = {
    current: null,
  };

  const Probe = () => {
    ctx.current = useGallimaps();
    api.current = useGallimapsAPI();
    return null;
  };

  render(
    <GallimapsProvider>
      <Probe />
    </GallimapsProvider>,
  );

  return { api, ctx };
}

describe("useGallimapsAPI", () => {
  it("is not ready and is no-op safe before a map exists", async () => {
    const { api } = setup();
    expect(api.current!.isReady).toBe(false);
    expect(api.current!.displayPinMarker({ position: [1, 2] })).toBeNull();
    expect(api.current!.drawPolygon({ name: "x", coordinates: [[1, 2]] })).toBeNull();
    await expect(api.current!.autoCompleteSearch("ka")).resolves.toEqual([]);
  });

  it("transforms marker options to the native latLng shape", () => {
    jest.useFakeTimers();
    const { api, ctx } = setup();
    const { plugin, calls } = createFakePlugin();
    act(() => ctx.current!.setMapInstance(plugin));

    act(() => {
      api.current!.displayPinMarker({
        position: [27.7, 85.3],
        color: "red",
        draggable: true,
      });
    });

    expect(calls.displayPinMarker).toHaveLength(1);
    expect(calls.displayPinMarker[0]).toEqual({
      latLng: [27.7, 85.3],
      color: "red",
      draggable: true,
    });
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("wraps polygon coordinates in GeoJSON and applies style defaults", () => {
    const { api, ctx } = setup();
    const { plugin, calls } = createFakePlugin();
    act(() => ctx.current!.setMapInstance(plugin));

    act(() => {
      api.current!.drawPolygon({
        name: "area",
        coordinates: [
          [27.7, 85.3],
          [27.71, 85.31],
        ],
      });
    });

    const drawn = calls.drawPolygon[0];
    expect(drawn.name).toBe("area");
    expect(drawn.color).toBe("blue");
    expect(drawn.opacity).toBe(0.5);
    expect(drawn.geoJson.geometry.type).toBe("Polygon");
    expect(drawn.geoJson.geometry.coordinates).toEqual([
      [
        [27.7, 85.3],
        [27.71, 85.31],
      ],
    ]);
  });

  it("returns only array results from autocomplete", async () => {
    const { api, ctx } = setup();
    const { plugin } = createFakePlugin();
    act(() => ctx.current!.setMapInstance(plugin));

    const results = await api.current!.autoCompleteSearch("kat");
    expect(results).toEqual([{ name: "Kathmandu" }]);
    expect(api.current!.isReady).toBe(true);
  });
});
