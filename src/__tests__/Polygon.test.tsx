import React from "react";
import { render } from "@testing-library/react";
import { GallimapsProvider } from "../context/GallimapsContext";
import Gallimap from "../components/Gallimap";
import Polygon from "../components/Polygon";

describe("Polygon", () => {
  it("mounts inside a Gallimap without crashing", () => {
    const { container } = render(
      <GallimapsProvider>
        <Gallimap accessToken="test-token">
          <Polygon
            name="test-area"
            coordinates={[
              [27.7172, 85.324],
              [27.718, 85.325],
              [27.719, 85.323],
            ]}
          />
        </Gallimap>
      </GallimapsProvider>,
    );
    expect(container.querySelector(".gallimap-container")).toBeInTheDocument();
  });
});
