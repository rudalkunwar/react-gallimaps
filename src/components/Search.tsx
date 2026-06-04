import React, { useState, useCallback, useEffect } from "react";
import { useGallimapsAPI } from "../hooks/useGallimapsAPI";
import { SearchProps, SearchResult } from "../types/components";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

const labelOf = (result: SearchResult): string =>
  result.name ?? result.display_name ?? "";

/**
 * A debounced autocomplete search box wired to the GalliMaps search API.
 * Renders a styled input and result list (override via the documented
 * `.gallimap-search*` class names).
 */
const Search = ({
  onSelect,
  onResults,
  placeholder = "Search locations...",
  className,
}: SearchProps) => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { autoCompleteSearch, searchData, isReady } = useGallimapsAPI();

  const runSearch = useCallback(
    async (text: string) => {
      if (!isReady || text.length < MIN_QUERY_LENGTH) {
        setResults([]);
        onResults?.([]);
        return;
      }

      setIsLoading(true);
      try {
        const found = (await autoCompleteSearch(text)) as SearchResult[];
        setResults(found);
        onResults?.(found);
      } catch (error) {
        console.error("GalliMaps search failed:", error);
        setResults([]);
        onResults?.([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isReady, autoCompleteSearch, onResults],
  );

  const handleSelect = async (result: SearchResult) => {
    const label = labelOf(result);
    try {
      await searchData(label);
      onSelect?.(result);
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
