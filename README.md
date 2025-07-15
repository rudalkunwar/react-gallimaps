# react-gallimaps

A minimalist React wrapper for the GalliMaps Vector Plugin – Easy integration for Nepal's mapping solution.

[![npm version](https://img.shields.io/npm/v/react-gallimaps?style=flat-square&color=blue)](https://www.npmjs.com/package/react-gallimaps)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/react-gallimaps?style=flat-square)](https://www.npmjs.com/package/react-gallimaps)

---

## Installation

```bash
npm install react-gallimaps
```

---

## Quick Start Example

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
      <Gallimap accessToken="your-token">
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

## 🚀 Features

### 1. Map Initialization & Customization

- Set initial center, zoom, min/max zoom.
- Custom CSS for map and panorama containers.
- Optional panorama view.
- Enable map click events and custom click handlers.

**Example:**

```tsx
<Gallimap
  accessToken="your-token"
  center={[27.7, 85.3]}
  zoom={14}
  minZoom={10}
  maxZoom={18}
  clickable={true}
  customClickFunctions={[
    (event) => alert(`Clicked at ${event.lat}, ${event.lng}`),
  ]}
  mapStyle={{ width: "100vw", height: "60vh" }}
  panoId="my-pano"
  panoStyle={{ width: "100vw", height: "30vh" }}
/>
```

---

### 2. Markers

- Display multiple markers by rendering multiple `<Marker />` components.
- Custom color and draggable support.
- `onClick` handler for showing details or actions.
- **Auto-centering workaround:** The GalliMaps plugin auto-centers the map when a marker is added. This library automatically saves the current map center before adding a marker and restores it with a short delay after the marker is added. This prevents the map from jumping to the marker location. No extra workaround is needed in your app code.
- **Limitation:** A brief flicker may still occur due to plugin internals. If GalliMaps adds an official option to disable auto-centering, the library will be updated to use it.

**Example:**

```tsx
{
  people.map((person) => (
    <Marker
      key={person.id}
      markerId={person.id}
      position={person.position}
      color={person.color}
      draggable
      onClick={() => setSelectedPerson(person)}
    />
  ));
}
```

---

### 3. Polygons, Lines, and Points

- Draw polygons by passing an array of coordinates.
- Draw lines (`LineString`) or single points (`Point`) using the `type` prop.
- Custom style: color, opacity, width, height, radius.
- `onPolygonClick` handler for polygon interaction.

**Example:**

```tsx
<Polygon
  name="area1"
  coordinates={[
    [27.7, 85.3],
    [27.71, 85.31],
    [27.72, 85.29],
  ]}
  type="Polygon"
  style={{ color: "green", opacity: 0.7 }}
  onPolygonClick={() => alert("Polygon clicked!")}
/>
```

---

### 4. Search

- Autocomplete search for locations.
- `onSelect` to get details of the selected location.
- `onResults` to access the full list of search results.

**Example:**

```tsx
<Search
  onSelect={(result) => setSelectedLocation(result)}
  onResults={(results) => console.log(results)}
  placeholder="Search for a place..."
/>
```

---

### 5. Programmatic Map Control (Hooks)

- `useGallimapsAPI`: Add, remove, or search markers and polygons programmatically.
- `isReady`: Know when the map is ready for API calls.

**Example:**

```tsx
import { useGallimapsAPI } from "react-gallimaps";
const { displayPinMarker, drawPolygon, isReady } = useGallimapsAPI();

useEffect(() => {
  if (isReady) {
    displayPinMarker({ position: [27.7, 85.3], color: "blue" });
    drawPolygon({
      name: "area2",
      coordinates: [
        [27.7, 85.3],
        [27.71, 85.31],
        [27.72, 85.29],
      ],
      style: { color: "red" },
    });
  }
}, [isReady]);
```

---

### 6. Context API

- `GallimapsProvider`: Wrap your app to provide map context.
- `useGallimaps`: Access the raw map instance for advanced use.

---

### 7. Dynamic Children

- Nest Markers, Polygons, and Search inside `<Gallimap>` for automatic context and rendering.

---

### 8. Script Loading

- `useScript`: Dynamically load external scripts (used internally for GalliMaps JS).

---

## 🎨 Custom CSS & Styling

You can customize the appearance of the map, panorama, markers, polygons, and search UI using inline style props, className props, and built-in CSS classes.

<table>
  <tr>
    <th>Component</th>
    <th>Inline Style Prop</th>
    <th>className Prop</th>
    <th>Built-in CSS Classes</th>
    <th>Notes</th>
  </tr>
  <tr>
    <td>Gallimap</td>
    <td>mapStyle, panoStyle</td>
    <td>No</td>
    <td>gallimap-container, gallimap, gallimap-pano, gallimap-pano-hidden</td>
    <td>Use style props or target built-in classes</td>
  </tr>
  <tr>
    <td>Marker</td>
    <td>No</td>
    <td>Yes</td>
    <td>(Rendered by map engine)</td>
    <td>Use color prop for marker color</td>
  </tr>
  <tr>
    <td>Polygon</td>
    <td>style (object)</td>
    <td>No</td>
    <td>(Rendered by map engine)</td>
    <td>Use style prop for color, opacity, etc</td>
  </tr>
  <tr>
    <td>Search</td>
    <td>No</td>
    <td>Yes</td>
    <td>gallimap-search, gallimap-search-input, gallimap-search-results, etc</td>
    <td>Use className or target built-in classes</td>
  </tr>
</table>

### Gallimap Example

```tsx
<Gallimap
  accessToken="your-token"
  mapStyle={{ width: "100vw", height: "60vh", borderRadius: 8 }}
  panoStyle={{ width: "100vw", height: "30vh" }}
/>
```

**Override styles globally:**

```css
.gallimap-container {
  background: #f8f8f8;
}
.gallimap {
  border-radius: 12px;
}
.gallimap-pano {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Marker Example

```tsx
<Marker
  position={[27.7, 85.3]}
  color="red"
  draggable
  onClick={() => alert("Marker clicked!")}
  className="my-marker" // For logical grouping or future use
/>
```

### Polygon Example

```tsx
<Polygon
  name="area1"
  coordinates={[
    [27.7, 85.3],
    [27.71, 85.31],
    [27.72, 85.29],
  ]}
  style={{ color: "green", opacity: 0.7, width: 2 }}
/>
```

### Search Example

```tsx
<Search className="my-search" />
```

```css
.gallimap-search {
  background: #fff;
  border-radius: 8px;
}
.gallimap-search-input {
  padding: 8px;
}
.gallimap-search-result {
  cursor: pointer;
}
.my-search {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

---

## Code Index (`src/`)

- **components/**
  - `Gallimap.tsx`: Main map component, initializes and renders the map and panorama.
  - `Marker.tsx`: Adds a marker to the map.
  - `Polygon.tsx`: Adds a polygon (or line/point) to the map.
  - `Search.tsx`: Search box for locations, with autocomplete and selection.
  - `index.ts`: Exports all components, context, and hooks for easy import.
- **context/**
  - `GallimapsContext.tsx`: Provides React context for the map instance and a hook to access it.
- **hooks/**
  - `useGalliMaps.ts`: Main hook for programmatic map control (add/remove markers, polygons, search, etc).
  - `useScript.ts`: Utility hook to load external scripts (used for loading the GalliMaps JS library).
- **types/**
  - `components.ts`: TypeScript types for all component props and API hooks.
  - `index.ts`: Core types for map options, plugin API, and context.
- **index.ts** (in `src/`): Main entry point, re-exports all components, hooks, and types.

---
