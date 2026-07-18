import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { GallimapsProvider } from "../context/GallimapsContext";
import { GalliApiClient, FetchLike } from "../api/client";
import {
  useReverseGeocode,
  useRoute,
  useDistance,
  useAutocomplete,
  useSearch,
  useOptionalGalliClient,
} from "../hooks";

/** A fake fetch that returns canned bodies based on the requested endpoint. */
const routingFetch: FetchLike = async (url) => {
  let body: unknown;
  if (url.includes("/search/autocomplete")) {
    body = { success: true, message: "", data: [{ name: "Kathmandu", id: "1" }] };
  } else if (url.includes("/search/currentLocation")) {
    body = {
      success: true,
      message: "",
      data: { type: "FeatureCollection", features: [{ type: "Feature" }] },
    };
  } else if (url.includes("/reverse/")) {
    body = { success: true, message: "", data: { generalName: "Thamel" } };
  } else if (url.includes("/routing/distance")) {
    body = {
      success: true,
      message: "",
      data: { success: true, message: "", data: [{ distance: 10, duration: 5 }] },
    };
  } else if (url.includes("/routing")) {
    body = {
      success: true,
      message: "",
      data: {
        success: true,
        message: "",
        data: [{ distance: 1, duration: 1, latlngs: [] }],
      },
    };
  } else {
    body = { success: true, message: "", data: null };
  }
  return { ok: true, status: 200, text: async () => JSON.stringify(body) };
};

const failingFetch: FetchLike = async () => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify({ success: false, message: "No results" }),
});

const makeClient = (fetch: FetchLike) =>
  new GalliApiClient({ accessToken: "test-token", fetch });

describe("REST hooks", () => {
  it("useOptionalGalliClient returns null without an access token", () => {
    let client: unknown = "unset";
    const Probe = () => {
      client = useOptionalGalliClient();
      return null;
    };
    render(
      <GallimapsProvider>
        <Probe />
      </GallimapsProvider>,
    );
    expect(client).toBeNull();
  });

  it("throws a clear error when a REST hook is used without a client", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const Probe = () => {
      useReverseGeocode();
      return null;
    };
    expect(() =>
      render(
        <GallimapsProvider>
          <Probe />
        </GallimapsProvider>,
      ),
    ).toThrow(/No GalliMaps REST client/);
    spy.mockRestore();
  });

  it("useReverseGeocode resolves data and toggles loading", async () => {
    let hook: ReturnType<typeof useReverseGeocode>;
    const Probe = () => {
      hook = useReverseGeocode();
      return null;
    };
    render(
      <GallimapsProvider client={makeClient(routingFetch)}>
        <Probe />
      </GallimapsProvider>,
    );

    let result: unknown;
    await act(async () => {
      result = await hook!.run({ lat: 27.7, lng: 85.3 });
    });

    expect(result).toEqual({ generalName: "Thamel" });
    expect(hook!.data).toEqual({ generalName: "Thamel" });
    expect(hook!.loading).toBe(false);
    expect(hook!.error).toBeNull();
  });

  it("useRoute and useDistance unwrap nested route data", async () => {
    let route: ReturnType<typeof useRoute>;
    let distance: ReturnType<typeof useDistance>;
    const Probe = () => {
      route = useRoute();
      distance = useDistance();
      return null;
    };
    render(
      <GallimapsProvider client={makeClient(routingFetch)}>
        <Probe />
      </GallimapsProvider>,
    );

    const params = {
      mode: "driving" as const,
      srcLat: 27.7,
      srcLng: 85.3,
      dstLat: 27.8,
      dstLng: 85.4,
    };

    await act(async () => {
      await route!.run(params);
      await distance!.run(params);
    });

    expect(route!.data).toEqual([{ distance: 1, duration: 1, latlngs: [] }]);
    expect(distance!.data).toEqual([{ distance: 10, duration: 5 }]);
  });

  it("useReverseGeocode surfaces API errors", async () => {
    let hook: ReturnType<typeof useReverseGeocode>;
    const Probe = () => {
      hook = useReverseGeocode();
      return null;
    };
    render(
      <GallimapsProvider client={makeClient(failingFetch)}>
        <Probe />
      </GallimapsProvider>,
    );

    await act(async () => {
      await hook!.run({ lat: 1, lng: 2 });
    });

    expect(hook!.data).toBeNull();
    expect(hook!.error).toBeInstanceOf(Error);
    expect(hook!.error?.message).toMatch(/No results/);
  });

  it("useAutocomplete debounces and returns suggestions", async () => {
    let hook: ReturnType<typeof useAutocomplete>;
    const Probe = () => {
      hook = useAutocomplete({ lat: 27.7, lng: 85.3, debounceMs: 10 });
      return null;
    };
    render(
      <GallimapsProvider client={makeClient(routingFetch)}>
        <Probe />
      </GallimapsProvider>,
    );

    act(() => {
      hook!.setQuery("kat");
    });

    await waitFor(() => expect(hook!.results.length).toBeGreaterThan(0));
    expect(hook!.results[0]).toEqual({ name: "Kathmandu", id: "1" });
  });

  it("useSearch debounces and returns GeoJSON features", async () => {
    let hook: ReturnType<typeof useSearch>;
    const Probe = () => {
      hook = useSearch({ currentLat: 27.7, currentLng: 85.3, debounceMs: 10 });
      return null;
    };
    render(
      <GallimapsProvider client={makeClient(routingFetch)}>
        <Probe />
      </GallimapsProvider>,
    );

    act(() => {
      hook!.setQuery("basantapur");
    });

    await waitFor(() => expect(hook!.results.length).toBeGreaterThan(0));
    expect(hook!.results[0]).toEqual({ type: "Feature" });

    act(() => {
      hook!.clear();
    });
    expect(hook!.results).toEqual([]);
    expect(hook!.query).toBe("");
  });

  it("useAutocomplete ignores queries below the minimum length", async () => {
    let hook: ReturnType<typeof useAutocomplete>;
    const Probe = () => {
      hook = useAutocomplete({ lat: 27.7, lng: 85.3, debounceMs: 10 });
      return null;
    };
    render(
      <GallimapsProvider client={makeClient(routingFetch)}>
        <Probe />
      </GallimapsProvider>,
    );

    act(() => {
      hook!.setQuery("ka");
    });

    await new Promise((r) => setTimeout(r, 30));
    expect(hook!.results).toEqual([]);
  });
});
