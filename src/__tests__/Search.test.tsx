import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { GallimapsProvider } from "../context/GallimapsContext";
import { GalliApiClient, FetchLike } from "../api/client";
import Search from "../components/Search";

const response = (body: unknown): Awaited<ReturnType<FetchLike>> => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify(body),
});

const ok = (data: unknown) => response({ success: true, message: "ok", data });

type FetchResult = Awaited<ReturnType<FetchLike>>;

const makeRaceFetch = () => {
  let resolveSlow!: (value: FetchResult) => void;
  let resolveFast!: (value: FetchResult) => void;
  const slow = new Promise<FetchResult>((resolve) => {
    resolveSlow = resolve;
  });
  const fast = new Promise<FetchResult>((resolve) => {
    resolveFast = resolve;
  });
  const fetchImpl: FetchLike = async (url) => {
    const word = new URL(url).searchParams.get("word") ?? "";
    return word === "slo" ? slow : fast;
  };
  return { fetchImpl, resolveSlow, resolveFast };
};

const clientFor = (fetchImpl: FetchLike) =>
  new GalliApiClient({ accessToken: "test-token", fetch: fetchImpl });

describe("Search", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the search input with the default placeholder", () => {
    render(
      <GallimapsProvider>
        <Search />
      </GallimapsProvider>,
    );
    expect(screen.getByPlaceholderText(/search locations/i)).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Search locations" }),
    ).toBeInTheDocument();
  });

  it("renders a custom placeholder and accessible name", () => {
    render(
      <GallimapsProvider>
        <Search placeholder="Find a place" ariaLabel="Find an address" />
      </GallimapsProvider>,
    );
    expect(screen.getByPlaceholderText("Find a place")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Find an address" })).toBeInTheDocument();
  });

  it("ignores a stale autocomplete response", async () => {
    jest.useFakeTimers();
    const { fetchImpl, resolveSlow, resolveFast } = makeRaceFetch();
    render(
      <GallimapsProvider client={clientFor(fetchImpl)}>
        <Search lat={27.7172} lng={85.324} />
      </GallimapsProvider>,
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "slo" } });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    fireEvent.change(input, { target: { value: "fast" } });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await act(async () => {
      resolveFast(ok([{ name: "FAST" }]));
      await Promise.resolve();
    });
    expect(screen.getByText("FAST")).toBeInTheDocument();

    await act(async () => {
      resolveSlow(ok([{ name: "SLO" }]));
      await Promise.resolve();
    });
    expect(screen.queryByText("SLO")).not.toBeInTheDocument();
    expect(screen.getByText("FAST")).toBeInTheDocument();
  });

  it("shows an error and calls onError when autocomplete fails", async () => {
    jest.useFakeTimers();
    const onError = jest.fn();
    const fetchImpl: FetchLike = async () =>
      response({ success: false, message: "Unauthorized" });

    render(
      <GallimapsProvider client={clientFor(fetchImpl)}>
        <Search lat={27.7172} lng={85.324} onError={onError} />
      </GallimapsProvider>,
    );

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "fail" } });
    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Unauthorized");
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Unauthorized" }),
    );
  });

  it("supports keyboard selection of results", async () => {
    jest.useFakeTimers();
    const onSelect = jest.fn();
    const fetchImpl: FetchLike = async (url) => {
      if (url.includes("/search/autocomplete")) {
        return ok([{ name: "Kathmandu" }]);
      }
      if (url.includes("/search/currentLocation")) {
        return ok({ type: "FeatureCollection", features: [] });
      }
      return ok(null);
    };

    render(
      <GallimapsProvider client={clientFor(fetchImpl)}>
        <Search lat={27.7172} lng={85.324} onSelect={onSelect} />
      </GallimapsProvider>,
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "kat" } });
    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(input).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("option", { name: "Kathmandu" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
      await Promise.resolve();
    });

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: "Kathmandu" }));
  });
});
