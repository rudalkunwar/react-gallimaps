import React from "react";
import { render } from "@testing-library/react";
import { GallimapsProvider } from "../context/GallimapsContext";
import Gallimap from "../components/Gallimap";

describe("Gallimap", () => {
  it("renders the map container without crashing", () => {
    const { container } = render(
      <GallimapsProvider>
        <Gallimap accessToken="test-token" />
      </GallimapsProvider>,
    );
    expect(container.querySelector(".gallimap-container")).toBeInTheDocument();
    expect(container.querySelector(".gallimap")).toBeInTheDocument();
  });

  it("renders a panorama container when pano is enabled", () => {
    const { container } = render(
      <GallimapsProvider>
        <Gallimap accessToken="test-token" pano />
      </GallimapsProvider>,
    );
    expect(container.querySelector(".gallimap-pano")).toBeInTheDocument();
  });

  it("renders a share container when shareId is provided", () => {
    const { container } = render(
      <GallimapsProvider>
        <Gallimap accessToken="test-token" shareId="share-1" />
      </GallimapsProvider>,
    );
    expect(container.querySelector(".gallimap-share")).toBeInTheDocument();
  });
});
