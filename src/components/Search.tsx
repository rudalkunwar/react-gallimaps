import { useState, useCallback, useEffect, useRef } from "react";
import { useGallimapsAPI } from "../hooks/useGallimapsAPI";
import { useOptionalGalliClient } from "../hooks/useGalliClient";
import { SearchProps, SearchResult } from "../types/components";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

const labelOf = (result: SearchResult): string =>
  result.name ?? result.display_name ?? "";

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
  placeholder = "Search locations...",
  className,
  lat,
  lng,
}: SearchProps) => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { autoCompleteSearch, searchData, isReady } = useGallimapsAPI();
  const client = useOptionalGalliClient();
  const useRest = Boolean(client && lat !== undefined && lng !== undefined);

  // Keep consumer callbacks in refs so an inline `onResults`/`onSelect` never
  // changes the identity of `runSearch` (which would re-fire the debounce).
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const runSearch = useCallback(
    async (text: string) => {
      if (text.length < MIN_QUERY_LENGTH) {
        setResults([]);
        onResultsRef.current?.([]);
        return;
      }
      if (!useRest && !isReady) {
        setResults([]);
        onResultsRef.current?.([]);
        return;
      }

      setIsLoading(true);
      try {
        const found: SearchResult[] = useRest
          ? ((await client!.autocomplete({
              word: text,
              lat: lat!,
              lng: lng!,
            })) as unknown as SearchResult[])
          : ((await autoCompleteSearch(text)) as SearchResult[]);
        setResults(found);
        onResultsRef.current?.(found);
      } catch (error) {
        console.error("GalliMaps search failed:", error);
        setResults([]);
        onResultsRef.current?.([]);
      } finally {
        setIsLoading(false);
      }
    },
    [useRest, isReady, client, lat, lng, autoCompleteSearch],
  );

  const handleSelect = async (result: SearchResult) => {
    const label = labelOf(result);
    try {
      if (useRest) {
        await client!.search({ name: label, currentLat: lat!, currentLng: lng! });
      } else {
        await searchData(label);
      }
      onSelectRef.current?.(result);
    } catch (error) {
      console.error("GalliMaps searchData failed:", error);
    }
    setSearchText(label);
    setResults([]);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => runSearch(searchText), DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [searchText, runSearch]);

  return (
    <div className={`gallimap-search ${className ?? ""}`.trim()}>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder={placeholder}
        className="gallimap-search-input"
      />
      {isLoading && <div className="gallimap-search-loading">Searching...</div>}
      {results.length > 0 && (
        <ul className="gallimap-search-results">
          {results.map((result, index) => (
            <li
              key={index}
              onClick={() => handleSelect(result)}
              className="gallimap-search-result"
            >
              {labelOf(result) || "Unknown location"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
