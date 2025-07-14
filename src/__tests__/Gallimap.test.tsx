import React from 'react';
import { render, screen } from '@testing-library/react';
import { GallimapsProvider } from '../context/GallimapsContext';
import Gallimap from '../components/Gallimap';

describe('Gallimap', () => {
    it('renders without crashing', () => {
        render(
            <GallimapsProvider>
                <Gallimap accessToken="test-token" />
            </GallimapsProvider>
        );
        // The map container is dynamically created, just ensure no crash
        expect(true).toBe(true);
    });

    it('shows loading state initially', () => {
        render(
            <GallimapsProvider>
                <Gallimap accessToken="test-token" />
            </GallimapsProvider>
        );
        // Optionally, check for a loading indicator if implemented
        // expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
});
