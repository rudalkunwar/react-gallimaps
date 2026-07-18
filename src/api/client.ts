import { DEFAULT_BASE_URL, ENDPOINTS } from "./config";
import { GalliApiError } from "./errors";
import type {
  AutocompleteParams,
  AutocompleteResult,
  DistanceParams,
  DistanceResult,
  GalliApiEnvelope,
  RequestOptions,
  ReverseGeocodeParams,
  ReverseGeocodeResult,
  RouteParams,
  RouteResult,
  SearchFeatureCollection,
  SearchParams,
} from "./types";

/** A minimal fetch signature so any WHATWG-compatible fetch can be injected. */
export type FetchLike = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  },
) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
}>;

export interface GalliApiClientOptions {
  /** Your GalliMaps access token. Required. */
  accessToken: string;
  /** Override the API base URL (defaults to the documented `route-init` host). */
  baseUrl?: string;
  /**
   * Custom fetch implementation. Defaults to the global `fetch`, which exists
   * in browsers, React Native, and Node 18+. Provide one for older runtimes.
   */
  fetch?: FetchLike;
}

type QueryValue = string | number | undefined | null;

/**
 * Typed client for the five officially documented GalliMaps REST APIs:
 * autocomplete, search, reverse geocoding, routing, and distance.
 *
 * Framework-agnostic and side-effect free — safe to construct once and reuse.
 * Every method throws {@link GalliApiError} on failure.
 */
export class GalliApiClient {
  private readonly accessToken: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;

  constructor(options: GalliApiClientOptions) {
    if (!options?.accessToken) {
      throw new Error("GalliApiClient requires a non-empty `accessToken`.");
    }

    const resolvedFetch =
      options.fetch ??
      (typeof globalThis !== "undefined" && typeof globalThis.fetch === "function"
        ? (globalThis.fetch.bind(globalThis) as unknown as FetchLike)
        : undefined);

    if (!resolvedFetch) {
      throw new Error(
        "No global `fetch` available. Pass a `fetch` implementation to GalliApiClient.",
      );
    }

    this.accessToken = options.accessToken;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = resolvedFetch;
  }

  /* -------------------------------- public API -------------------------------- */

  /** Autocomplete suggestions for a partial query (min. 3 characters). */
  async autocomplete(
    params: AutocompleteParams,
    options?: RequestOptions,
  ): Promise<AutocompleteResult[]> {
    const res = await this.request<AutocompleteResult[]>(
      ENDPOINTS.autocomplete,
      { word: params.word, lat: params.lat, lng: params.lng },
      options,
    );
    return Array.isArray(res.data) ? res.data : [];
  }

  /** Full search relative to a current location; returns a GeoJSON collection. */
  async search(
    params: SearchParams,
    options?: RequestOptions,
  ): Promise<SearchFeatureCollection> {
    const res = await this.request<SearchFeatureCollection>(
      ENDPOINTS.search,
      {
        name: params.name,
        currentLat: params.currentLat,
        currentLng: params.currentLng,
      },
      options,
    );
    return res.data;
  }

  /** Reverse-geocode a coordinate pair into an address. */
  async reverseGeocode(
    params: ReverseGeocodeParams,
    options?: RequestOptions,
  ): Promise<ReverseGeocodeResult> {
    const res = await this.request<ReverseGeocodeResult>(
      ENDPOINTS.reverse,
      { lat: params.lat, lng: params.lng },
      options,
    );
    return res.data;
  }

  /** Compute one or more routes between a source and destination. */
  async route(params: RouteParams, options?: RequestOptions): Promise<RouteResult[]> {
    const res = await this.request<GalliApiEnvelope<RouteResult[]>>(
      ENDPOINTS.routing,
      this.routingQuery(params),
      options,
    );
    return this.unwrapNested(res, "route");
  }

  /** Distance + duration only (no geometry) between two points. */
  async distance(
    params: DistanceParams,
    options?: RequestOptions,
  ): Promise<DistanceResult[]> {
    const res = await this.request<GalliApiEnvelope<DistanceResult[]>>(
      ENDPOINTS.distance,
      this.routingQuery(params),
      options,
    );
    return this.unwrapNested(res, "distance");
  }

  /* -------------------------------- internals -------------------------------- */

  private routingQuery(params: RouteParams): Record<string, QueryValue> {
    return {
      mode: params.mode,
      srcLat: params.srcLat,
      srcLng: params.srcLng,
      dstLat: params.dstLat,
      dstLng: params.dstLng,
    };
  }

  private unwrapNested<T>(
    res: GalliApiEnvelope<GalliApiEnvelope<T[]>>,
    label: string,
    redactedUrl?: string,
  ): T[] {
    const inner = res.data;
    if (inner && inner.success === false) {
      throw new GalliApiError(inner.message || `GalliMaps ${label} was unsuccessful.`, {
        url: redactedUrl,
        body: res,
      });
    }
    return Array.isArray(inner?.data) ? inner.data : [];
  }

  private buildUrl(path: string, params: Record<string, QueryValue>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.set("accessToken", this.accessToken);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  /** Same URL as {@link buildUrl} but with the access token redacted, for logs/errors. */
  private redact(url: string): string {
    return url.replace(/(accessToken=)[^&]*/i, "$1[REDACTED]");
  }

  private async request<T>(
    path: string,
    params: Record<string, QueryValue>,
    options?: RequestOptions,
  ): Promise<GalliApiEnvelope<T>> {
    const url = this.buildUrl(path, params);
    const safeUrl = this.redact(url);

    let response: Awaited<ReturnType<FetchLike>>;
    try {
      response = await this.fetchImpl(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: options?.signal,
      });
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") throw err;
      throw new GalliApiError(
        `Network request to GalliMaps failed: ${(err as Error)?.message ?? "unknown error"}`,
        { code: "NETWORK", url: safeUrl, cause: err },
      );
    }

    const raw = await response.text();
    let body: unknown = null;
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        throw new GalliApiError("Failed to parse GalliMaps response as JSON.", {
          code: "PARSE",
          status: response.status,
          url: safeUrl,
          body: raw,
        });
      }
    }

    const envelope = body as (GalliApiEnvelope<T> & { code?: string }) | null;

    if (!response.ok) {
      throw new GalliApiError(
        envelope?.message || `GalliMaps request failed with status ${response.status}.`,
        { status: response.status, url: safeUrl, body },
      );
    }

    if (envelope && envelope.success === false) {
      throw new GalliApiError(envelope.message || "GalliMaps request was unsuccessful.", {
        status: response.status,
        url: safeUrl,
        body,
      });
    }

    if (!envelope) {
      throw new GalliApiError("GalliMaps returned an empty response.", {
        status: response.status,
        url: safeUrl,
      });
    }

    return envelope;
  }
}
