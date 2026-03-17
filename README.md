# react-gallimaps

Type-safe React bindings for the GalliMaps vector plugin with sensible defaults, SSR guards, and a clean component API.

## Installation

```bash
npm install react-gallimaps
# peer deps
npm install react react-dom
```

## Requirements
- React 18+
- A **real** GalliMaps access token (required by the official plugin; placeholder tokens will not reliably load tiles/search) citeturn0search1
- Runs in the browser (SSR-safe guards are built in; hydrate client-side)

## Quick start

```tsx
import React from "react";
import { GallimapsProvider, Gallimap, Marker, Polygon, Search } from "react-gallimaps";

export default function App() {
  return (
    <GallimapsProvider>
      <Gallimap accessToken="YOUR_TOKEN" clickable>
        <Marker position={[27.7172, 85.324]} color="red" draggable />
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

## Next.js (App Router) usage
- Mark the rendering file with `"use client"`.
- Optional: wrap `Gallimap` in `next/dynamic` with `ssr: false` if you want to defer script loading.

```tsx
"use client";
import dynamic from "next/dynamic";
import { GallimapsProvider } from "react-gallimaps";

const Gallimap = dynamic(() => import("react-gallimaps").then((m) => m.Gallimap), {
  ssr: false,
});

export default function Page() {
  return (
    <GallimapsProvider>
      <Gallimap accessToken={process.env.NEXT_PUBLIC_GALLIMAPS_TOKEN!} />
    </GallimapsProvider>
  );
}
```

## Components

### `<Gallimap />`
Props:
- `accessToken` (string, required)
- `mapOptions?: { container?, center?, zoom?, minZoom?, maxZoom?, clickable? }` – mirrors the official `map` config
- `center?: [number, number]` (default Kathmandu)
- `zoom?: number` (default 15)
- `minZoom?: number` (default 5)
- `maxZoom?: number` (default 25)
- `clickable?: boolean` (default false)
- `pano?: boolean` (auto-creates a panorama container)
- `panoId?: string` (custom id for panorama container)
- `shareId?: string` (renders share container)
- `mapStyle?`, `panoStyle?`, `shareStyle?` – inline styles
- `customClickFunctions?: ((event: any) => void)[]`
- `scriptUrl?: string` (override if you self-host the GalliMaps script)
- `onMapInit?: (map) => void`
- `children` – nested `Marker`, `Polygon`, `Search`, or custom UI

Behavior:
- Loads `gallimaps.vector.min.latest.js` lazily in the browser.
- Guards against SSR by returning `null` server-side.
- Displays simple loading/error states.

### `<Marker />`
Props:
- `position: [lat, lng]`
- `color?: string`
- `draggable?: boolean`
- `onClick?: (marker) => void`
- `markerId: string` (required for uniqueness)

### `<Polygon />`
Props:
- `name: string`
- `coordinates: Array<[lat, lng]>`
- `type?: "Polygon" | "LineString" | "Point"` (default `"Polygon"`)
- `style?: { color?, opacity?, width?, height?, radius? }`
- `onPolygonClick?: (event) => void`

### `<Search />`
Props:
- `onSelect?: (result) => void`
- `onResults?: (results: any[]) => void`
- `placeholder?: string`
- `className?: string`

## Hooks
- `useGallimaps()` → `{ mapInstance, setMapInstance }`
- `useGallimapsAPI()` → marker/polygon/search helpers (`displayPinMarker`, `removePinMarker`, `drawPolygon`, `autoCompleteSearch`, `searchData`, `isReady`)
- `useScript()` → low-level script loader (already used internally)

## Utilities
- `isBrowser()` – lightweight SSR guard

## Styling
- `Gallimap` containers: `.gallimap-container`, `.gallimap`, `.gallimap-pano`, `.gallimap-share`
- `Search` UI: `.gallimap-search`, `.gallimap-search-input`, `.gallimap-search-results`, `.gallimap-search-result`, `.gallimap-search-loading`

Example overrides:
```css
.gallimap { border-radius: 12px; }
.gallimap-search { background: #fff; border-radius: 8px; }
```

## Troubleshooting
- **Map doesn’t render on Next.js:** ensure the component is client-side (`"use client"`) and/or use `ssr:false` dynamic import.
- **Script load errors:** check network access to `https://gallimap.com/static/dist/js/gallimaps.vector.min.latest.js` and confirm `accessToken`.
- **Markers auto-centering:** the wrapper preserves current center after adding markers when possible.
- **Undefined window:** import types on the server, but render map components only on the client.

## Development
Scripts (from this repo):
- `npm run test` – Jest test suite
- `npm run type-check` – TypeScript
- `npm run build` – Rollup build (CJS + ESM)
- `npm run clean` – remove dist/coverage

## Publishing checklist
- `npm run test && npm run type-check && npm run build`
- `npm pack` to verify published contents
- Update version in `package.json`
- Ensure README and types are up to date

## License
MIT
