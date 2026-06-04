import React from "react";
import { render } from "@testing-library/react";
import { GallimapsProvider } from "../context/GallimapsContext";
import Gallimap from "../components/Gallimap";
import Marker from "../components/Marker";

describe("Marker", () => {
  it("mounts inside a Gallimap without crashing and renders no DOM of its own", () => {
    const { container } = render(
      <GallimapsProvider>
        <Gallimap accessToken="test-token">
          <Marker position={[27.7172, 85.324]} color="red" />
        </Gallimap>
      </GallimapsProvider>,
    );
    // Marker renders null; only the map container exists.
    expect(container.querySelector(".gallimap-container")).toBeInTheDocument();
  });

  it("requires the GallimapsProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Marker position={[27.7172, 85.324]} />)).toThrow(
      /GallimapsProvider/,
    );
    spy.mockRestore();
  });
});
