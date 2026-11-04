import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import { useGallimapsAPI } from "../hooks/useGallimapsAPI";
import { useOptionalGalliClient } from "../hooks/useGalliClient";
import { SearchProps, SearchResult } from "../types/components";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

const labelOf = (result: SearchResult): string =>
  result.name ?? result.display_name ?? "";

const isAbortError = (error: unknown): boolean =>
  (error as { name?: string } | null)?.name === "AbortError";

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

let searchInstance = 0;

/**
 * A debounced autocomplete search box.
 *
 * When a REST client (via `<GallimapsProvider accessToken>`) is available and
 * `lat`/`lng` are provided, it uses the GalliMaps REST autocomplete API and
 * works without a rendered map. Otherwise it falls back to the map plugin's
 * `autoCompleteSearch`/`searchData`.
 *
 * Style via the documented `.gallimap-search*` class names.
 */
const Search = ({
  onSelect,
  onResults,
  onError,
  placeholder = "Search locations...",
  ariaLabel = "Search locations",
  className,
  lat,
  lng,
}: SearchProps) => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listIdRef = useRef<string | null>(null);

  if (!listIdRef.current) {
    searchInstance += 1;
    listIdRef.current = `gallimap-search-list-${searchInstance}`;
  }
  const listId = listIdRef.current;

  const { autoCompleteSearch, searchData, isReady } = useGallimapsAPI();
  const client = useOptionalGalliClient();
  const useRest = Boolean(client && lat !== undefined && lng !== undefined);

  // Keep consumer callbacks in refs so an inline `onResults`/`onSelect` never
  // changes the identity of `runSearch` (which would re-fire the debounce).
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Every request gets a monotonically increasing id. Only the latest request
  // may update state, which prevents a slow older response from overwriting a
  // newer one. REST calls are additionally aborted.
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(
    async (text: string) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      abortRef.current?.abort();
      abortRef.current = null;
      setError(null);

      if (text.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setActiveIndex(-1);
        setIsLoading(false);
        onResultsRef.current?.([]);
        return;
      }
      if (!useRest && !isReady) {
        setResults([]);
        setActiveIndex(-1);
        setIsLoading(false);
        onResultsRef.current?.([]);
        return;
      }

      const controller = useRest ? new AbortController() : null;
      abortRef.current = controller;
      setIsLoading(true);

      try {
        const found = (
          useRest
            ? await client!.autocomplete(
                { word: text, lat: lat!, lng: lng! },
                { signal: controller!.signal },
              )
            : await autoCompleteSearch(text, lat, lng)
        ) as SearchResult[];

        if (requestId !== requestIdRef.current) return;

        setResults(found);
        setActiveIndex(-1);
        onResultsRef.current?.(found);
      } catch (searchError) {
        if (requestId !== requestIdRef.current || isAbortError(searchError)) return;

        const normalized = toError(searchError);
        setError(normalized);
        onErrorRef.current?.(normalized);
        setResults([]);
        setActiveIndex(-1);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          abortRef.current = null;
        }
      }
    },
    [useRest, isReady, client, lat, lng, autoCompleteSearch],
  );

  const handleSelect = async (result: SearchResult) => {
    const label = labelOf(result);
    if (!label) return;

    // A selection supersedes any in-flight autocomplete request.
    requestIdRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setError(null);

    try {
      if (useRest) {
        await client!.search({ name: label, currentLat: lat!, currentLng: lng! });
      } else {
        await searchData(label);
      }
      onSelectRef.current?.(result);
      setSearchText(label);
      setResults([]);
      setActiveIndex(-1);
    } catch (selectError) {
      if (isAbortError(selectError)) return;

      const normalized = toError(selectError);
      setError(normalized);
      onErrorRef.current?.(normalized);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (results.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      if (results.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        event.preventDefault();
        void handleSelect(results[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setResults([]);
      setActiveIndex(-1);
      setError(null);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => void runSearch(searchText), DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [searchText, runSearch]);

  // Abort any request that is still in flight when the component unmounts.
  useEffect(
    () => () => {
      requestIdRef.current += 1;
      abortRef.current?.abort();
    },
    [],
  );

  const activeOptionId = activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined;

  return (
    <div className={`gallimap-search ${className ?? ""}`.trim()}>
      <input
        type="text"
        value={searchText}
        onChange={(event) => {
          setSearchText(event.target.value);
          setActiveIndex(-1);
          setError(null);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="gallimap-search-input"
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-activedescendant={activeOptionId}
        autoComplete="off"
      />
      {isLoading && <div className="gallimap-search-loading">Searching...</div>}
      {error && (
        <div className="gallimap-search-error" role="alert">
          {error.message}
        </div>
      )}
      {results.length > 0 && (
        <ul
          id={listId}
          className="gallimap-search-results"
          role="listbox"
          aria-label={ariaLabel}
        >
          {results.map((result, index) => {
            const label = labelOf(result) || "Unknown location";
            const isActive = index === activeIndex;
            return (
              <li
                key={`${label}-${index}`}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={isActive}
                className={`gallimap-search-result${
                  isActive ? " gallimap-search-result-active" : ""
                }`}
                onClick={() => void handleSelect(result)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Search;
