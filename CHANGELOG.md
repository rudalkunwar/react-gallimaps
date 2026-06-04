# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
