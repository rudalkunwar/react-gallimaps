import React from 'react';
import { render } from '@testing-library/react';
import { GallimapsProvider } from '../context/GallimapsContext';
import Marker from '../components/Marker';

describe('Marker', () => {
    it('renders Marker without crashing', () => {
        render(
            <GallimapsProvider>
                <Marker position={[27.7172, 85.3240]} />
            </GallimapsProvider>
        );
        // Marker is not rendered in DOM, so just ensure no crash
        expect(true).toBe(true);
    });
});
