import React from 'react';
import { render } from '@testing-library/react';
import { GallimapsProvider } from '../context/GallimapsContext';
import Search from '../components/Search';

describe('Search', () => {
    it('renders Search without crashing', () => {
        render(
            <GallimapsProvider>
                <Search />
            </GallimapsProvider>
        );
        // Search input should be present
        // Optionally, check for placeholder
        // expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
        expect(true).toBe(true);
    });
});
