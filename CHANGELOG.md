# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0]

A reliability release: every open bug fix for the map components and the REST
client, plus an accessible search box and an honest React 16.8 build. Existing
APIs are unchanged; the new `<Search>` props are optional.

### Added

- **`<Search>` is now an accessible combobox.** Arrow keys move through
  results, Enter selects, Escape closes, and the input exposes
  `aria-expanded`, `aria-controls`, and `aria-activedescendant`. Errors render
  in a `role="alert"` element.
- **`<Search>` props `onError` and `ariaLabel`.** `onError` receives
  autocomplete or selection failures; `ariaLabel` names the input (defaults to
  "Search locations").
- **`<Search>` uses its `lat`/`lng` props in map-plugin mode too**, so
  proximity ordering works with or without a REST client.
- **`GalliMapView` and `GalliMapMarker` types** for the parts of the MapLibre
  API the wrapper uses.

### Fixed

- **Stale autocomplete results.** Each search carries a request id, and REST
  requests are aborted when a newer search starts, a result is selected, or the
  component unmounts. A slow older response can no longer replace a newer one.
- **Map instances leak on token changes.** Changing `accessToken` now destroys
  the previous plugin instance (canvas, controls, WebGL resources) before
  creating the next one; unmount also releases it.
- **Nested `route()` / `distance()` errors lose their metadata.** Failures
  reported inside the inner GalliMaps envelope now keep the HTTP `status`, the
  token-redacted `url`, and the response body.
- **Overlays render at swapped coordinates.** `Polygon`, `LineString`, and
  `Point` now convert the public `[lat, lng]` pairs to GeoJSON `[lng, lat]`
  before calling the plugin.
- **Adding markers hijacked the viewport.** The plugin's `displayPinMarker()`
  always flies to the new pin at zoom 20. The wrapper now cancels that animation
  through the plugin's MapLibre view and restores the previous center and zoom.
- **`Marker.onClick` missed the visible pin.** Clicks are now handled on the
  marker element itself, so the whole pin is clickable at any zoom. The
  map-proximity lookup remains as a fallback. A new `onClick` handler no longer
  recreates the marker.
- **React 16.8 consumers failed at import time.** The build compiles JSX with
  the classic runtime, so it no longer imports `react/jsx-runtime` (React
  16.14+). CI now imports the built package with React 16.8.6.

### Changed

- CI runs the full lint, format, type-check, test, and build pipeline on Node
  18, 20, and 22, plus a minimum-React import smoke test.

## [2.1.0]

Adds first-class support for the five officially documented GalliMaps REST
APIs, so you can search, geocode, and route without a rendered map. Fully
additive — no breaking changes.

### Added

- **`GalliApiClient`** — a small, typed, `fetch`-based client for the documented
  REST endpoints: `autocomplete()`, `search()`, `reverseGeocode()`, `route()`,
  and `distance()`. Framework-agnostic (browser, React Native, Node 18+), with
  an injectable `fetch` and configurable `baseUrl`.
- **REST hooks**: `useAutocomplete` and `useSearch` (debounced, abort-safe),
  plus `useReverseGeocode`, `useRoute`, and `useDistance` (imperative `run()`
  with `{ data, error, loading }`). `useGalliClient` / `useOptionalGalliClient`
  expose the client from context.
- **`GallimapsProvider`** now accepts `accessToken` (and optional `baseUrl`,
  `fetch`, or a preconfigured `client`) and supplies a memoized `GalliApiClient`
  to the REST hooks. Map-only usage is unchanged.
- **`GalliApiError`** with `status`, `code`, redacted `url`, and `body`, plus an
  `isGalliApiError()` guard.
- Typed request/response models for every endpoint (e.g. `AutocompleteResult`,
  `SearchFeatureCollection`, `ReverseGeocodeResult`, `RouteResult`,
  `DistanceResult`, `TravelMode`).

### Changed

- `<Search>` gained optional `lat`/`lng` props. When a REST client and
  coordinates are available it uses the REST autocomplete/search APIs (and works
  without a rendered map); otherwise it falls back to the map plugin as before.

### Fixed

- **Map no longer re-initializes in a loop.** The `<Gallimap>` init effect now
  runs once per mount and reads config/callbacks via refs, so inline props
  (e.g. a `center` array literal or an inline `onMapInit`) no longer re-create
  the map. This eliminates the repeated `Map ready` / `THREE.WebGLRenderer:
  Context Lost` cycle and the resulting "Maximum update depth exceeded" warning.
- **Map initialization no longer crashes on the default (no-pano) case.** The
  plugin constructor requires both a nested `map` option and a `pano` container;
  `<Gallimap>` now always passes `{ map: {...} }` and mounts a `pano` container
  (hidden unless requested), fixing `TypeError: Cannot read properties of
  undefined (reading 'container')`.
- `<Search>` callbacks (`onSelect`/`onResults`) are held in refs so inline
  handlers can't retrigger the debounced search.

## [2.0.0]

A maintenance-focused refactor that fixes the marker pipeline and prepares the
project for open-source contributions.

### Fixed

- **Markers now work out of the box.** Previously `<Marker>` required an
  undocumented `markerId` prop and a separate `MarkerRegistryProvider` that the
  docs never mentioned, so markers never registered or rendered in documented
  usage. `GallimapsProvider` now supplies the marker registry, and marker ids are
  generated internally.
- `Marker.onClick` now receives the marker data (`(marker) => void`), matching
  the documentation.
- Simplified and de-duplicated the `<Gallimap>` initialization effect to avoid
  redundant re-initialization; custom click handlers are kept in a ref so passing
  inline functions no longer re-creates the map.

### Removed (breaking)

- `MarkerRegistryProvider` and `useMarkerRegistry` — folded into `GallimapsProvider`.
- The `markerId` prop on `<Marker>` — ids are generated automatically.
- `Polygon.onPolygonClick` — it was a non-functional no-op.

### Changed

- Loading/error elements use `.gallimap-loading` / `.gallimap-error` class names
  (previously `.map-loading` / `.map-error`).
- Tightened types throughout: replaced most `any` usage with `unknown` and added
  `MarkerData`, `SearchResult`, and `GalliMapClickEvent` types.

### Added (tooling & project health)

- ESLint (flat config) + Prettier with real `lint`, `lint:fix`, `format` scripts.
- GitHub Actions CI (lint, type-check, test, build across Node 18/20/22).
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, this changelog, and
  issue/PR templates.
- Dependabot config for npm and GitHub Actions updates.
- Expanded the test suite to cover the public component behavior.
- Rewrote the README with an accurate API reference and a v1 → v2 migration guide.

### Build & packaging

- Replaced two near-duplicate Rollup configs with a single
  [`tsup`](https://tsup.egoist.dev/) config — faster builds, less to maintain.
- Modernized `package.json`: per-condition `exports` (with separate `.d.ts` /
  `.d.cts` types), `publishConfig.access`, `engines.node >= 18`, and a `files`
  whitelist as the single source of truth for published contents.
- Verified dual ESM/CJS type resolution with `@arethetypeswrong/cli`
  (node10, node16 CJS/ESM, and bundler all pass).

### Migration

See the "Migrating from v1" section in the [README](./README.md#migrating-from-v1).

## [1.1.1]

- Previous published release.
