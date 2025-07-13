import React from 'react';
import { render, act } from '@testing-library/react';
import { useGalliMap } from '../src/hooks/useGalliMap';
import { PinMarkerOptions, PolygonOptions } from '../src/types';

// Test component that uses the hook
const TestComponent: React.FC<{
    onHookResult?: (result: ReturnType<typeof useGalliMap>) => void;
}> = ({ onHookResult }) => {
    const hookResult = useGalliMap();

    React.useEffect(() => {
        onHookResult?.(hookResult);
    }, [hookResult, onHookResult]);

    return null;
};

describe('useGalliMap Hook', () => {
    let mockMapRef: any;
    let hookResult: ReturnType<typeof useGalliMap>;

    beforeEach(() => {
        mockMapRef = {
            displayPinMarker: jest.fn(),
            removePinMarker: jest.fn(),
            autoCompleteSearch: jest.fn(),
            searchData: jest.fn(),
            drawPolygon: jest.fn(),
            removePolygon: jest.fn(),
        };
    });

    const renderHook = () => {
        const onHookResult = jest.fn((result) => {
            hookResult = result;
        });

        const { rerender } = render(<TestComponent onHookResult={onHookResult} />);

        return { hookResult, rerender };
    };

    it('returns all expected methods', () => {
        renderHook();

        expect(hookResult).toHaveProperty('mapRef');
        expect(hookResult).toHaveProperty('addMarker');
        expect(hookResult).toHaveProperty('removeMarker');
        expect(hookResult).toHaveProperty('searchPlaces');
        expect(hookResult).toHaveProperty('searchLocation');
        expect(hookResult).toHaveProperty('addPolygon');
        expect(hookResult).toHaveProperty('removePolygon');
    });

    it('addMarker calls displayPinMarker when mapRef is available', () => {
        renderHook();

        // Set the mock mapRef
        hookResult.mapRef.current = mockMapRef;

        const markerOptions: PinMarkerOptions = {
            color: 'red',
            draggable: true,
            latLng: [27.7172, 85.3240]
        };

        act(() => {
            hookResult.addMarker(markerOptions);
        });

        expect(mockMapRef.displayPinMarker).toHaveBeenCalledWith(markerOptions);
    });

    it('removeMarker calls removePinMarker when mapRef is available', () => {
        renderHook();
        hookResult.mapRef.current = mockMapRef;

        const mockMarker = { id: 'marker-1' };

        act(() => {
            hookResult.removeMarker(mockMarker);
        });

        expect(mockMapRef.removePinMarker).toHaveBeenCalledWith(mockMarker);
    });

    it('searchPlaces returns empty array for queries less than 3 characters', async () => {
        renderHook();
        hookResult.mapRef.current = mockMapRef;

        let searchResult;
        await act(async () => {
            searchResult = await hookResult.searchPlaces('ka');
        });

        expect(searchResult).toEqual([]);
        expect(mockMapRef.autoCompleteSearch).not.toHaveBeenCalled();
    });

    it('searchPlaces calls autoCompleteSearch for valid queries', async () => {
        renderHook();
        hookResult.mapRef.current = mockMapRef;

        const mockResults = [{ name: 'Kathmandu', coordinates: [27.7172, 85.3240] }];
        mockMapRef.autoCompleteSearch.mockResolvedValue(mockResults);

        let searchResult;
        await act(async () => {
            searchResult = await hookResult.searchPlaces('kathmandu');
        });

        expect(mockMapRef.autoCompleteSearch).toHaveBeenCalledWith('kathmandu');
        expect(searchResult).toEqual(mockResults);
    });

    it('searchLocation calls searchData', () => {
        renderHook();
        hookResult.mapRef.current = mockMapRef;

        act(() => {
            hookResult.searchLocation('Kathmandu');
        });

        expect(mockMapRef.searchData).toHaveBeenCalledWith('Kathmandu');
    });

    it('addPolygon calls drawPolygon', () => {
        renderHook();
        hookResult.mapRef.current = mockMapRef;

        const polygonOptions: PolygonOptions = {
            name: 'test-polygon',
            color: 'blue',
            opacity: 0.5,
            latLng: [27.7172, 85.3240],
            geoJson: { type: 'Polygon', coordinates: [] }
        };

        act(() => {
            hookResult.addPolygon(polygonOptions);
        });

        expect(mockMapRef.drawPolygon).toHaveBeenCalledWith(polygonOptions);
    });

    it('removePolygon calls removePolygon', () => {
        renderHook();
        hookResult.mapRef.current = mockMapRef;

        act(() => {
            hookResult.removePolygon('test-polygon');
        });

        expect(mockMapRef.removePolygon).toHaveBeenCalledWith('test-polygon');
    });

    it('handles null mapRef gracefully', async () => {
        renderHook();

        // mapRef.current is null by default

        // These should not throw errors
        expect(() => {
            hookResult.addMarker({
                color: 'red',
                draggable: true,
                latLng: [27.7172, 85.3240]
            });
        }).not.toThrow();

        expect(() => {
            hookResult.removeMarker({ id: 'test' });
        }).not.toThrow();

        expect(() => {
            hookResult.searchLocation('test');
        }).not.toThrow();

        expect(() => {
            hookResult.addPolygon({
                name: 'test',
                color: 'blue',
                opacity: 0.5,
                latLng: [27.7172, 85.3240],
                geoJson: {}
            });
        }).not.toThrow();

        expect(() => {
            hookResult.removePolygon('test');
        }).not.toThrow();

        // searchPlaces should return empty array when mapRef is null
        let searchResult;
        await act(async () => {
            searchResult = await hookResult.searchPlaces('kathmandu');
        });
        expect(searchResult).toEqual([]);
    });
});
