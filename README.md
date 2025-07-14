# react-gallimaps

A minimalist React wrapper for the GalliMaps Vector Plugin – Easy integration for Nepal's mapping solution.

[![npm version](https://img.shields.io/npm/v/react-gallimaps?style=flat-square&color=blue)](https://www.npmjs.com/package/react-gallimaps)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/react-gallimaps?style=flat-square)](https://www.npmjs.com/package/react-gallimaps)

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

**Example:**

```tsx
{
  people.map((person) => (
    <Marker
      key={person.id}
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

## Installation

```bash
npm install react-gallimaps
```

---

## Requirements

<table>
  <tr>
    <th>Requirement</th>
    <th>Version</th>
    <th>Notes</th>
  </tr>
  <tr>
    <td>React</td>
    <td>&gt;=16.8.0</td>
    <td>Hooks support required</td>
  </tr>
  <tr>
    <td>GalliMaps Token</td>
    <td>-</td>
    <td>Get from <a href="https://gallimap.com">gallimap.com</a></td>
  </tr>
  <tr>
    <td>TypeScript</td>
    <td>&gt;=4.0</td>
    <td>(Optional) Full type definitions</td>
  </tr>
</table>

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

## Component Usage

### `<GallimapsProvider>`

Wrap your app or map section to provide context for all map components and hooks.

### `<Gallimap />` Props

<table>
  <tr>
    <th>Prop</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>accessToken</td>
    <td>string</td>
    <td>Yes</td>
    <td>–</td>
    <td>GalliMaps API token</td>
  </tr>
  <tr>
    <td>center</td>
    <td>[number, number]</td>
    <td>No</td>
    <td>[27.7172,85.3240]</td>
    <td>Map center (lat, lng)</td>
  </tr>
  <tr>
    <td>zoom</td>
    <td>number</td>
    <td>No</td>
    <td>15</td>
    <td>Initial zoom level</td>
  </tr>
  <tr>
    <td>minZoom, maxZoom</td>
    <td>number</td>
    <td>No</td>
    <td>5, 25</td>
    <td>Min/max zoom</td>
  </tr>
  <tr>
    <td>clickable</td>
    <td>boolean</td>
    <td>No</td>
    <td>false</td>
    <td>Enable map click events</td>
  </tr>
  <tr>
    <td>customClickFunctions</td>
    <td>Array&lt;function&gt;</td>
    <td>No</td>
    <td>[]</td>
    <td>Custom click handlers</td>
  </tr>
  <tr>
    <td>panoId</td>
    <td>string</td>
    <td>No</td>
    <td>–</td>
    <td>Panorama container id</td>
  </tr>
  <tr>
    <td>mapStyle, panoStyle</td>
    <td>React.CSSProperties</td>
    <td>No</td>
    <td>–</td>
    <td>Custom styles for map/panorama</td>
  </tr>
  <tr>
    <td>onMapInit</td>
    <td>(map: GalliMapPlugin) =&gt; void</td>
    <td>No</td>
    <td>–</td>
    <td>Callback on map init</td>
  </tr>
  <tr>
    <td>children</td>
    <td>React.ReactNode</td>
    <td>No</td>
    <td>–</td>
    <td>Nested Marker/Polygon/Search</td>
  </tr>
</table>

### `<Marker />` Props

<table>
  <tr>
    <th>Prop</th>
    <th>Type</th>
    <th>Required</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>position</td>
    <td>[number, number]</td>
    <td>Yes</td>
    <td>Marker position (lat, lng)</td>
  </tr>
  <tr>
    <td>draggable</td>
    <td>boolean</td>
    <td>No</td>
    <td>Draggable marker</td>
  </tr>
  <tr>
    <td>color</td>
    <td>string</td>
    <td>No</td>
    <td>Marker color</td>
  </tr>
  <tr>
    <td>onClick</td>
    <td>function</td>
    <td>No</td>
    <td>Click handler</td>
  </tr>
  <tr>
    <td>className</td>
    <td>string</td>
    <td>No</td>
    <td>Custom CSS class</td>
  </tr>
</table>

### `<Polygon />` Props

<table>
  <tr>
    <th>Prop</th>
    <th>Type</th>
    <th>Required</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>name</td>
    <td>string</td>
    <td>Yes</td>
    <td>Unique polygon name</td>
  </tr>
  <tr>
    <td>coordinates</td>
    <td>Array&lt;[number, number]&gt;</td>
    <td>Yes</td>
    <td>Polygon coordinates</td>
  </tr>
  <tr>
    <td>type</td>
    <td>"Polygon" | "LineString" | "Point"</td>
    <td>No</td>
    <td>Polygon type</td>
  </tr>
  <tr>
    <td>style</td>
    <td>object</td>
    <td>No</td>
    <td>Polygon style (color, etc)</td>
  </tr>
  <tr>
    <td>onPolygonClick</td>
    <td>function</td>
    <td>No</td>
    <td>Polygon click handler</td>
  </tr>
</table>

### `<Search />` Props

<table>
  <tr>
    <th>Prop</th>
    <th>Type</th>
    <th>Required</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>onSelect</td>
    <td>function</td>
    <td>No</td>
    <td>Called on result select</td>
  </tr>
  <tr>
    <td>onResults</td>
    <td>function</td>
    <td>No</td>
    <td>Called with search results</td>
  </tr>
  <tr>
    <td>placeholder</td>
    <td>string</td>
    <td>No</td>
    <td>Input placeholder</td>
  </tr>
  <tr>
    <td>className</td>
    <td>string</td>
    <td>No</td>
    <td>Custom CSS class</td>
  </tr>
</table>

---

## Hooks

- `useGallimaps()` – Access map instance/context.
- `useGallimapsAPI()` – Programmatic control for markers, polygons, search.
- `useScript()` – Load external scripts.

### Example: Using the API Hook

```tsx
import { useGallimapsAPI } from "react-gallimaps";
import { useEffect } from "react";

function MyComponent() {
  const { displayPinMarker, drawPolygon, isReady } = useGallimapsAPI();

  useEffect(() => {
    if (isReady) {
      displayPinMarker({ position: [27.7, 85.3], color: "blue" });
    }
  }, [isReady, displayPinMarker]);
}
```

---

## TypeScript Support

All components and hooks are fully typed. You can import types from `react-gallimaps` for custom integrations.

---

## License

MIT
