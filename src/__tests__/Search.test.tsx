import React from "react";
import { render, screen } from "@testing-library/react";
import { GallimapsProvider } from "../context/GallimapsContext";
import Search from "../components/Search";

describe("Search", () => {
  it("renders the search input with the default placeholder", () => {
    render(
      <GallimapsProvider>
        <Search />
      </GallimapsProvider>,
    );
    expect(screen.getByPlaceholderText(/search locations/i)).toBeInTheDocument();
  });

  it("renders a custom placeholder", () => {
    render(
      <GallimapsProvider>
        <Search placeholder="Find a place" />
      </GallimapsProvider>,
    );
    expect(screen.getByPlaceholderText("Find a place")).toBeInTheDocument();
  });
});
