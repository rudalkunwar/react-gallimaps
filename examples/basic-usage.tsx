/**
 * Minimal end-to-end example.
 *
 * This file is for documentation only — it is not part of the published
 * package and is not type-checked by the library's tsconfig. Copy it into a
 * React app and replace YOUR_TOKEN with a real GalliMaps access token.
 */
import React from "react";
import {
  GallimapsProvider,
  Gallimap,
  Marker,
  Polygon,
  Search,
  type SearchResult,
} from "react-gallimaps";

export default function MapDemo() {
  const handleResultSelect = (result: SearchResult) => {
    console.log("Selected:", result.name ?? result.display_name);
  };

  return (
    <GallimapsProvider>
      <Gallimap
        accessToken="YOUR_TOKEN"
        center={[27.7172, 85.324]}
        zoom={14}
        clickable
        onMapInit={(map) => console.log("Map ready", map)}
      >
        <Marker
          position={[27.7172, 85.324]}
          color="red"
          draggable
          onClick={(marker) => console.log("Marker clicked", marker.position)}
        />

        <Polygon
          name="durbar-square"
          style={{ color: "#2b6cb0", opacity: 0.4 }}
          coordinates={[
            [27.7045, 85.3072],
            [27.705, 85.308],
            [27.7042, 85.3088],
          ]}
        />

        <Search onSelect={handleResultSelect} placeholder="Search Nepal…" />
      </Gallimap>
    </GallimapsProvider>
  );
}
