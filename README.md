# react-gallimaps

[![npm version](https://img.shields.io/npm/v/react-gallimaps.svg)](https://www.npmjs.com/package/react-gallimaps)
[![CI](https://github.com/rudalkunwar/react-gallimaps/actions/workflows/ci.yml/badge.svg)](https://github.com/rudalkunwar/react-gallimaps/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

Type-safe React bindings for the [GalliMaps Vector Plugin](https://gallimap.com/) — Nepal's mapping solution. Declarative `<Gallimap>`, `<Marker>`, `<Polygon>`, and `<Search>` components with sensible defaults, SSR guards, and a clean imperative escape hatch.

## Features

- 🧭 **Declarative components** — drop `<Marker>` / `<Polygon>` / `<Search>` as children of `<Gallimap>`.
- 🪝 **Imperative hook** — `useGallimapsAPI()` for full control over markers, polygons, and search.
- 📦 **First-class TypeScript** — every prop and API is typed; ships `.d.ts`.
- 🌐 **SSR-safe** — renders nothing on the server; works with Next.js App Router.
- 🪶 **Tiny & tree-shakeable** — React is a peer dependency; no other runtime deps.
- 📍 **Marker click handling** — `onClick` per marker via the map's click events.

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
      <Gallimap accessToken="YOUR_TOKEN" clickable>
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

> **Heads up:** Wrap your tree in a single `<GallimapsProvider>`. It supplies both
> the shared map instance and the marker registry — no other provider is needed.
> Marker `onClick` requires `clickable` on `<Gallimap>`.

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

Context provider. Wrap once, above any `<Gallimap>`. Takes only `children`.

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

## Hooks

### `useGallimaps()`

Returns `{ mapInstance, setMapInstance, markersRef }`. Useful for low-level access.

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
