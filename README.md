# react-gallimaps

A minimalist React wrapper for the GalliMaps Vector Plugin – Easy integration for Nepal's mapping solution.

[![npm version](https://img.shields.io/npm/v/react-gallimaps?style=flat-square&color=blue)](https://www.npmjs.com/package/react-gallimaps)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/react-gallimaps?style=flat-square)](https://www.npmjs.com/package/react-gallimaps)

## Features

- React components for GalliMaps: `<Gallimap />`, `<Marker />`, `<Polygon />`, `<Search />`
- Context and hooks for advanced usage
- TypeScript support
- Easy marker, polygon, and search integration

## Installation

```bash
npm install react-gallimaps
```

# react-gallimaps

A professional React wrapper for the GalliMaps Vector Plugin – seamless, type-safe, and modern mapping for Nepal.

[![npm version](https://img.shields.io/npm/v/react-gallimaps?style=flat-square&color=blue)](https://www.npmjs.com/package/react-gallimaps)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/react-gallimaps?style=flat-square)](https://www.npmjs.com/package/react-gallimaps)

---

## Overview

> **react-gallimaps** provides a clean, idiomatic React API for [GalliMaps](https://gallimap.com), Nepal's leading vector mapping platform. It supports markers, polygons, search, and full TypeScript types for a robust developer experience.

---

- **React-first**: Components for `<Gallimap />`, `<Marker />`, `<Polygon />`, `<Search />`
- **Context & Hooks**: For advanced and programmatic map control
- **TypeScript**: Full type definitions included
- **Easy integration**: Minimal setup, works with all React apps

---

  </tr>

```bash
npm install react-gallimaps
```

    <td>GalliMaps Token</td>

<table>
  <tr>
    <th>Requirement</th>
    <th>Version</th>
    <th>Notes</th>
  </tr>
  <tr>
    <td>React</td>
    <td>&ge;16.8.0</td>
    <td>Hooks support required</td>
  </tr>
  <tr>
    <td>GalliMaps Token</td>
    <td>-</td>
    <td>Get from <a href="https://gallimap.com">gallimap.com</a></td>
  </tr>
  <tr>
    <td>TypeScript (optional)</td>
    <td>&ge;4.0</td>
    <td>Full type definitions included</td>
  </tr>
</table>

---

## Quick Start

```tsx
import React from "react";
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
      <Gallimap
        accessToken="your-token"
        center={[27.7172, 85.324]}
        zoom={13}
        mapStyle={{ width: "100%", height: "400px" }}
      >
        <Marker position={[27.7172, 85.324]} color="red" draggable />
        <Polygon
          name="test"
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

---

      <Gallimap

### `<GallimapsProvider>`

Wrap your app or map section to provide context for all map components and hooks.

---

### `<Gallimap />` Props

| Prop                 | Type                          | Required | Default            | Description                    |
| -------------------- | ----------------------------- | -------- | ------------------ | ------------------------------ |
| accessToken          | string                        | Yes      | –                  | GalliMaps API token            |
| center               | [number, number]              | No       | [27.7172, 85.3240] | Map center (lat, lng)          |
| zoom                 | number                        | No       | 15                 | Initial zoom level             |
| minZoom, maxZoom     | number                        | No       | 5, 25              | Min/max zoom                   |
| clickable            | boolean                       | No       | false              | Enable map click events        |
| customClickFunctions | Array<function>               | No       | []                 | Custom click handlers          |
| panoId               | string                        | No       | –                  | Panorama container id          |
| mapStyle, panoStyle  | React.CSSProperties           | No       | –                  | Custom styles for map/panorama |
| onMapInit            | (map: GalliMapPlugin) => void | No       | –                  | Callback on map init           |
| children             | React.ReactNode               | No       | –                  | Nested Marker/Polygon/Search   |

---

### `<Marker />` Props

| Prop      | Type             | Required | Description                |
| --------- | ---------------- | -------- | -------------------------- |
| position  | [number, number] | Yes      | Marker position (lat, lng) |
| draggable | boolean          | No       | Draggable marker           |
| color     | string           | No       | Marker color               |
| onClick   | function         | No       | Click handler              |
| className | string           | No       | Custom CSS class           |

---

### `<Polygon />` Props

| Prop           | Type                                 | Required | Description                |
| -------------- | ------------------------------------ | -------- | -------------------------- |
| name           | string                               | Yes      | Unique polygon name        |
| coordinates    | Array<[number, number]>              | Yes      | Polygon coordinates        |
| type           | "Polygon" \| "LineString" \| "Point" | No       | Polygon type               |
| style          | object                               | No       | Polygon style (color, etc) |
| onPolygonClick | function                             | No       | Polygon click handler      |

---

### `<Search />` Props

| Prop        | Type     | Required | Description                |
| ----------- | -------- | -------- | -------------------------- |
| onSelect    | function | No       | Called on result select    |
| onResults   | function | No       | Called with search results |
| placeholder | string   | No       | Input placeholder          |
| className   | string   | No       | Custom CSS class           |

---

### Hooks

- `useGallimaps()` – Access map instance/context
- `useGallimapsAPI()` – Programmatic control for markers, polygons, search
- `useScript()` – Load external scripts

---

## License

MIT

### `<Polygon {...props}>`

- `name` (string, required)
- `coordinates` (array of [number, number], required)
- `type`, `style`, `onPolygonClick`

### `<Search {...props}>`

- `onSelect`, `onResults`, `placeholder`, `className`

### Hooks

- `useGallimaps()` – access map instance/context
- `useGallimapsAPI()` – programmatic control for markers, polygons, search
- `useScript()` – load external scripts

## License

MIT
