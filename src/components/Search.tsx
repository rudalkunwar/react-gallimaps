import React, { useState, useCallback, useEffect } from 'react';
import { useGallimapsAPI } from '../hooks/useGalliMaps';
import { SearchProps } from '../types/components';

const Search: React.FC<SearchProps> = ({
    onSelect,
    onResults,
    placeholder = 'Search locations...',
    className
}) => {
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { autoCompleteSearch, searchData, isReady } = useGallimapsAPI();

    const handleSearch = useCallback(async (text: string) => {
        if (!isReady || text.length < 3) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const searchResults = await autoCompleteSearch(text);
            const resultsArray = Array.isArray(searchResults) ? searchResults : [];
            setResults(resultsArray);
            if (onResults) {
                onResults(resultsArray);
            }
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
            if (onResults) {
                onResults([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [isReady, autoCompleteSearch, onResults]);

    const handleSelect = async (result: any) => {
        try {
            // Use searchData to get detailed location data and display on map
            await searchData(result.name || result.toString());

            if (onSelect) {
                onSelect(result);
            }
        } catch (error) {
            console.error('Failed to search data:', error);
        }

        setSearchText(result.name || result.toString());
        setResults([]);
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchText);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchText, handleSearch]);

    return (
        <div className={`gallimap-search ${className || ''}`}>
            <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={placeholder}
                className="gallimap-search-input"
            />
            {isLoading && (
                <div className="gallimap-search-loading">Searching...</div>
            )}
            {results.length > 0 && (
                <ul className="gallimap-search-results">
                    {results.map((result, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(result)}
                            className="gallimap-search-result"
                        >
                            {result.name || result.display_name || result.toString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Search;
