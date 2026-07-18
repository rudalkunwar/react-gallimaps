import { GalliApiClient, FetchLike } from "../api/client";
import { GalliApiError, isGalliApiError } from "../api/errors";

interface MockOptions {
  ok?: boolean;
  status?: number;
  raw?: string;
}

/** A fake fetch that records calls and returns a canned response. */
function mockFetch(body: unknown, options: MockOptions = {}) {
  const calls: string[] = [];
  const fn: FetchLike = async (url) => {
    calls.push(url);
    return {
      ok: options.ok ?? true,
      status: options.status ?? 200,
      text: async () => options.raw ?? JSON.stringify(body),
    };
  };
  return { fn, calls };
}

const TOKEN = "test-token";

describe("GalliApiClient", () => {
  it("throws when constructed without an access token", () => {
    // @ts-expect-error intentionally invalid
    expect(() => new GalliApiClient({})).toThrow(/accessToken/);
  });

  it("autocomplete builds the URL with token + params and returns the data array", async () => {
    const { fn, calls } = mockFetch({
      success: true,
      message: "AutoComplete",
      data: [{ name: "Kathmandu", id: "1" }],
    });
    const client = new GalliApiClient({ accessToken: TOKEN, fetch: fn });

    const results = await client.autocomplete({ word: "kat", lat: 27.7, lng: 85.3 });

    expect(results).toEqual([{ name: "Kathmandu", id: "1" }]);
    const url = calls[0];
    expect(url).toContain("/api/v1/search/autocomplete");
    expect(url).toContain("accessToken=test-token");
    expect(url).toContain("word=kat");
    expect(url).toContain("lat=27.7");
    expect(url).toContain("lng=85.3");
  });

  it("search returns the GeoJSON FeatureCollection", async () => {
    const collection = { type: "FeatureCollection", features: [{ type: "Feature" }] };
    const { fn } = mockFetch({ success: true, message: "Search", data: collection });
    const client = new GalliApiClient({ accessToken: TOKEN, fetch: fn });

    const data = await client.search({ name: "x", currentLat: 1, currentLng: 2 });
    expect(data).toEqual(collection);
  });

  it("reverseGeocode returns the address object", async () => {
    const address = { generalName: "A", roadName: "B", province: "Bagmati" };
    const { fn, calls } = mockFetch({ success: true, message: "Reverse", data: address });
    const client = new GalliApiClient({ accessToken: TOKEN, fetch: fn });

    const data = await client.reverseGeocode({ lat: 27.6, lng: 85.3 });
    expect(data).toEqual(address);
    expect(calls[0]).toContain("/reverse/generalReverse");
  });

  it("route unwraps the doubly-nested envelope", async () => {
    const routes = [{ distance: 100, duration: 60, latlngs: [[85.3, 27.7]] }];
    const { fn, calls } = mockFetch({
      success: true,
      message: "Routing Mode: DRIVING",
      data: { success: true, message: "Route Extracted", data: routes },
    });
    const client = new GalliApiClient({ accessToken: TOKEN, fetch: fn });

    const data = await client.route({
      mode: "driving",
      srcLat: 27.7,
      srcLng: 85.3,
      dstLat: 27.8,
      dstLng: 85.4,
    });
    expect(data).toEqual(routes);
    expect(calls[0]).toContain("mode=driving");
    expect(calls[0]).toContain("/routing?");
  });

  it("distance unwraps the nested envelope", async () => {
    const { fn } = mockFetch({
      success: true,
      message: "Distance",
      data: {
        success: true,
        message: "Route Extracted",
        data: [{ distance: 5, duration: 3 }],
      },
    });
    const client = new GalliApiClient({ accessToken: TOKEN, fetch: fn });

    const data = await client.distance({
      mode: "walking",
      srcLat: 1,
      srcLng: 2,
      dstLat: 3,
      dstLng: 4,
    });
    expect(data).toEqual([{ distance: 5, duration: 3 }]);
  });

  it("throws GalliApiError on a non-2xx response", async () => {
    const { fn } = mockFetch(
      { success: false, message: "Unauthorized" },
      { ok: false, status: 401 },
    );
    const client = new GalliApiClient({ accessToken: TOKEN, fetch: fn });

    await expect(client.reverseGeocode({ lat: 1, lng: 2 })).rejects.toMatchObject({
      name: "GalliApiError",
      status: 401,
    });
  });

  it("throws GalliApiError when the payload has success:false", async () => {
    const { fn } = mockFetch({ success: false, message: "No results" });
    const client = new GalliApiClient({ accessToken: TOKEN, fetch: fn });

    await expect(client.autocomplete({ word: "zzz", lat: 1, lng: 2 })).rejects.toThrow(
      /No results/,
    );
  });

  it("throws a PARSE GalliApiError on invalid JSON", async () => {
    const { fn } = mockFetch(null, { raw: "<html>not json</html>" });
    const client = new GalliApiClient({ accessToken: TOKEN, fetch: fn });

    await expect(client.reverseGeocode({ lat: 1, lng: 2 })).rejects.toMatchObject({
      code: "PARSE",
    });
  });

  it("redacts the access token in error URLs", async () => {
    const failingFetch: FetchLike = async () => {
      throw new Error("boom");
    };
    const client = new GalliApiClient({ accessToken: TOKEN, fetch: failingFetch });

    try {
      await client.reverseGeocode({ lat: 1, lng: 2 });
      throw new Error("should have thrown");
    } catch (err) {
      expect(isGalliApiError(err)).toBe(true);
      const apiErr = err as GalliApiError;
      expect(apiErr.code).toBe("NETWORK");
      expect(apiErr.url).toContain("accessToken=[REDACTED]");
      expect(apiErr.url).not.toContain(TOKEN);
    }
  });

  it("respects a custom baseUrl", async () => {
    const { fn, calls } = mockFetch({ success: true, message: "ok", data: [] });
    const client = new GalliApiClient({
      accessToken: TOKEN,
      baseUrl: "https://proxy.example.com/galli/",
      fetch: fn,
    });

    await client.autocomplete({ word: "abc", lat: 1, lng: 2 });
    expect(calls[0]).toContain("https://proxy.example.com/galli/search/autocomplete");
  });
});
