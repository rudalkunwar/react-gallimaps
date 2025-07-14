# React GalliMaps

<table>
  <tr>
    <td><img src="https://img.shields.io/npm/v/react-gallimaps?style=flat-square&color=blue" alt="npm version"></td>
    <td><img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square" alt="TypeScript"></td>
    <td><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"></td>
    <td><img src="https://img.shields.io/npm/dm/react-gallimaps?style=flat-square" alt="Downloads"></td>
  </tr>
</table>

A modern React wrapper for **GalliMaps** - Nepal's leading mapping platform. Build interactive maps with ease using React components and hooks.

## 🚀 Installation

```bash
npm install react-gallimaps
```

## 📋 Prerequisites

<table>
  <tr>
    <th>Requirement</th>
    <th>Version</th>
    <th>Notes</th>
  </tr>
  <tr>
    <td>≥ 16.8.0</td>
    <td>Hooks support required</td>
  </tr>
  <tr>
    <td>GalliMaps Token</td>
    <td>-</td>
    <td>Get from <a href="https://gallimap.com">gallimap.com</a></td>
  </tr>
  <tr>
    <td>TypeScript (optional)</td>
    <td>≥ 4.0</td>
    <td>Full type definitions included</td>
  </tr>
</table>

## 🎯 Quick Start

### Basic Map

```tsx
import React from "react";
import { GalliMap } from "react-gallimaps";

function MyMap() {
  const mapOptions = {
    accessToken: "your-token-here",
    map: {
      center: [85.324, 27.7172], // [longitude, latitude] for Kathmandu
      zoom: 13,
    },
  };

  return (
    <GalliMap
      options={mapOptions}
      style={{ width: "100%", height: "400px" }}
      onMapLoad={(map) => console.log("Map ready!")}
      onMapError={(error) => console.error("Map error:", error)}
    />
  );
}
```

### Interactive Map with Hooks

```tsx
import React from "react";
import { GalliMap, useGalliMap } from "react-gallimaps";

function InteractiveMap() {
  const {
    mapRef,
    addMarker,
    removeMarker,
    searchPlaces,
    addPolygon,
    removePolygon,
  } = useGalliMap();


  const mapOptions = {
    accessToken: "your-token-here",
    map: {
      center: [85.324, 27.7172],
      zoom: 13,
    },
  };

  // Add a marker
  const handleAddMarker = () => {
    const marker = addMarker({
    console.log("Marker added:", marker);
  };

  // Search for places
  const handleSearch = async () => {
    const results = await searchPlaces("Kathmandu");
    console.log("Search results:", results);
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={handleAddMarker}>Add Marker</button>
        <button onClick={handleSearch}>Search Places</button>
      </div>

      <GalliMap
        ref={mapRef}
        options={mapOptions}
        style={{ width: "100%", height: "400px" }}
      />
    </div>
  );
}
```

## 📚 API Reference

### GalliMap Component

<table>
  <tr>
    <th>Prop</th>
    <th>Type</th>
    <th>Required</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>options</code></td>
    <td><code>GalliMapOptions</code></td>
    <td>✅</td>
    <td>Map configuration including token and center</td>
  </tr>
  <tr>
    <td><code>style</code></td>
    <td><code>CSSProperties</code></td>
    <td>❌</td>
    <td>CSS styles for map container</td>
  </tr>
  <tr>
    <td><code>className</code></td>
    <td><code>string</code></td>
    <td>❌</td>
    <td>CSS class for map container</td>
  </tr>
  <tr>
    <td><code>onMapLoad</code></td>
    <td><code>(map: any) => void</code></td>
    <td>❌</td>
    <td>Callback when map loads successfully</td>
  </tr>
  <tr>
    <td><code>onMapError</code></td>
    <td><code>(error: Error) => void</code></td>
    <td>❌</td>
    <td>Callback when map fails to load</td>
  </tr>
  <tr>
    <td><code>panoStyle</code></td>
    <td><code>CSSProperties</code></td>
    <td>❌</td>
    <td>CSS styles for panorama container</td>
  </tr>
  <tr>
    <td><code>panoClassName</code></td>
    <td><code>string</code></td>
    <td>❌</td>
    <td>CSS class for panorama container</td>
  </tr>
</table>

<table>
  <tr>
    <th>Method</th>
  <tr>
    <td><code>mapRef</code></td>
    <td>-</td>
    <td><code>RefObject</code></td>
    <td>Ref to attach to GalliMap component</td>
  </tr>
  <tr>
    <td><code>addMarker</code></td>
    <td><code>PinMarkerOptions</code></td>
    <td><code>Marker</code></td>
    <td>Add a marker to the map</td>
  </tr>
  <tr>
    <td><code>removeMarker</code></td>
    <td><code>Marker</code></td>
    <td><code>void</code></td>
    <td>Remove a marker from the map</td>
  </tr>
  <tr>
    <td><code>searchPlaces</code></td>
    <td><code>string</code></td>
    <td><code>Promise&lt;Array&gt;</code></td>
    <td>Search for places (min 3 characters)</td>
  </tr>
  <tr>
    <td><code>searchLocation</code></td>
    <td><code>string</code></td>
    <td><code>void</code></td>
    <td>Search and navigate to location</td>
  </tr>
  <tr>
    <td><code>addPolygon</code></td>
    <td><code>PolygonOptions</code></td>
    <td><code>void</code></td>
    <td>Draw a polygon on the map</td>
  </tr>
  <tr>
    <td><code>removePolygon</code></td>
    <td><code>string</code></td>
    <td><code>void</code></td>
    <td>Remove polygon by name</td>
  </tr>
</table>

### Configuration Types

#### GalliMapOptions

```typescript
interface GalliMapOptions {
  accessToken: string; // Your GalliMaps API token
  map: {
    center: [number, number]; // [longitude, latitude]
    zoom: number; // Zoom level (1-20)
    container?: string; // Auto-generated if not provided
    maxZoom?: number; // Maximum zoom level
    minZoom?: number; // Minimum zoom level
    clickable?: boolean; // Enable map clicks
  };
  pano?: {
    // Optional panorama view
    container?: string; // Auto-generated if not provided
  };
  customClickFunctions?: Array<(event: any) => void>; // Custom click handlers
}
```

#### PinMarkerOptions

```typescript
interface PinMarkerOptions {
  color: string; // Marker color (hex, rgb, named)
  draggable: boolean; // Can marker be dragged
  latLng: [number, number]; // [longitude, latitude]
}
```

#### PolygonOptions

```typescript
interface PolygonOptions {
  name: string; // Unique polygon identifier
  color: string; // Fill color
  opacity: number; // Opacity (0-1)
  latLng: [number, number]; // Center point
  geoJson: any; // GeoJSON polygon data
  height?: number; // 3D height
  width?: number; // Border width
  radius?: number; // For circular polygons
}
```

## 🛠️ Examples

### Map with Panorama View

```tsx
function PanoramaMap() {
  const mapOptions = {
    accessToken: "your-token",
    map: {
      center: [85.324, 27.7172],
      zoom: 13,
    },
    pano: {}, // Enable panorama
  };

  return (
    <div>
      <GalliMap
        options={mapOptions}
        style={{ width: "100%", height: "400px" }}
        panoStyle={{ width: "100%", height: "300px" }}
      />
    </div>
  );
}
```

### Search and Add Markers

```tsx
function SearchableMap() {
  const { mapRef, addMarker, searchPlaces } = useGalliMap();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    if (searchQuery.length >= 3) {
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
    }
  };

  const addMarkerFromResult = (result) => {
    addMarker({
      color: "#00ff00",
      draggable: false,
      latLng: [result.longitude, result.latitude],
    });
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search places..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {searchResults.map((result, index) => (
        <div key={index} style={{ margin: "5px 0" }}>
          <span>{result.name}</span>
          <button onClick={() => addMarkerFromResult(result)}>
            Add Marker
          </button>
        </div>
      ))}

      <GalliMap
        ref={mapRef}
        options={{
          accessToken: "your-token",
          map: { center: [85.324, 27.7172], zoom: 13 },
        }}
        style={{ width: "100%", height: "400px" }}
      />
    </div>
  );
}
```

### Custom Styling

```tsx
function StyledMap() {
  return (
    <GalliMap
      options={{
        accessToken: "your-token",
        map: { center: [85.324, 27.7172], zoom: 13 },
      }}
      className="my-custom-map"
      style={{
        width: "100%",
        height: "500px",
        border: "2px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    />
  );
}
```

## 🚨 Error Handling

The component includes built-in error handling:

```tsx
function SafeMap() {
  const handleMapError = (error) => {
    // Log error to your monitoring service
    console.error("Map initialization failed:", error);

    // Show user-friendly message
    alert("Map failed to load. Please check your internet connection.");
  };

  return (
    <GalliMap
      options={{
        accessToken: "your-token",
        map: { center: [85.324, 27.7172], zoom: 13 },
      }}
      onMapError={handleMapError}
      style={{ width: "100%", height: "400px" }}
    />
  );
}
```

## 🔧 Troubleshooting

<table>
  <tr>
    <th>Issue</th>
    <th>Cause</th>
    <th>Solution</th>
  </tr>
  <tr>
    <td>Map not loading</td>
    <td>Invalid or missing access token</td>
    <td>Verify your token at <a href="https://gallimap.com">gallimap.com</a></td>
  </tr>
  <tr>
    <td>TypeScript errors</td>
    <td>Missing type definitions</td>
    <td>Install <code>@types/react</code> and <code>@types/react-dom</code></td>
  </tr>
  <tr>
    <td>Build fails</td>
    <td>Bundler configuration</td>
    <td>Ensure your bundler supports ES modules</td>
  </tr>
  <tr>
    <td>Markers not appearing</td>
    <td>Incorrect coordinates</td>
    <td>Use [longitude, latitude] format</td>
  </tr>
  <tr>
    <td>Search not working</td>
    <td>Query too short</td>
    <td>Use minimum 3 characters for search</td>
  </tr>
</table>

## 📱 Browser Support

<table>
  <tr>
    <th>Browser</th>
    <th>Minimum Version</th>
    <th>Notes</th>
  </tr>
  <tr>
    <td>Chrome</td>
    <td>60+</td>
    <td>Full support</td>
  </tr>
  <tr>
    <td>Firefox</td>
    <td>55+</td>
    <td>Full support</td>
  </tr>
  <tr>
    <td>Safari</td>
    <td>12+</td>
    <td>Full support</td>
  </tr>
  <tr>
    <td>Edge</td>
    <td>79+</td>
    <td>Full support</td>
  </tr>
</table>

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

<table>
  <tr>
    <td><strong>Documentation</strong></td>
    <td><a href="https://gallimap.com/docs">GalliMaps Official Docs</a></td>
  </tr>
  <tr>
    <td><strong>Issues</strong></td>
    <td><a href="https://github.com/rudalkunwar/react-gallimaps/issues">GitHub Issues</a></td>
  </tr>
  <tr>
    <td><strong>NPM Package</strong></td>
    <td><a href="https://www.npmjs.com/package/react-gallimaps">npm registry</a></td>
  </tr>
</table>

---

Made with ❤️ for the Nepal developer community
);
}

```

```
