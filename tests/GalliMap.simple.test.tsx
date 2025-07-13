import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import GalliMap from '../src/components/GalliMap';
import { GalliMapOptions } from '../src/types';

// Mock loadScript utility
jest.mock('../src/utils/loadScript', () => ({
    loadScript: jest.fn(() => Promise.resolve())
}));

describe('GalliMap Component', () => {
    const defaultOptions: GalliMapOptions = {
        accessToken: 'test-token',
        map: {
            center: [27.7172, 85.3240],
            zoom: 13
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        render(<GalliMap options={defaultOptions} />);
        expect(screen.getByTestId('gallimap-loading')).toBeInTheDocument();
        expect(screen.getByText('Loading GalliMaps...')).toBeInTheDocument();
    });

    it('renders map container after loading', async () => {
        render(<GalliMap options={defaultOptions} />);

        await waitFor(() => {
            expect(screen.getByTestId('gallimap-container')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('gallimap-loading')).not.toBeInTheDocument();
    });

    it('applies custom style and className', async () => {
        const customStyle = { width: '500px', height: '300px' };
        const customClassName = 'custom-map-class';

        render(
            <GalliMap
                options={defaultOptions}
                style={customStyle}
                className={customClassName}
            />
        );

        await waitFor(() => {
            const container = screen.getByTestId('gallimap-container');
            expect(container).toHaveStyle(customStyle);
            expect(container).toHaveClass(customClassName);
        });
    });
});
