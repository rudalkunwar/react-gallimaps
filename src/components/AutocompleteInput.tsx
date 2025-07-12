import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { AutocompleteResult, AutocompleteInputProps } from '../types';

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    placeholder = 'Search for a location...',
    className = '',
    onSelect,
    minLength = 3,
    debounceMs = 300,
    disabled = false,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Get current location with error handling
    useEffect(() => {
        let isMounted = true;

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser');
            setCurrentLocation({ lat: 27.7172, lng: 85.3240 }); // Kathmandu fallback
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (isMounted) {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocationError(null);
                }
            },
            (error) => {
                if (isMounted) {
                    console.warn('Geolocation error:', error.message);
                    setLocationError(error.message);
                    // Default to Kathmandu if geolocation fails
                    setCurrentLocation({ lat: 27.7172, lng: 85.3240 });
                }
            },
            options
        );

        return () => {
            isMounted = false;
        };
    }, []);

    const { data, loading, error } = useAutocomplete(
        inputValue,
        currentLocation?.lat || 0,
        currentLocation?.lng || 0,
        {
            minLength,
            debounceMs,
            enabled: !!currentLocation && !disabled,
        }
    );

    const results = useMemo(() => data || [], [data]);

    useEffect(() => {
        setShowDropdown(results.length > 0 && !loading && inputValue.length >= minLength);
        setSelectedIndex(-1);
    }, [results, loading, inputValue.length, minLength]);

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, results.length);
    }, [results.length]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setSelectedIndex(-1);
    }, []);

    const handleSelect = useCallback((result: AutocompleteResult) => {
        setInputValue(result.name);
        setShowDropdown(false);
        setSelectedIndex(-1);
        onSelect?.(result);
    }, [onSelect]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!showDropdown) {
            if (e.key === 'ArrowDown' && results.length > 0) {
                e.preventDefault();
                setShowDropdown(true);
                setSelectedIndex(0);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleSelect(results[selectedIndex]!);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
            case 'Tab':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    }, [showDropdown, results, selectedIndex, handleSelect]);

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [selectedIndex]);

    const clearInput = useCallback(() => {
        setInputValue('');
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    }, []);

    return (
        <div className={`gallimaps-autocomplete ${className}`} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    aria-activedescendant={selectedIndex >= 0 ? `option-${selectedIndex}` : undefined}
                    style={{
                        width: '100%',
                        padding: '12px 40px 12px 16px',
                        border: `1px solid ${error ? '#e74c3c' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: showDropdown ? '0 0 0 2px rgba(74, 144, 226, 0.2)' : 'none',
                    }}
                    onFocus={() => {
                        if (results.length > 0) {
                            setShowDropdown(true);
                        }
                    }}
                />

                {inputValue && (
                    <button
                        type="button"
                        onClick={clearInput}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#666',
                            fontSize: '18px',
                            lineHeight: 1,
                        }}
                        aria-label="Clear input"
                    >
                        ×
                    </button>
                )}

                {loading && (
                    <div style={{
                        position: 'absolute',
                        right: inputValue ? '32px' : '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666',
                        fontSize: '14px',
                    }}>
                        Loading...
                    </div>
                )}
            </div>

            {error && (
                <div style={{
                    color: '#e74c3c',
                    fontSize: '14px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }}>
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            {locationError && (
                <div style={{
                    color: '#f39c12',
                    fontSize: '12px',
                    marginTop: '2px',
                }}>
                    Using default location due to: {locationError}
                </div>
            )}

            {showDropdown && results.length > 0 && (
                <div
                    ref={dropdownRef}
                    role="listbox"
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
                        maxHeight: '300px',
                        overflowY: 'auto',
                        marginTop: '4px',
                    }}
                >
                    {results.map((result, index) => (
                        <div
                            key={result.id}
                            ref={el => itemRefs.current[index] = el}
                            role="option"
                            id={`option-${index}`}
                            aria-selected={selectedIndex === index}
                            onClick={() => handleSelect(result)}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                borderBottom: index < results.length - 1 ? '1px solid #f0f0f0' : 'none',
                                transition: 'background-color 0.2s',
                                backgroundColor: selectedIndex === index ? '#f8f9fa' : 'white',
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                {result.name}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                {result.district}, {result.province}
                            </div>
                            <div style={{ fontSize: '12px', color: '#999' }}>
                                Distance: {result.distance}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 