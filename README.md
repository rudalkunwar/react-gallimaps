# React GalliMaps

[![npm version](https://badge.fury.io/js/react-gallimaps.svg)](https://badge.fury.io/js/react-gallimaps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-48KB-brightgreen.svg)](https://bundlephobia.com/result?p=react-gallimaps)

A comprehensive, professional-grade React library for integrating GalliMaps services including interactive maps, autocomplete search, routing, geocoding, and more with full TypeScript support and accessibility features.

## ✨ Features

- �️ **Interactive Maps** - MapLibre GL integration with custom controls and language support
- � **Smart Autocomplete** - Real-time location search with keyboard navigation and accessibility
- �️ **Routing & Navigation** - Get routes between locations with multiple transport modes
- � **Geocoding Services** - Convert coordinates to addresses and vice versa
- 🎯 **TypeScript Support** - Full type safety and IntelliSense with strict mode
- ♿ **Accessibility First** - ARIA support, keyboard navigation, screen reader friendly
- 🎨 **Customizable UI** - Professional styling with dark mode support
- ⚡ **Performance Optimized** - Only 48KB bundle size, request deduplication, smart caching
- �️ **Robust Error Handling** - Comprehensive error management with retry logic
- 🧪 **Fully Tested** - Comprehensive test suite with Jest and React Testing Library
- 🚀 **Next.js Compatible** - Works seamlessly with Next.js and modern React apps

## 📦 Installation

```bash
# npm
npm install react-gallimaps maplibre-gl axios

# yarn
yarn add react-gallimaps maplibre-gl axios

# pnpm
pnpm add react-gallimaps maplibre-gl axios
```

**Note:** `maplibre-gl` and `axios` are peer dependencies to keep the bundle size optimized.

## 🚀 Quick Start

### 1. Setup Provider

Wrap your app with the `GalliMapsProvider` and import required styles:

```tsx
import { GalliMapsProvider } from "react-gallimaps";
import "maplibre-gl/dist/maplibre-gl.css";

function App() {
  return (
    <GalliMapsProvider 
      accessToken={process.env.REACT_APP_GALLIMAPS_TOKEN}
      config={{
        timeout: 10000,
        retries: 3,
      }}
    >
      <YourComponents />
    </GalliMapsProvider>
  );
}
```

### 2. Use Components

```tsx
import { AutocompleteInput, MapComponent } from "react-gallimaps";
import { useState } from "react";

function LocationSearch() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (result) => {
    console.log("Selected:", result);
    setSelectedLocation(result);
  };

  return (
    <div>
      <AutocompleteInput
        placeholder="Search for a location..."
        onSelect={handleLocationSelect}
        minLength={3}
        debounceMs={300}
        autoFocus
        aria-label="Location search input"
      />

      {selectedLocation && (
        <MapComponent
          center={[selectedLocation.lng, selectedLocation.lat]}
          zoom={15}
          language="en"
          markers={[
            {
              position: [selectedLocation.lng, selectedLocation.lat],
              title: selectedLocation.name,
              onClick: () => console.log("Marker clicked"),
            },
          ]}
          style={{ height: "400px", borderRadius: "8px" }}
        />
      )}
    </div>
  );
}
```

## 📚 API Reference

### Components

#### `GalliMapsProvider`

The main provider component that wraps your app and provides the GalliMaps client with enhanced error handling.

```tsx
<GalliMapsProvider
  accessToken="your-access-token"
  config={{
    baseUrl: "https://route-init.gallimap.com/api/v1",
    timeout: 10000,
    retries: 3,
  }}
>
  {children}
</GalliMapsProvider>
```

**Props:**
- `accessToken` (string, required): Your GalliMaps access token
- `config` (object, optional): Configuration options with retry logic
- `children` (ReactNode, required): Your app components

#### `AutocompleteInput`

Advanced autocomplete input with keyboard navigation, accessibility support, and error handling.

```tsx
<AutocompleteInput
  placeholder="Search locations..."
  onSelect={(result) => console.log(result)}
  onFocus={() => console.log("Focused")}
  onBlur={() => console.log("Blurred")}
  onError={(error) => console.error("Search error:", error)}
  minLength={3}
  debounceMs={300}
  disabled={false}
  autoFocus={false}
  className="custom-autocomplete"
  style={{ width: "100%" }}
  aria-label="Location search"
  aria-describedby="search-help"
/>
```

**Props:**
- `placeholder` (string, optional): Input placeholder text
- `onSelect` (function, optional): Callback when a result is selected
- `onFocus` (function, optional): Callback when input gains focus
- `onBlur` (function, optional): Callback when input loses focus
- `onError` (function, optional): Callback for error handling
- `minLength` (number, optional): Minimum characters before search (default: 3)
- `debounceMs` (number, optional): Debounce delay in milliseconds (default: 300)
- `disabled` (boolean, optional): Whether the input is disabled
- `autoFocus` (boolean, optional): Auto-focus the input on mount
- `className` (string, optional): Additional CSS classes
- `style` (object, optional): Inline styles
- `aria-label` (string, optional): Accessibility label
- `aria-describedby` (string, optional): Associated description element ID

#### `MapComponent`

Interactive map component with markers, routes, language support, and accessibility features.

```tsx
<MapComponent
  center={[85.324, 27.7172]} // [lng, lat]
  zoom={12}
  language="en" // 'en' or 'ne'
  markers={[
    {
      position: [85.324, 27.7172],
      title: "Kathmandu",
      onClick: () => console.log("Marker clicked"),
    },
  ]}
  routes={[
    {
      coordinates: [
        [85.324, 27.7172],
        [85.334, 27.7272],
      ],
      color: "#ff0000",
      width: 4,
    },
  ]}
  className="custom-map"
  style={{ height: "500px" }}
  aria-label="Interactive map"
/>
```

**Props:**
- `center` (array, optional): Map center coordinates [lng, lat]
- `zoom` (number, optional): Map zoom level (default: 12)
- `language` (string, optional): Map language ('en' or 'ne')
- `markers` (array, optional): Array of marker objects
- `routes` (array, optional): Array of route objects
- `className` (string, optional): Additional CSS classes
- `style` (object, optional): Additional inline styles
- `aria-label` (string, optional): Accessibility label

### Hooks

#### `useAutocomplete`

Enhanced hook for autocomplete functionality with error handling and validation.

```tsx
const { data, loading, error, refetch, clear } = useAutocomplete(
  "kathmandu", // search word
  27.7172, // latitude
  85.324, // longitude
  {
    minLength: 3,
    debounceMs: 300,
    enabled: true,
    onSuccess: (results) => console.log("Success:", results),
    onError: (error) => console.error("Error:", error),
  }
);
```

**Returns:**
- `data`: Search results array
- `loading`: Loading state boolean
- `error`: Error object or null
- `refetch`: Function to retry the search
- `clear`: Function to clear results and errors

#### `useRouting`

Hook for routing functionality with comprehensive error handling.

```tsx
const { data, loading, error, getRoute } = useRouting();

// Get route with validation
await getRoute({
  mode: "driving", // 'driving' | 'walking' | 'cycling'
  srcLat: 27.7172,
  srcLng: 85.324,
  dstLat: 27.7272,
  dstLng: 85.334,
});
```

#### `useSearch`

Hook for search functionality with enhanced error handling.

```tsx
const { data, loading, error, search, clearResults } = useSearch();

await search("Kathmandu", 27.7172, 85.324);
```

#### `useReverseGeocoding`

Hook for reverse geocoding with coordinate validation.

```tsx
const { data, loading, error, reverseGeocode, clearResults } = useReverseGeocoding();

await reverseGeocode(27.7172, 85.324);
```

#### `useDistance`

Hook for distance calculation with input validation.

```tsx
const { data, loading, error, getDistance, clearResults } = useDistance();

await getDistance("driving", 27.7172, 85.324, 27.7273, 85.334);
```

### Client API

For direct API access with enhanced error handling and validation:

```tsx
import { GalliMapsClient, validateCoordinates, GalliMapsError } from "react-gallimaps";

const client = new GalliMapsClient({
  accessToken: "your-token",
  timeout: 10000,
  retries: 3,
});

// Validate inputs before API calls
try {
  validateCoordinates(27.7172, 85.324);
  
  const results = await client.autocomplete({
    word: "kathmandu",
    lat: 27.7172,
    lng: 85.324,
  });
  
  console.log("Search results:", results);
} catch (error) {
  if (error instanceof GalliMapsError) {
    console.log("Status:", error.status);
    console.log("Code:", error.code);
    console.log("Details:", error.details);
    console.log("Timestamp:", error.timestamp);
  }
}
```

**Available Methods:**
- `autocomplete(params)` - Get autocomplete suggestions
- `search(params)` - Search for places
- `reverseGeocode(params)` - Get location from coordinates
- `getRoute(params)` - Get routing information
- `getDistance(params)` - Calculate distances

## 🎨 Styling

### Default Styles

The library provides minimal, accessible styling out of the box. For MapLibre integration:

```tsx
import "maplibre-gl/dist/maplibre-gl.css";
```

### Custom Styling

Override component styles with CSS classes:

```css
.gallimaps-autocomplete__input {
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.gallimaps-autocomplete__input:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.gallimaps-autocomplete__dropdown {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  max-height: 300px;
  overflow-y: auto;
}

.gallimaps-autocomplete__item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
}

.gallimaps-autocomplete__item:hover,
.gallimaps-autocomplete__item--highlighted {
  background-color: #f8f9fa;
}

.gallimaps-autocomplete__item:last-child {
  border-bottom: none;
}
```

## 🔧 Error Handling

The library provides comprehensive error handling with custom error types:

```tsx
import { GalliMapsError } from "react-gallimaps";

try {
  await client.autocomplete(params);
} catch (error) {
  if (error instanceof GalliMapsError) {
    switch (error.code) {
      case "INVALID_TOKEN":
        // Handle authentication errors
        console.error("Please check your access token");
        break;
      case "RATE_LIMIT_EXCEEDED":
        // Handle rate limiting
        console.error("Too many requests, please try again later");
        break;
      case "NETWORK_ERROR":
        // Handle network issues
        console.error("Network error, please check your connection");
        break;
      case "VALIDATION_ERROR":
        // Handle input validation errors
        console.error("Invalid input parameters:", error.details);
        break;
      default:
        console.error("An unexpected error occurred:", error.message);
    }
  } else {
    console.error("Non-GalliMaps error:", error);
  }
}
```

**Error Types:**
- `INVALID_TOKEN` - Authentication failure
- `RATE_LIMIT_EXCEEDED` - API rate limit reached
- `NETWORK_ERROR` - Network connectivity issues
- `VALIDATION_ERROR` - Input validation failed
- `API_ERROR` - General API errors
- `TIMEOUT_ERROR` - Request timeout

## 🧪 Testing

The library includes comprehensive test coverage:

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

**Test Coverage Areas:**
- ✅ Input validation utilities (100% coverage)
- ✅ Component rendering and interactions
- ✅ Error handling scenarios
- ✅ Accessibility features
- ✅ Hook functionality

## 📱 Complete Example

```tsx
import React, { useState } from "react";
import {
  GalliMapsProvider,
  AutocompleteInput,
  MapComponent,
  useRouting,
  GalliMapsError,
} from "react-gallimaps";
import "maplibre-gl/dist/maplibre-gl.css";

function LocationApp() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [mapCenter, setMapCenter] = useState([85.324, 27.7172]);
  const [route, setRoute] = useState(null);
  
  const { getRoute, loading: routeLoading, error: routeError } = useRouting();

  const handleLocationSelect = (result) => {
    setSelectedLocation(result);
    const coords = result.geometry.split(",").map(Number);
    setMapCenter([coords[1], coords[0]]); // [lng, lat]
  };

  const handleDestinationSelect = (result) => {
    setDestination(result);
  };

  const calculateRoute = async () => {
    if (!selectedLocation || !destination) return;

    try {
      const startCoords = selectedLocation.geometry.split(",").map(Number);
      const endCoords = destination.geometry.split(",").map(Number);
      
      const routeData = await getRoute({
        mode: "driving",
        srcLat: startCoords[0],
        srcLng: startCoords[1],
        dstLat: endCoords[0],
        dstLng: endCoords[1],
      });
      
      setRoute(routeData);
    } catch (error) {
      if (error instanceof GalliMapsError) {
        console.error("Route calculation failed:", error.message);
      }
    }
  };

  return (
    <GalliMapsProvider accessToken={process.env.REACT_APP_GALLIMAPS_TOKEN}>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>🗺️ Nepal Location Explorer</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label htmlFor="start-search">📍 Starting Location</label>
            <AutocompleteInput
              id="start-search"
              placeholder="Search for starting location..."
              onSelect={handleLocationSelect}
              aria-label="Starting location search"
            />
          </div>
          
          <div>
            <label htmlFor="dest-search">🎯 Destination</label>
            <AutocompleteInput
              id="dest-search"
              placeholder="Search for destination..."
              onSelect={handleDestinationSelect}
              aria-label="Destination search"
            />
          </div>
        </div>

        {selectedLocation && destination && (
          <div style={{ marginBottom: "20px" }}>
            <button 
              onClick={calculateRoute}
              disabled={routeLoading}
              style={{
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: routeLoading ? "not-allowed" : "pointer",
              }}
            >
              {routeLoading ? "Calculating Route..." : "🛣️ Get Route"}
            </button>
            {routeError && (
              <p style={{ color: "red", marginTop: "8px" }}>
                Error: {routeError.message}
              </p>
            )}
          </div>
        )}

        {(selectedLocation || destination) && (
          <div style={{ marginBottom: "20px" }}>
            {selectedLocation && (
              <div style={{ marginBottom: "12px" }}>
                <h3>📍 Starting Point</h3>
                <p><strong>{selectedLocation.name}</strong></p>
                <p>{selectedLocation.district}, {selectedLocation.province}</p>
              </div>
            )}
            {destination && (
              <div>
                <h3>🎯 Destination</h3>
                <p><strong>{destination.name}</strong></p>
                <p>{destination.district}, {destination.province}</p>
              </div>
            )}
          </div>
        )}

        <MapComponent
          center={mapCenter}
          zoom={selectedLocation ? 15 : 12}
          language="en"
          markers={[
            ...(selectedLocation ? [{
              position: mapCenter,
              title: `📍 ${selectedLocation.name}`,
              onClick: () => alert(`Starting point: ${selectedLocation.name}`),
            }] : []),
            ...(destination ? [{
              position: destination.geometry.split(",").map(Number).reverse(),
              title: `🎯 ${destination.name}`,
              onClick: () => alert(`Destination: ${destination.name}`),
            }] : []),
          ]}
          routes={route ? [{
            coordinates: route.data[0].geometry.coordinates,
            color: "#007bff",
            width: 4,
          }] : []}
          style={{ 
            height: "500px", 
            borderRadius: "12px",
            border: "1px solid #e9ecef",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          aria-label="Interactive map showing selected locations and route"
        />

        {route && (
          <div style={{ 
            marginTop: "20px", 
            padding: "16px", 
            backgroundColor: "#f8f9fa", 
            borderRadius: "8px" 
          }}>
            <h3>🛣️ Route Information</h3>
            <p><strong>Distance:</strong> {route.data[0].distance}m</p>
            <p><strong>Duration:</strong> {route.data[0].duration}s</p>
            <p><strong>Mode:</strong> Driving</p>
          </div>
        )}
      </div>
    </GalliMapsProvider>
  );
}

export default LocationApp;
```

## 📊 Performance & Bundle Size

- **Bundle Size**: 48KB (96% reduction from original)
- **Peer Dependencies**: MapLibre GL and Axios externalized
- **Tree Shaking**: Full ES modules support
- **TypeScript**: Strict mode with comprehensive types
- **Accessibility**: WCAG 2.1 AA compliant

## 🔧 Configuration

Configure the library with comprehensive options:

```tsx
<GalliMapsProvider
  accessToken="your-access-token"
  config={{
    baseUrl: "https://route-init.gallimap.com/api/v1",
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
    validateInputs: true,
  }}
>
  {children}
</GalliMapsProvider>
```

**Configuration Options:**
- `accessToken` (string, required): Your GalliMaps access token
- `baseUrl` (string, optional): API base URL
- `timeout` (number, optional): Request timeout in milliseconds (default: 10000)
- `retries` (number, optional): Number of retry attempts (default: 3)
- `retryDelay` (number, optional): Base delay between retries in ms (default: 1000)
- `validateInputs` (boolean, optional): Enable input validation (default: true)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GalliMaps](https://gallimap.com) for the mapping services
- [MapLibre GL](https://maplibre.org/) for the mapping engine  
- [React](https://reactjs.org/) for the component framework

## 📞 Support

- 📧 Email: support@gallimaps.com
- 🐛 [Issue Tracker](https://github.com/gallimaps/react-gallimaps/issues)
- 📖 [Documentation](https://github.com/gallimaps/react-gallimaps/wiki)
- 💬 [Discussions](https://github.com/gallimaps/react-gallimaps/discussions)

## 📋 Changelog

### v1.0.0 - Professional Release

- ✅ **Bundle Optimization**: Reduced from 974KB to 48KB (96% reduction)
- ✅ **Enhanced Error Handling**: Custom error classes with retry logic
- ✅ **Input Validation**: Comprehensive validation utilities
- ✅ **Accessibility**: ARIA support, keyboard navigation, screen reader compatibility
- ✅ **Performance**: React.memo optimization, debounced inputs, smart caching
- ✅ **Testing**: Comprehensive test suite with Jest and React Testing Library
- ✅ **TypeScript**: Strict mode with full type coverage
- ✅ **Components**: AutocompleteInput with advanced features
- ✅ **Maps**: MapLibre GL integration with language support
- ✅ **Hooks**: Enhanced hooks for all API functionality
- ✅ **Documentation**: Professional README with comprehensive examples
