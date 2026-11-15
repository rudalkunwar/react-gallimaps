import React from "react";
import { render } from "@testing-library/react";
import { GallimapsProvider } from "../context/GallimapsContext";
import Gallimap from "../components/Gallimap";
import type { GalliMapPlugin } from "../types";

jest.mock("../hooks/useScript", () => ({
  useScript: () => "ready",
}));

const installFakePlugin = () => {
  const destroy = jest.fn();
  const plugin: GalliMapPlugin = {
    displayPinMarker: jest.fn(),
    removePinMarker: jest.fn(),
    autoCompleteSearch: jest.fn(async () => []),
    searchData: jest.fn(async () => null),
    drawPolygon: jest.fn(),
    removePolygon: jest.fn(),
    destroy,
  };
  const ctor = jest.fn(() => plugin);
  window.GalliMapPlugin = ctor as unknown as Window["GalliMapPlugin"];
  return { ctor, plugin, destroy };
};

describe("Gallimap", () => {
  beforeEach(() => {
    installFakePlugin();
  });

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

  it("destroys the previous map when accessToken changes", () => {
    const { ctor, destroy } = installFakePlugin();
    const { rerender } = render(
      <GallimapsProvider>
        <Gallimap accessToken="token-a" />
      </GallimapsProvider>,
    );

    expect(ctor).toHaveBeenCalledTimes(1);
    expect(destroy).not.toHaveBeenCalled();

    rerender(
      <GallimapsProvider>
        <Gallimap accessToken="token-b" />
      </GallimapsProvider>,
    );

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(ctor).toHaveBeenCalledTimes(2);
  });

  it("destroys the map instance on unmount", () => {
    const { destroy } = installFakePlugin();
    const { unmount } = render(
      <GallimapsProvider>
        <Gallimap accessToken="test-token" />
      </GallimapsProvider>,
    );

    unmount();

    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
