import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { GallimapsProvider } from "../context/GallimapsContext";
import Gallimap from "../components/Gallimap";
import Marker from "../components/Marker";
import type { GalliMapPlugin } from "../types";

jest.mock("../hooks/useScript", () => ({
  useScript: () => "ready",
}));

const installFakePlugin = () => {
  const element = document.createElement("div");
  const displayPinMarker = jest.fn(() => ({ getElement: () => element }));
  const removePinMarker = jest.fn();
  const plugin: GalliMapPlugin = {
    displayPinMarker,
    removePinMarker,
    autoCompleteSearch: jest.fn(async () => []),
    searchData: jest.fn(async () => null),
    drawPolygon: jest.fn(),
    removePolygon: jest.fn(),
  };
  window.GalliMapPlugin = jest.fn(() => plugin) as unknown as Window["GalliMapPlugin"];
  return { element, displayPinMarker, removePinMarker };
};

const renderMarker = (onClick?: () => void) => (
  <GallimapsProvider>
    <Gallimap accessToken="test-token">
      <Marker position={[27.7172, 85.324]} color="red" onClick={onClick} />
    </Gallimap>
  </GallimapsProvider>
);

describe("Marker", () => {
  it("mounts inside a Gallimap without crashing and renders no DOM of its own", () => {
    installFakePlugin();
    const { container } = render(renderMarker());
    // Marker renders null; only the map container exists.
    expect(container.querySelector(".gallimap-container")).toBeInTheDocument();
  });

  it("fires onClick from the marker element itself", () => {
    const { element } = installFakePlugin();
    const onClick = jest.fn();
    render(renderMarker(onClick));

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ position: [27.7172, 85.324] }),
    );
  });

  it("updates the click handler without recreating the pin", () => {
    const { element, displayPinMarker } = installFakePlugin();
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = render(renderMarker(first));

    rerender(renderMarker(second));

    expect(displayPinMarker).toHaveBeenCalledTimes(1);
    fireEvent.click(element);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it("removes the pin and its click listener on unmount", () => {
    const { element, removePinMarker } = installFakePlugin();
    const onClick = jest.fn();
    const { unmount } = render(renderMarker(onClick));

    unmount();
    fireEvent.click(element);

    expect(removePinMarker).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("requires the GallimapsProvider", () => {
    installFakePlugin();
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Marker position={[27.7172, 85.324]} />)).toThrow(
      /GallimapsProvider/,
    );
    spy.mockRestore();
  });
});
