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
    autoComplete: [] as Array<{ text: string; lat?: number; lng?: number }>,
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
    autoCompleteSearch: async (text, lat, lng) => {
      calls.autoComplete.push({ text, lat, lng });
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

  it("restores the viewport after the plugin flies to a new marker", () => {
    const { api, ctx } = setup();
    const { plugin } = createFakePlugin();
    const center = { lat: 27.7172, lng: 85.324 };
    const stop = jest.fn();
    const jumpTo = jest.fn();
    plugin.map = { getCenter: () => center, getZoom: () => 14, stop, jumpTo };
    act(() => ctx.current!.setMapInstance(plugin));

    act(() => {
      api.current!.displayPinMarker({ position: [27.6736, 85.325] });
    });

    expect(stop).toHaveBeenCalledTimes(1);
    expect(jumpTo).toHaveBeenCalledWith({ center, zoom: 14 });
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
        [85.3, 27.7],
        [85.31, 27.71],
      ],
    ]);
  });

  it("converts LineString and Point coordinates to GeoJSON lng/lat order", () => {
    const { api, ctx } = setup();
    const { plugin, calls } = createFakePlugin();
    act(() => ctx.current!.setMapInstance(plugin));

    act(() => {
      api.current!.drawPolygon({
        name: "line",
        type: "LineString",
        coordinates: [
          [27.7, 85.3],
          [27.71, 85.31],
        ],
      });
      api.current!.drawPolygon({
        name: "point",
        type: "Point",
        coordinates: [[27.7, 85.3]],
      });
    });

    expect(calls.drawPolygon[0].geoJson.geometry.coordinates).toEqual([
      [85.3, 27.7],
      [85.31, 27.71],
    ]);
    expect(calls.drawPolygon[1].geoJson.geometry.coordinates).toEqual([85.3, 27.7]);
  });

  it("returns only array results from autocomplete", async () => {
    const { api, ctx } = setup();
    const { plugin } = createFakePlugin();
    act(() => ctx.current!.setMapInstance(plugin));

    const results = await api.current!.autoCompleteSearch("kat");
    expect(results).toEqual([{ name: "Kathmandu" }]);
    expect(api.current!.isReady).toBe(true);
  });

  it("forwards optional coordinates to the plugin autocomplete", async () => {
    const { api, ctx } = setup();
    const { plugin, calls } = createFakePlugin();
    act(() => ctx.current!.setMapInstance(plugin));

    await api.current!.autoCompleteSearch("pok", 28.2096, 83.9856);

    expect(calls.autoComplete).toEqual([{ text: "pok", lat: 28.2096, lng: 83.9856 }]);
  });
});
