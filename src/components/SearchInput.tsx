import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../hooks/useSearch';
import { SearchFeature, SearchInputProps } from '../types';

export const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = 'Search for places...',
    className = '',
    onSelect,
    disabled = false,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Get current location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => {
                    setCurrentLocation({ lat: 27.7172, lng: 85.3240 }); // Kathmandu
                }
            );
        } else {
            setCurrentLocation({ lat: 27.7172, lng: 85.3240 }); // Kathmandu
        }
    }, []);

    const { data, loading, error, search, clearResults } = useSearch();

    useEffect(() => {
        setShowResults(!!data && data.features.length > 0);
    }, [data]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                resultsRef.current &&
                !resultsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSearch = async () => {
        if (inputValue.trim() && currentLocation) {
            await search(inputValue.trim(), currentLocation.lat, currentLocation.lng);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        } else if (e.key === 'Escape') {
            setShowResults(false);
            clearResults();
        }
    };

    const handleSelect = (feature: SearchFeature) => {
        setInputValue(feature.properties.searchedItem);
        setShowResults(false);
        onSelect?.(feature);
    };

    const formatDistance = (distance: number): string => {
        if (distance < 1000) {
            return `${Math.round(distance)}m`;
        }
        return `${(distance / 1000).toFixed(1)}km`;
    };

    return (
        <div className={`gallimaps-search ${className}`} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={disabled || loading || !inputValue.trim()}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'background-color 0.2s',
                    }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && (
                <div style={{
                    color: '#e74c3c',
                    fontSize: '14px',
                    marginTop: '8px',
                }}>
                    {error}
                </div>
            )}

            {showResults && data && (
                <div
                    ref={resultsRef}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        maxHeight: '400px',
                        overflowY: 'auto',
                        marginTop: '8px',
                    }}
                >
                    {data.features.map((feature, index) => (
                        <div
                            key={`${feature.properties.searchedItem}-${index}`}
                            onClick={() => handleSelect(feature)}
                            style={{
                                padding: '16px',
                                cursor: 'pointer',
                                borderBottom: index < data.features.length - 1 ? '1px solid #f0f0f0' : 'none',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                {feature.properties.searchedItem}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                                {feature.properties.municipality}, {feature.properties.district}
                            </div>
                            <div style={{ fontSize: '12px', color: '#999' }}>
                                Distance: {formatDistance(feature.properties.distance)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 