# react-gallimaps

[![npm version](https://img.shields.io/npm/v/react-gallimaps.svg)](https://www.npmjs.com/package/react-gallimaps)
[![CI](https://github.com/rudalkunwar/react-gallimaps/actions/workflows/ci.yml/badge.svg)](https://github.com/rudalkunwar/react-gallimaps/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

Type-safe React bindings for [GalliMaps](https://gallimap.com/) — Nepal's mapping solution. Two things in one package:

1. **Map components** — declarative `<Gallimap>`, `<Marker>`, `<Polygon>`, `<Search>` around the GalliMaps Vector Plugin.
2. **REST API client + hooks** — a typed `GalliApiClient` and hooks (`useAutocomplete`, `useSearch`, `useReverseGeocode`, `useRoute`, `useDistance`) for the five officially documented GalliMaps REST APIs. These work with **React, Next.js, and React Native** — no rendered map required.

> **New in 2.1.0:** the REST API client + hooks, plus a fix for a map re-initialization loop. See the [changelog](./CHANGELOG.md).

## Features

- 🧭 **Declarative components** — drop `<Marker>` / `<Polygon>` / `<Search>` as children of `<Gallimap>`.
- 🌐 **REST APIs** — Autocomplete, Search, Reverse Geocoding, Routing, and Distance via a typed client and hooks.
- 🪝 **Imperative hooks** — `useGallimapsAPI()` for the map; `useRoute()` / `useReverseGeocode()` / etc. for REST calls with `{ data, error, loading }`.
- 📦 **First-class TypeScript** — every prop, param, and response is typed; ships `.d.ts`.
- 📱 **Works everywhere React runs** — the REST layer uses `fetch` (browsers, React Native, Node 18+) with an injectable fetch and configurable base URL.
- 🛰️ **SSR-safe** — map renders nothing on the server; works with Next.js App Router.
- 🪶 **Tiny & tree-shakeable** — React is a peer dependency; no other runtime deps.

## Installation

```bash
npm install react-gallimaps
# peer dependencies
npm install react react-dom
```

## Requirements

- React **16.8+** (hooks) — React 18 recommended.
- A **real GalliMaps access token** ([get one here](https://gallimap.com/)). Placeholder tokens will not load tiles or search results.
- A browser environment (SSR guards are built in; render client-side).

## Quick start

The minimal setup — a provider and a map centered on Kathmandu:

```tsx
import { GallimapsProvider, Gallimap } from "react-gallimaps";

export default function App() {
  return (
    <GallimapsProvider>
      <Gallimap
        accessToken="YOUR_TOKEN"
        center={[27.7172, 85.324]}
        zoom={13}
      />
    </GallimapsProvider>
  );
}
```

### Markers, polygons, and search

Add children to the map. `Marker.onClick` requires `clickable` on `<Gallimap>`:

```tsx
import {
  GallimapsProvider,
  Gallimap,
  Marker,
  Polygon,
  Search,
} from "react-gallimaps";

export default function App() {
  return (
    <GallimapsProvider>
      <Gallimap accessToken="YOUR_TOKEN" center={[27.7172, 85.324]} zoom={13} clickable>
        <Marker
          position={[27.7172, 85.324]}
          color="red"
          draggable
          onClick={(marker) => console.log("clicked", marker)}
        />
        <Polygon
          name="area1"
          coordinates={[
            [27.7172, 85.324],
            [27.718, 85.325],
            [27.719, 85.323],
          ]}
        />
        <Search onSelect={(result) => console.log(result)} />
      </Gallimap>
    </GallimapsProvider>
  );
}
```

> **Heads up:** Wrap your tree in a single `<GallimapsProvider>`. It supplies the
> shared map instance and the marker registry — no other provider is needed. To
> use the REST hooks (search/geocoding/routing) without a map, pass an
> `accessToken` to the provider: `<GallimapsProvider accessToken="YOUR_TOKEN">`.

## Next.js (App Router)

The map must render on the client. Mark the file with `"use client"`, and
optionally defer loading with a dynamic import:

```tsx
"use client";
import dynamic from "next/dynamic";
import { GallimapsProvider } from "react-gallimaps";

const Gallimap = dynamic(
  () => import("react-gallimaps").then((m) => m.Gallimap),
  { ssr: false },
);

export default function Page() {
  return (
    <GallimapsProvider>
      <Gallimap accessToken={process.env.NEXT_PUBLIC_GALLIMAPS_TOKEN!} />
    </GallimapsProvider>
  );
}
```

## API

### `<GallimapsProvider>`

Context provider. Wrap once, above any `<Gallimap>` or REST hook. It supplies
the shared map instance, the marker registry, and (optionally) a REST client.

| Prop          | Type              | Description                                                                 |
| ------------- | ----------------- | --------------------------------------------------------------------------- |
| `children`    | `ReactNode`       | Your app / map tree.                                                        |
| `accessToken` | `string`          | Enables the REST hooks. Omit if you only use map components.                |
| `baseUrl`     | `string`          | Override the REST base URL (e.g. to proxy through your backend).            |
| `fetch`       | `FetchLike`       | Custom fetch implementation for older runtimes.                             |
| `client`      | `GalliApiClient`  | Provide a preconfigured client instead of `accessToken` (takes precedence). |

### `<Gallimap>`

| Prop                   | Type                                      | Default            | Description                                          |
| ---------------------- | ----------------------------------------- | ------------------ | ---------------------------------------------------- |
| `accessToken`          | `string` (required)                       | —                  | Your GalliMaps access token.                         |
| `center`               | `[number, number]`                        | `[27.7172,85.324]` | Initial `[lat, lng]` (defaults to Kathmandu).        |
| `zoom`                 | `number`                                  | `15`               | Initial zoom.                                        |
| `minZoom` / `maxZoom`  | `number`                                  | `5` / `25`         | Zoom bounds.                                         |
| `clickable`            | `boolean`                                 | `false`            | Enables map click events (needed for marker clicks). |
| `mapOptions`           | `Partial<MapOptions>`                     | —                  | Override any of the above via the native `map` shape.|
| `pano`                 | `boolean`                                 | `false`            | Render a panorama container.                         |
| `panoId` / `shareId`   | `string`                                  | auto               | Custom DOM ids / enable the share container.         |
| `mapStyle` etc.        | `React.CSSProperties`                     | sensible           | Inline styles for map/pano/share containers.         |
| `customClickFunctions` | `Array<(event) => void>`                  | `[]`               | Extra handlers invoked on every map click.           |
| `scriptUrl`            | `string`                                  | official CDN       | Override if you self-host the plugin script.         |
| `onMapInit`            | `(map) => void`                           | —                  | Called once with the map instance after init.        |
| `children`             | `ReactNode`                               | —                  | `Marker`, `Polygon`, `Search`, or custom UI.         |

Behavior: lazily loads `gallimaps.vector.min.latest.js` in the browser, guards
against SSR (returns `null` server-side), and shows simple loading/error states.
The map initializes **once** per mount — passing inline props (e.g. a `center`
array literal or an inline `onMapInit`) will not re-create the map. A `pano`
container is always mounted (hidden unless `pano`/`panoId` is set) because the
plugin requires one. In React 18 StrictMode (dev only), effects run twice, so
the map may initialize twice during development; this does not happen in
production builds.

### `<Marker>`

| Prop        | Type                       | Description                                       |
| ----------- | -------------------------- | ------------------------------------------------- |
| `position`  | `[number, number]`         | `[lat, lng]` (required).                           |
| `color`     | `string`                   | Pin color.                                         |
| `draggable` | `boolean`                  | Allow dragging.                                    |
| `onClick`   | `(marker: MarkerData) => void` | Fired when the marker is clicked (needs `clickable`). |

Marker ids are generated automatically — you no longer pass a `markerId`.

### `<Polygon>`

| Prop          | Type                                       | Default     | Description                  |
| ------------- | ------------------------------------------ | ----------- | ---------------------------- |
| `name`        | `string`                                   | —           | Unique name (required).      |
| `coordinates` | `Array<[number, number]>`                  | —           | `[lat, lng]` vertices.       |
| `type`        | `"Polygon" \| "LineString" \| "Point"`     | `"Polygon"` | Geometry type.               |
| `style`       | `{ color?, opacity?, width?, height?, radius? }` | `{}`  | Visual style.                |

### `<Search>`

| Prop          | Type                              | Default               | Description                       |
| ------------- | --------------------------------- | --------------------- | --------------------------------- |
| `onSelect`    | `(result: SearchResult) => void`  | —                     | Called when a result is selected. |
| `onResults`   | `(results: SearchResult[]) => void` | —                   | Called when autocomplete updates. |
| `placeholder` | `string`                          | `"Search locations…"` | Input placeholder.                |
| `className`   | `string`                          | —                     | Extra class on the wrapper.       |
| `lat` / `lng` | `number`                          | —                     | When provided with a REST client (via `GallimapsProvider accessToken`), uses the REST autocomplete/search APIs and works without a rendered map. Otherwise falls back to the map plugin. |

```tsx
// Map-free search backed by the REST API (needs `accessToken` on the provider):
<Search lat={27.7172} lng={85.324} onSelect={(r) => console.log(r)} />
```

## Hooks

### `useGallimaps()`

Returns `{ mapInstance, setMapInstance, markersRef, apiClient }`. Useful for
low-level access (`apiClient` is the REST client, or `null` when no token/client
was given to the provider).

### `useGallimapsAPI()`

Imperative helpers backed by the map instance. All are no-op safe before the map
is ready (`isReady === false`):

```tsx
const {
  displayPinMarker,
  removePinMarker,
  drawPolygon,
  removePolygon,
  autoCompleteSearch,
  searchData,
  isReady,
} = useGallimapsAPI();
```

### `useScript(src)`

Low-level, SSR-safe script loader returning `"idle" | "loading" | "ready" | "error"`
(used internally by `<Gallimap>`).

## REST APIs

The package ships a typed client for the five officially documented GalliMaps
REST APIs (base `https://route-init.gallimap.com/api/v1`). Use it two ways:
imperatively via `GalliApiClient`, or through React hooks.

| Feature            | Client method       | Hook                | GalliMaps endpoint            |
| ------------------ | ------------------- | ------------------- | ----------------------------- |
| Autocomplete       | `autocomplete()`    | `useAutocomplete`   | `/search/autocomplete`        |
| Search places      | `search()`          | `useSearch`         | `/search/currentLocation`     |
| Reverse geocoding  | `reverseGeocode()`  | `useReverseGeocode` | `/reverse/generalReverse`     |
| Routing            | `route()`           | `useRoute`          | `/routing`                    |
| Distance           | `distance()`        | `useDistance`       | `/routing/distance`           |

### Hooks (recommended)

Pass your token to the provider, then call the hooks anywhere below it:

```tsx
import {
  GallimapsProvider,
  useAutocomplete,
  useReverseGeocode,
  useRoute,
} from "react-gallimaps";

function Demo() {
  // Debounced autocomplete
  const { query, setQuery, results, loading } = useAutocomplete({
    lat: 27.7172,
    lng: 85.324,
  });

  // Imperative reverse geocode / routing
  const reverse = useReverseGeocode();
  const route = useRoute();

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading && <span>Searching…</span>}
      <ul>
        {results.map((r) => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>

      <button onClick={() => reverse.run({ lat: 27.7172, lng: 85.324 })}>
        Reverse geocode
      </button>
      {reverse.data && <p>{reverse.data.generalName}</p>}

      <button
        onClick={() =>
          route.run({
            mode: "driving",
            srcLat: 27.7172,
            srcLng: 85.324,
            dstLat: 27.6588,
            dstLng: 85.3247,
          })
        }
      >
        Get route
      </button>
      {route.data?.[0] && (
        <p>
          {route.data[0].distance} m / {route.data[0].duration} s
        </p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <GallimapsProvider accessToken={process.env.GALLIMAPS_TOKEN!}>
      <Demo />
    </GallimapsProvider>
  );
}
```

Hook reference:

- `useAutocomplete({ lat, lng, debounceMs?, minLength? })` → `{ query, setQuery, results, loading, error, clear }` (debounced; min 3 chars by default).
- `useSearch({ currentLat, currentLng, debounceMs?, minLength? })` → same shape; `results` are GeoJSON `features`.
- `useReverseGeocode()` → `{ data, error, loading, run(params), reset }`.
- `useRoute()` / `useDistance()` → `{ data, error, loading, run(params), reset }`; `data` is an array of results.

All imperative hooks are abort-safe: a new `run()` cancels the previous request, and any in-flight request is aborted on unmount.

Need the client itself inside a component?

- `useGalliClient()` → the `GalliApiClient` (throws if the provider has no token/client).
- `useOptionalGalliClient()` → the `GalliApiClient` or `null`.

### Error handling

Client methods (and the imperative hooks' `run()`) throw / surface a
`GalliApiError` on failure. It carries `status`, `code` (`"NETWORK"`,
`"PARSE"`, ...), a token-redacted `url`, and the raw `body`:

```ts
import { GalliApiError, isGalliApiError } from "react-gallimaps";

try {
  await galli.reverseGeocode({ lat: 27.7172, lng: 85.324 });
} catch (err) {
  if (isGalliApiError(err)) {
    console.error(err.status, err.code, err.message);
  }
}
```

With hooks, read `error` from the returned state instead:

```tsx
const { run, data, error } = useReverseGeocode();
// error is a GalliApiError (or null) after run()
```

### Client (framework-agnostic)

Prefer plain calls (or use outside React, e.g. a Node script)? Construct the
client directly:

```ts
import { GalliApiClient } from "react-gallimaps";

const galli = new GalliApiClient({ accessToken: "YOUR_TOKEN" });

const suggestions = await galli.autocomplete({ word: "thamel", lat: 27.71, lng: 85.32 });
const places = await galli.search({ name: "Basantapur", currentLat: 27.7, currentLng: 85.3 });
const address = await galli.reverseGeocode({ lat: 27.7172, lng: 85.324 });
const routes = await galli.route({ mode: "driving", srcLat: 27.71, srcLng: 85.32, dstLat: 27.65, dstLng: 85.33 });
const [{ distance, duration }] = await galli.distance({ mode: "walking", srcLat: 27.71, srcLng: 85.32, dstLat: 27.65, dstLng: 85.33 });
```

`GalliApiClient(options)`:

| Option        | Type        | Default                                       | Description                             |
| ------------- | ----------- | --------------------------------------------- | --------------------------------------- |
| `accessToken` | `string`    | — (required)                                  | Your GalliMaps access token.            |
| `baseUrl`     | `string`    | `https://route-init.gallimap.com/api/v1`      | Override the API host / proxy.          |
| `fetch`       | `FetchLike` | global `fetch`                                | Custom fetch for older runtimes.        |

Every method accepts an optional second argument `{ signal }` (an `AbortSignal`)
and throws `GalliApiError` (`status`, `code`, redacted `url`, `body`) on failure.
The access token is always redacted from error URLs.

### Notes

- `route()` / `distance()` return coordinates as `[longitude, latitude]` pairs (GeoJSON order).
- Only these five REST APIs are officially documented and implemented. Other GalliMaps services (Snap to Road, Elevation, 360 Image, etc.) are intentionally out of scope.

## React Native

The REST layer works out of the box in React Native (it uses the global
`fetch`). The map components rely on a browser DOM and are **not** supported in
React Native — use the hooks/client for search, geocoding, and routing:

```tsx
import { GallimapsProvider, useReverseGeocode } from "react-gallimaps";

function Screen() {
  const { run, data, loading } = useReverseGeocode();
  // call run({ lat, lng }) e.g. from a button/onPress, render data.generalName
}

export default function App() {
  return (
    <GallimapsProvider accessToken="YOUR_TOKEN">
      <Screen />
    </GallimapsProvider>
  );
}
```

## Utilities

- `isBrowser()` — lightweight SSR guard.

## Styling

The components ship unstyled with stable class names you can target:

- Map: `.gallimap-container`, `.gallimap`, `.gallimap-pano`, `.gallimap-share`, `.gallimap-loading`, `.gallimap-error`
- Search: `.gallimap-search`, `.gallimap-search-input`, `.gallimap-search-results`, `.gallimap-search-result`, `.gallimap-search-loading`

```css
.gallimap {
  border-radius: 12px;
}
.gallimap-search {
  background: #fff;
  border-radius: 8px;
}
```

## Troubleshooting

- **Map doesn't render in Next.js:** ensure the component is client-side (`"use client"`) and/or use `ssr: false` dynamic import.
- **Script load errors:** confirm network access to `https://gallimap.com/static/dist/js/gallimaps.vector.min.latest.js` and a valid `accessToken`.
- **Marker `onClick` not firing:** set `clickable` on `<Gallimap>`.
- **Markers move the map:** the wrapper restores the map center after adding markers when the plugin exposes `getCenter`/`setCenter`.
- **`No GalliMaps REST client found`:** you called a REST hook (`useAutocomplete`, `useRoute`, ...) without giving the provider an `accessToken` (or `client`). Add it: `<GallimapsProvider accessToken="...">`.
- **Repeated `Map ready` / `THREE.WebGLRenderer: Context Lost`:** fixed in 2.1.0 — upgrade. The map no longer re-initializes when inline props change identity.

## Migrating from v1

- `MarkerRegistryProvider` was removed — `GallimapsProvider` now provides the
  marker registry automatically. Delete any `MarkerRegistryProvider` usage.
- `<Marker>` no longer takes a `markerId` prop (ids are generated internally).
- `Marker.onClick` now receives the marker data: `(marker) => void`.
- `Polygon.onPolygonClick` was removed (it was a non-functional no-op).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and our
[Code of Conduct](./CODE_OF_CONDUCT.md) before opening an issue or PR.

```bash
git clone https://github.com/rudalkunwar/react-gallimaps.git
cd react-gallimaps
npm install
npm run lint && npm run type-check && npm test && npm run build
```

## License

[MIT](./LICENSE) © Rudal Kunwar
